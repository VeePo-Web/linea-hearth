// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify as verifyJwt } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getJwtKey(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ valid: false, reason: "missing_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwtSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const key = await getJwtKey(jwtSecret);

    let payload: any;
    try {
      payload = await verifyJwt(token, key);
    } catch {
      return new Response(JSON.stringify({ valid: false, reason: "invalid_or_expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check invite still exists + not submitted
    const { data: invite } = await supabase
      .from("worn_in_the_wild_invites")
      .select("order_id, submitted_at, customer_email")
      .eq("order_id", payload.order_id)
      .maybeSingle();

    if (!invite) {
      return new Response(JSON.stringify({ valid: false, reason: "invalid_or_expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as opened
    await supabase
      .from("worn_in_the_wild_invites")
      .update({ opened_at: new Date().toISOString(), clicked_at: new Date().toISOString() })
      .eq("order_id", payload.order_id)
      .is("opened_at", null);

    if (invite.submitted_at) {
      return new Response(JSON.stringify({ valid: true, alreadySubmitted: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order context (first name, hero product)
    const { data: order } = await supabase
      .from("orders")
      .select("customer_first_name, customer_email")
      .eq("id", payload.order_id)
      .maybeSingle();

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, product_image_url, product_id")
      .eq("order_id", payload.order_id)
      .order("total_cents", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({
        valid: true,
        alreadySubmitted: false,
        firstName: order?.customer_first_name || null,
        productName: items?.[0]?.product_name || null,
        productImage: items?.[0]?.product_image_url || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("validate-worn-token error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
