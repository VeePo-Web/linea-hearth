import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutItem {
  productId?: string;
  variantId?: string;
  name: string;
  image?: string;
  price: number; // CAD dollars
  quantity: number;
  size?: string;
  color?: string;
}

interface RequestBody {
  items: CheckoutItem[];
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  shippingAddress: { address: string; city: string; postalCode: string; country: string };
  shippingMethod?: "standard" | "express" | "overnight";
  discountCodeId?: string;
  abandonedCartId?: string;
  returnUrl: string;
  environment?: StripeEnv;
}

const SHIPPING_RATES = {
  standard: 1000,
  express: 1500,
  overnight: 3500,
} as const;

const FREE_SHIPPING_THRESHOLD_CENTS = 9900;

let cachedGstTaxRateId: string | null = null;
async function getOrCreateGstTaxRate(
  stripe: ReturnType<typeof createStripeClient>,
): Promise<string> {
  if (cachedGstTaxRateId) return cachedGstTaxRateId;
  const existing = await stripe.taxRates.list({ active: true, limit: 100 });
  const match = existing.data.find((r) => r.metadata?.kind === "linea_gst_5");
  if (match) {
    cachedGstTaxRateId = match.id;
    return match.id;
  }
  const created = await stripe.taxRates.create({
    display_name: "GST",
    description: "Canadian GST",
    jurisdiction: "CA",
    country: "CA",
    percentage: 5,
    inclusive: false,
    metadata: { kind: "linea_gst_5" },
  });
  cachedGstTaxRateId = created.id;
  return created.id;
}

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string | undefined> {
  if (!options.email && !options.userId) return undefined;
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.items?.length) {
      return new Response(JSON.stringify({ success: false, error: "No items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.customerEmail || !body.returnUrl) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const environment: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const stripe = createStripeClient(environment);

    // Auth: try to resolve userId from JWT
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
        );
        const { data } = await sb.auth.getClaims(authHeader.replace("Bearer ", ""));
        if (data?.claims?.sub) userId = data.claims.sub as string;
      } catch (_) {
        // anonymous checkout is fine
      }
    }

    const gstTaxRateId = await getOrCreateGstTaxRate(stripe);

    // Build Stripe line items using inline price_data (apparel = tangible goods)
    const lineItems = body.items.map((item) => {
      const unitAmount = Math.round(item.price * 100);
      const descriptionBits = [item.size, item.color].filter(Boolean).join(" / ");
      return {
        price_data: {
          currency: "cad",
          unit_amount: unitAmount,
          product_data: {
            name: item.name + (descriptionBits ? ` (${descriptionBits})` : ""),
            ...(item.image && { images: [item.image] }),
            metadata: {
              ...(item.productId && { productId: item.productId }),
              ...(item.variantId && { variantId: item.variantId }),
              ...(item.size && { size: item.size }),
              ...(item.color && { color: item.color }),
            },
          },
        },
        quantity: item.quantity,
        tax_rates: [gstTaxRateId],
      };
    });

    // Subtotal for shipping threshold
    const subtotalCents = body.items.reduce(
      (sum, it) => sum + Math.round(it.price * 100) * it.quantity,
      0,
    );
    const method = body.shippingMethod ?? "standard";
    const isFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS && method === "standard";
    const shippingAmount = isFreeShipping ? 0 : SHIPPING_RATES[method];

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: body.customerEmail,
      userId,
    });

    // Create a draft order BEFORE the Stripe session so the webhook can match by session id
    const sbAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await sbAdmin
      .from("orders")
      .insert({
        user_id: userId ?? null,
        status: "pending",
        payment_status: "unpaid",
        customer_email: body.customerEmail,
        customer_first_name: body.customerFirstName ?? null,
        customer_last_name: body.customerLastName ?? null,
        customer_phone: body.customerPhone ?? null,
        shipping_address: body.shippingAddress,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingAmount,
        discount_cents: 0,
        tax_cents: 0,
        total_cents: subtotalCents + shippingAmount,
        currency: "cad",
        shipping_method: method,
        metadata: { abandonedCartId: body.abandonedCartId ?? null },
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Failed to create draft order", orderErr);
      return new Response(
        JSON.stringify({ success: false, error: "Could not create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Insert order_items
    await sbAdmin.from("order_items").insert(
      body.items.map((it) => ({
        order_id: order.id,
        product_id: it.productId || null,
        variant_id: it.variantId || null,
        product_name: it.name,
        product_image_url: it.image || null,
        variant_size: it.size || null,
        variant_color: it.color || null,
        unit_price_cents: Math.round(it.price * 100),
        quantity: it.quantity,
        total_cents: Math.round(it.price * 100) * it.quantity,
      })),
    );

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      ...(customerId && { customer: customerId }),
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: ["CA", "US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingAmount, currency: "cad" },
            display_name: isFreeShipping
              ? "Free shipping"
              : method === "standard"
                ? "Standard (5-9 days)"
                : method === "express"
                  ? "Express (2-3 days)"
                  : "Overnight",
            tax_behavior: "exclusive",
          },
        },
      ],
      payment_intent_data: {
        description: `Linea Hearth order ${order.id}`,
        metadata: {
          orderId: order.id,
          ...(userId && { userId }),
        },
      },
      metadata: {
        orderId: order.id,
        ...(userId && { userId }),
      },
    });

    // Stamp the session id on the order
    await sbAdmin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: session.client_secret,
        orderId: order.id,
        sessionId: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-checkout-session error", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
