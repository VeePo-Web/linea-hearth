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
// Stripe tax_code for general clothing (apparel). See https://docs.stripe.com/tax/tax-codes
const APPAREL_TAX_CODE = "txcd_30060001";

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

    const sbAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

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

    // === SERVER-SIDE PRICE AUTHORITY ===
    // Never trust client-provided prices. Rebuild every line item's unit_amount
    // from the products / product_variants tables. Reject if a productId is
    // missing, inactive, or if the client price diverges by >0¢.
    const productIds = Array.from(new Set(body.items.map((it) => it.productId).filter(Boolean))) as string[];
    if (productIds.length !== body.items.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Every line item must reference a product." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: dbProducts, error: prodErr } = await sbAdmin
      .from("products")
      .select("id, name, price, sale_price, is_on_sale, status")
      .in("id", productIds);
    if (prodErr || !dbProducts) {
      console.error("Failed to load products for price authority", prodErr);
      return new Response(
        JSON.stringify({ success: false, error: "Could not validate cart" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const variantIds = Array.from(new Set(body.items.map((it) => it.variantId).filter(Boolean))) as string[];
    const variantsById: Record<string, { id: string; product_id: string; price_adjustment: number | null }> = {};
    if (variantIds.length) {
      const { data: dbVariants } = await sbAdmin
        .from("product_variants")
        .select("id, product_id, price_adjustment")
        .in("id", variantIds);
      for (const v of dbVariants ?? []) variantsById[v.id] = v as any;
    }

    const productsById: Record<string, typeof dbProducts[number]> = {};
    for (const p of dbProducts) productsById[p.id] = p;

    type AuthorizedItem = { item: CheckoutItem; unitAmountCents: number };
    const authorized: AuthorizedItem[] = [];
    for (const item of body.items) {
      const prod = productsById[item.productId!];
      if (!prod || prod.status !== "active") {
        return new Response(
          JSON.stringify({ success: false, error: `Item unavailable: ${item.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const basePrice = prod.is_on_sale && prod.sale_price != null
        ? Number(prod.sale_price)
        : Number(prod.price);
      let variantAdjustment = 0;
      if (item.variantId) {
        const v = variantsById[item.variantId];
        if (!v || v.product_id !== prod.id) {
          return new Response(
            JSON.stringify({ success: false, error: `Invalid variant for ${prod.name}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        variantAdjustment = Number(v.price_adjustment ?? 0);
      }
      const authorizedDollars = basePrice + variantAdjustment;
      const unitAmountCents = Math.round(authorizedDollars * 100);
      const clientCents = Math.round(item.price * 100);
      if (clientCents !== unitAmountCents) {
        console.warn("Price tampering blocked", {
          productId: prod.id,
          clientCents,
          authorizedCents: unitAmountCents,
        });
        return new Response(
          JSON.stringify({
            success: false,
            error: "Cart prices are out of date. Please refresh and try again.",
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (item.quantity < 1 || item.quantity > 50) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid quantity" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      authorized.push({ item, unitAmountCents });
    }

    const lineItems = authorized.map(({ item, unitAmountCents }) => {
      const descriptionBits = [item.size, item.color].filter(Boolean).join(" / ");
      return {
        price_data: {
          currency: "cad",
          unit_amount: unitAmountCents,
          tax_behavior: "exclusive" as const,
          product_data: {
            name: item.name + (descriptionBits ? ` (${descriptionBits})` : ""),
            ...(item.image && { images: [item.image] }),
            tax_code: APPAREL_TAX_CODE,
            metadata: {
              ...(item.productId && { productId: item.productId }),
              ...(item.variantId && { variantId: item.variantId }),
              ...(item.size && { size: item.size }),
              ...(item.color && { color: item.color }),
            },
          },
        },
        quantity: item.quantity,
      };
    });

    // Subtotal from SERVER-AUTHORIZED prices, not client input.
    const subtotalCents = authorized.reduce(
      (sum, { item, unitAmountCents }) => sum + unitAmountCents * item.quantity,
      0,
    );
    const method = body.shippingMethod ?? "standard";
    const isFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS && method === "standard";
    const shippingAmount = isFreeShipping ? 0 : SHIPPING_RATES[method];

    // Resolve + create discount (one-off Stripe coupon) if a valid code was applied
    let stripeDiscounts: Array<{ coupon: string }> | undefined;
    let discountCents = 0;
    let discountCodeText: string | undefined;
    if (body.discountCodeId) {
      const { data: dc } = await sbAdmin
        .from("discount_codes")
        .select("id, code, name, discount_type, discount_value, maximum_discount_cents, is_active, starts_at, expires_at")
        .eq("id", body.discountCodeId)
        .maybeSingle();
      const now = new Date();
      const valid =
        dc &&
        dc.is_active &&
        (!dc.starts_at || new Date(dc.starts_at) <= now) &&
        (!dc.expires_at || new Date(dc.expires_at) > now);
      if (valid) {
        discountCodeText = dc.code;
        if (dc.discount_type === "percentage") {
          const rawPercentCents = Math.round((subtotalCents * Number(dc.discount_value)) / 100);
          const capped = dc.maximum_discount_cents
            ? Math.min(rawPercentCents, dc.maximum_discount_cents)
            : rawPercentCents;
          discountCents = capped;
          // If a cap is set, pin Stripe to amount_off so the dashboard total
          // matches our DB row. Otherwise let Stripe apply the percent natively.
          const coupon = dc.maximum_discount_cents
            ? await stripe.coupons.create({
                amount_off: capped,
                currency: "cad",
                duration: "once",
                name: dc.name,
              })
            : await stripe.coupons.create({
                percent_off: Number(dc.discount_value),
                duration: "once",
                name: dc.name,
              });
          stripeDiscounts = [{ coupon: coupon.id }];
        } else {
          const amountOff = Math.min(Math.round(Number(dc.discount_value)), subtotalCents);
          discountCents = amountOff;
          const coupon = await stripe.coupons.create({
            amount_off: amountOff,
            currency: "cad",
            duration: "once",
            name: dc.name,
          });

          stripeDiscounts = [{ coupon: coupon.id }];
        }
      }
    }

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: body.customerEmail,
      userId,
    });

    // Create draft order BEFORE Stripe session so the webhook can match by session id
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
        shipping_address: body.shippingAddress, // overwritten by webhook from Stripe's collected address
        subtotal_cents: subtotalCents,
        shipping_cents: shippingAmount,
        discount_cents: discountCents,
        tax_cents: 0, // filled by webhook from Stripe Tax
        total_cents: subtotalCents + shippingAmount - discountCents,
        currency: "cad",
        shipping_method: method,
        discount_code: discountCodeText ?? null,
        discount_id: body.discountCodeId ?? null,
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
      ...(stripeDiscounts && { discounts: stripeDiscounts }),
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
            tax_code: "txcd_92010001", // shipping
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
