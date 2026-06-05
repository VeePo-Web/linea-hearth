// Validates a retry_token, returns the order's items so the client can
// rehydrate the cart and send the customer back to /checkout.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let token: string | null = null;
    if (req.method === "GET") {
      token = new URL(req.url).searchParams.get("token");
    } else if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      token = body?.token ?? null;
    } else {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    if (!token || token.length < 16) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, customer_email, payment_status, status, created_at, discount_code, retry_reason")
      .eq("retry_token", token)
      .maybeSingle();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ord = order as any;
    if (ord.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "This order has already been paid" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (ord.payment_status === "refunded") {
      return new Response(JSON.stringify({ error: "This order was refunded" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (Date.now() - new Date(ord.created_at).getTime() > SEVEN_DAYS_MS) {
      return new Response(JSON.stringify({ error: "This recovery link has expired" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, product_name, variant_id, variant_size, variant_color, quantity, unit_price_cents, product_image_url")
      .eq("order_id", ord.id);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: ord.id,
        email: ord.customer_email,
        discountCode: ord.discount_code ?? null,
        reason: ord.retry_reason ?? null,
        items: items ?? [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("recover-payment error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
