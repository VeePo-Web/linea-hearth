// Admin-only reconciliation: pulls a Stripe Checkout Session and applies the
// same mutations as the stripe-webhook handler's checkout.session.completed
// path. Used to backfill orders whose webhook was missed (endpoint not
// registered, stale signing secret, network blip, etc.).

import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function mapStripeAddress(a: any) {
  if (!a) return null;
  return {
    address: [a.line1, a.line2].filter(Boolean).join(", "),
    city: a.city ?? "",
    postalCode: a.postal_code ?? "",
    state: a.state ?? "",
    country: a.country ?? "",
  };
}

async function sendConfirmation(orderId: string) {
  try {
    await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-confirmation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      },
    );
  } catch (e) {
    console.error("send-order-confirmation trigger failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // === AuthN: caller must be an authenticated admin ===
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = sb();
  const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
  if (authErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claims.claims.sub as string;
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { orderId?: string; environment?: StripeEnv };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { orderId, environment } = body;
  if (!orderId || (environment !== "live" && environment !== "sandbox")) {
    return new Response(
      JSON.stringify({ error: "orderId and environment ('live'|'sandbox') required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Fetch order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, payment_status, stripe_checkout_session_id, discount_id, customer_email")
    .eq("id", orderId)
    .maybeSingle();
  if (orderErr || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if ((order as any).payment_status === "paid") {
    return new Response(
      JSON.stringify({ ok: true, alreadyPaid: true, orderId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const sessionId = (order as any).stripe_checkout_session_id as string | null;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "No stripe_checkout_session_id on order" }), {
      status: 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Pull session from Stripe
  const stripe = createStripeClient(environment);
  const full = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["total_details", "shipping_cost", "customer_details", "shipping_details"],
  });

  if (full.payment_status !== "paid" && full.status !== "complete") {
    return new Response(
      JSON.stringify({
        error: "Stripe session is not paid/complete",
        payment_status: full.payment_status,
        status: full.status,
      }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const stripeShipping = mapStripeAddress((full as any).shipping_details?.address);
  const stripeBilling = mapStripeAddress(full.customer_details?.address);

  const { error: updErr } = await supabase
    .from("orders")
    .update({
      status: "processing",
      payment_status: "paid",
      stripe_payment_intent_id: (full.payment_intent as string) ?? null,
      stripe_customer_id: (full.customer as string) ?? null,
      tax_cents: full.total_details?.amount_tax ?? 0,
      discount_cents: full.total_details?.amount_discount ?? 0,
      shipping_cents: (full.shipping_cost as any)?.amount_total ?? 0,
      total_cents: full.amount_total ?? 0,
      ...(stripeShipping && { shipping_address: stripeShipping }),
      ...(stripeBilling && { billing_address: stripeBilling }),
      ...(full.customer_details?.phone && { customer_phone: full.customer_details.phone }),
    })
    .eq("id", orderId);
  if (updErr) {
    return new Response(JSON.stringify({ error: updErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Discount usage tracking (mirrors webhook)
  if (full.total_details?.amount_discount && full.total_details.amount_discount > 0) {
    const discountId = (order as any).discount_id;
    if (discountId) {
      await supabase.from("discount_code_redemptions").insert({
        discount_code_id: discountId,
        order_id: orderId,
        customer_email: (order as any).customer_email,
        discount_applied_cents: full.total_details.amount_discount,
      });
      const { data: dc } = await supabase
        .from("discount_codes")
        .select("usage_count")
        .eq("id", discountId)
        .single();
      if (dc) {
        await supabase
          .from("discount_codes")
          .update({ usage_count: ((dc as any).usage_count ?? 0) + 1 })
          .eq("id", discountId);
      }
    }
  }

  // Mark abandoned carts converted
  try {
    const email = (order as any).customer_email?.toLowerCase();
    if (email) {
      await supabase
        .from("abandoned_carts")
        .update({ status: "converted", converted_at: new Date().toISOString() })
        .eq("email", email)
        .in("status", ["pending", "email_1_sent", "email_2_sent", "email_3_sent"]);
    }
  } catch (e) {
    console.error("abandoned_carts update failed", e);
  }

  await sendConfirmation(orderId);

  return new Response(
    JSON.stringify({
      ok: true,
      orderId,
      sessionId,
      paymentIntent: full.payment_intent,
      total: full.amount_total,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
