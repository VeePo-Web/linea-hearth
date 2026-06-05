// Public, narrow reconciliation endpoint called by the checkout success page
// when the Stripe webhook is late or misfired. Looks up an order by its
// stripe_checkout_session_id, retrieves the session from Stripe, and — if
// Stripe says it's paid/complete — applies the same mutations as the
// stripe-webhook handler's checkout.session.completed path. Idempotent.

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

const SESSION_ID_RE = /^cs_(live|test)_[A-Za-z0-9]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let body: { sessionId?: string; environment?: StripeEnv };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { sessionId, environment } = body;
  if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
    return new Response(JSON.stringify({ error: "Invalid sessionId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (environment !== "live" && environment !== "sandbox") {
    return new Response(JSON.stringify({ error: "environment must be 'live' or 'sandbox'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = sb();

  // Locate the order by session id
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, payment_status, discount_id, customer_email")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (orderErr) {
    return new Response(JSON.stringify({ error: orderErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found for session" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const orderId = (order as any).id as string;
  if ((order as any).payment_status === "paid") {
    return new Response(
      JSON.stringify({ ok: true, alreadyPaid: true, orderId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Pull session from Stripe
  let full: any;
  try {
    const stripe = createStripeClient(environment);
    full = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["total_details", "shipping_cost", "customer_details", "shipping_details"],
    });
  } catch (e) {
    console.error("Stripe retrieve failed", e);
    return new Response(
      JSON.stringify({ error: "Could not retrieve Stripe session" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (full.payment_status !== "paid" && full.status !== "complete") {
    return new Response(
      JSON.stringify({
        ok: false,
        notPaid: true,
        payment_status: full.payment_status,
        status: full.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const stripeShipping = mapStripeAddress(full.shipping_details?.address);
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
      shipping_cents: full.shipping_cost?.amount_total ?? 0,
      total_cents: full.amount_total ?? 0,
      ...(stripeShipping && { shipping_address: stripeShipping }),
      ...(stripeBilling && { billing_address: stripeBilling }),
      ...(full.customer_details?.phone && { customer_phone: full.customer_details.phone }),
    })
    .eq("id", orderId)
    .neq("payment_status", "paid");

  if (updErr) {
    return new Response(JSON.stringify({ error: updErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Discount redemption tracking (mirrors webhook)
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

  // Convert abandoned-cart sequences
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
    JSON.stringify({ ok: true, reconciled: true, orderId }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
