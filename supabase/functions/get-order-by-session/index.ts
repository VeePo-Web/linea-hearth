// Public read endpoint for the checkout success page.
// The Stripe Checkout Session ID (cs_live_... / cs_test_...) is a long,
// unguessable token issued by Stripe directly to the buyer's browser —
// it acts as a capability token. We use it to look up exactly one order
// row + its line items via service role, bypassing RLS so guest
// checkouts (user_id IS NULL) can still see their confirmation.
//
// Returns 200 with { order: null, items: [] } when the order doesn't
// exist yet or isn't paid — the client polls.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SESSION_ID_RE = /^cs_(live|test)_[A-Za-z0-9]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sessionId = body.sessionId;
  if (!sessionId || !SESSION_ID_RE.test(sessionId)) {
    return new Response(JSON.stringify({ error: "Invalid sessionId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, customer_email, customer_first_name, customer_last_name, shipping_address, subtotal_cents, shipping_cents, discount_cents, tax_cents, total_cents, shipping_method, payment_status, status, created_at, user_id",
    )
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (orderErr) {
    console.error("get-order-by-session: order lookup failed", orderErr);
    return new Response(JSON.stringify({ error: "Lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!order) {
    return new Response(
      JSON.stringify({ order: null, items: [], status: "not_found" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const paid = (order as any).payment_status === "paid";
  const cancelled = (order as any).status === "cancelled";

  if (!paid) {
    return new Response(
      JSON.stringify({
        order: null,
        items: [],
        status: cancelled ? "cancelled" : "pending",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, product_name, product_image_url, variant_size, variant_color, unit_price_cents, quantity, total_cents",
    )
    .eq("order_id", (order as any).id);

  return new Response(
    JSON.stringify({ order, items: items ?? [], status: "paid" }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
