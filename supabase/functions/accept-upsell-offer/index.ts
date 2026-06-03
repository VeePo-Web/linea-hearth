// Accepts a 60-second post-purchase upsell offer.
// Charges the saved card via Stripe off_session PaymentIntent.
// Creates a child order linked to the parent.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";
import { resolveImageUrl } from "../_shared/imageUrl.ts";
import { verifyUpsellToken, sha256Hex } from "../_shared/upsell-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { token, environment } = (await req.json()) as { token?: string; environment?: StripeEnv };
    if (!token || typeof token !== "string") return json({ error: "Missing token" }, 400);
    const env: StripeEnv = environment === "live" ? "live" : "sandbox";

    // 1. Verify JWT signature + expiry
    let payload;
    try {
      payload = await verifyUpsellToken(token);
    } catch (e) {
      return json({ outcome: "expired", reason: e instanceof Error ? e.message : "invalid_token" }, 410);
    }
    const tokenHash = await sha256Hex(token);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 2. Load offer + single-use guard (atomic status flip pending -> accepting)
    const { data: offerRow, error: offerErr } = await sb
      .from("post_purchase_offers")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (offerErr || !offerRow) return json({ outcome: "expired", reason: "not_found" }, 410);
    const offer: any = offerRow;
    if (offer.status !== "pending") return json({ outcome: "expired", reason: "already_used" }, 410);
    if (new Date(offer.expires_at).getTime() < Date.now()) {
      await sb.from("post_purchase_offers")
        .update({ status: "expired" })
        .eq("id", offer.id).eq("status", "pending");
      return json({ outcome: "expired", reason: "expired" }, 410);
    }
    if (offer.unit_amount_cents !== payload.unitAmountCents) {
      return json({ outcome: "error", reason: "price_mismatch" }, 400);
    }

    const { data: lockData, error: lockErr } = await sb
      .from("post_purchase_offers")
      .update({ status: "accepting" })
      .eq("id", offer.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (lockErr || !lockData) return json({ outcome: "expired", reason: "race" }, 410);

    // 3. Load parent order (for shipping address, customer)
    const { data: parentOrder } = await sb
      .from("orders")
      .select("*")
      .eq("id", offer.parent_order_id)
      .single();
    if (!parentOrder) {
      await sb.from("post_purchase_offers").update({ status: "failed", failure_reason: "parent_missing" }).eq("id", offer.id);
      return json({ outcome: "error", reason: "parent_missing" }, 500);
    }

    // 4. Print-on-demand: no stock check. Variant always available.

    // 5. Load product snapshot for the line item
    const { data: product } = await sb
      .from("products")
      .select("name")
      .eq("id", offer.product_id)
      .single();
    let variantSize: string | null = null;
    let variantColor: string | null = null;
    if (offer.variant_id) {
      const { data: variant } = await sb
        .from("product_variants")
        .select("size, color")
        .eq("id", offer.variant_id)
        .single();
      variantSize = (variant as any)?.size ?? null;
      variantColor = (variant as any)?.color ?? null;
    }
    const { data: img } = await sb
      .from("product_images")
      .select("image_url")
      .eq("product_id", offer.product_id)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    // 6. Retrieve parent PaymentIntent → grab saved payment_method
    const stripe = createStripeClient(env);
    const parentPiId = (parentOrder as any).stripe_payment_intent_id || offer.parent_payment_intent_id;
    if (!parentPiId) {
      await sb.from("post_purchase_offers").update({ status: "failed", failure_reason: "no_parent_pi" }).eq("id", offer.id);
      return json({ outcome: "error", reason: "no_parent_pi" }, 500);
    }
    const parentPi = await stripe.paymentIntents.retrieve(parentPiId);
    const customerId = (parentPi.customer as string) || (parentOrder as any).stripe_customer_id;
    const paymentMethodId = (parentPi.payment_method as string) || null;
    if (!customerId || !paymentMethodId) {
      await sb.from("post_purchase_offers").update({ status: "failed", failure_reason: "no_saved_pm" }).eq("id", offer.id);
      return json({ outcome: "error", reason: "no_saved_pm" }, 500);
    }

    // 7. Create child draft order
    const totalCents = offer.unit_amount_cents;
    const { data: childOrder, error: childErr } = await sb
      .from("orders")
      .insert({
        user_id: (parentOrder as any).user_id,
        status: "pending",
        payment_status: "unpaid",
        customer_email: (parentOrder as any).customer_email,
        customer_first_name: (parentOrder as any).customer_first_name,
        customer_last_name: (parentOrder as any).customer_last_name,
        customer_phone: (parentOrder as any).customer_phone,
        shipping_address: (parentOrder as any).shipping_address,
        billing_address: (parentOrder as any).billing_address,
        subtotal_cents: totalCents,
        shipping_cents: 0, // ships together with parent
        discount_cents: 0,
        tax_cents: 0,
        total_cents: totalCents,
        currency: "cad",
        shipping_method: (parentOrder as any).shipping_method,
        stripe_customer_id: customerId,
        metadata: { parentOrderId: offer.parent_order_id, postPurchaseOfferId: offer.id, upsell: true },
      })
      .select("id")
      .single();
    if (childErr || !childOrder) {
      await sb.from("post_purchase_offers").update({ status: "failed", failure_reason: "child_order_insert" }).eq("id", offer.id);
      console.error("child order insert failed", childErr);
      return json({ outcome: "error", reason: "child_order" }, 500);
    }

    await sb.from("order_items").insert({
      order_id: childOrder.id,
      product_id: offer.product_id,
      variant_id: offer.variant_id,
      product_name: (product as any)?.name ?? "Upsell item",
      product_image_url: resolveImageUrl((img as any)?.image_url),
      variant_size: variantSize,
      variant_color: variantColor,
      unit_price_cents: offer.unit_amount_cents,
      quantity: 1,
      total_cents: totalCents,
    });

    // 8. off_session PaymentIntent
    const parentShortId = String(offer.parent_order_id).slice(0, 8).toUpperCase();
    try {
      const pi = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: "cad",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `LOJ upsell - ${parentShortId}`,
        statement_descriptor_suffix: "UPSELL",
        metadata: {
          childOrderId: childOrder.id,
          parentOrderId: offer.parent_order_id,
          offerId: offer.id,
          upsell: "true",
        },
      });

      await sb.from("orders")
        .update({ stripe_payment_intent_id: pi.id })
        .eq("id", childOrder.id);

      if (pi.status === "succeeded") {
        await sb.from("orders").update({
          payment_status: "paid",
          status: "processing",
        }).eq("id", childOrder.id);
        await sb.from("post_purchase_offers").update({
          status: "accepted",
          child_order_id: childOrder.id,
          child_payment_intent_id: pi.id,
          accepted_at: new Date().toISOString(),
        }).eq("id", offer.id);
        // Fire confirmation email (non-blocking)
        try {
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-confirmation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: childOrder.id }),
          });
        } catch (_) { /* webhook will retry */ }
        return json({ outcome: "charged", childOrderId: childOrder.id });
      }

      if (pi.status === "requires_action" || pi.status === "requires_confirmation") {
        await sb.from("post_purchase_offers").update({
          status: "failed",
          failure_reason: "authentication_required",
          child_order_id: childOrder.id,
          child_payment_intent_id: pi.id,
        }).eq("id", offer.id);
        return json({
          outcome: "authentication_required",
          clientSecret: pi.client_secret,
          childOrderId: childOrder.id,
        });
      }

      // Any other terminal state
      await sb.from("post_purchase_offers").update({
        status: "failed",
        failure_reason: `pi_${pi.status}`,
        child_payment_intent_id: pi.id,
      }).eq("id", offer.id);
      await sb.from("orders").update({ status: "cancelled" }).eq("id", childOrder.id);
      return json({ outcome: "declined", reason: pi.status });
    } catch (stripeErr: any) {
      // Off-session failures: card_declined, authentication_required (Stripe surfaces
      // this as an exception when the saved PM needs SCA off-session).
      const code = stripeErr?.code || stripeErr?.raw?.code || "stripe_error";
      const decline = stripeErr?.decline_code || stripeErr?.raw?.decline_code || null;
      const piFromErr = stripeErr?.payment_intent || stripeErr?.raw?.payment_intent;

      if (code === "authentication_required" && piFromErr?.client_secret) {
        await sb.from("post_purchase_offers").update({
          status: "failed",
          failure_reason: "authentication_required",
          child_order_id: childOrder.id,
          child_payment_intent_id: piFromErr.id,
        }).eq("id", offer.id);
        await sb.from("orders").update({ stripe_payment_intent_id: piFromErr.id })
          .eq("id", childOrder.id);
        return json({
          outcome: "authentication_required",
          clientSecret: piFromErr.client_secret,
          childOrderId: childOrder.id,
        });
      }

      console.error("upsell PI create failed", { code, decline, msg: stripeErr?.message });
      await sb.from("post_purchase_offers").update({
        status: "failed",
        failure_reason: decline || code,
      }).eq("id", offer.id);
      await sb.from("orders").update({ status: "cancelled" }).eq("id", childOrder.id);
      return json({ outcome: "declined", reason: decline || code });
    }
  } catch (e) {
    console.error("accept-upsell-offer error", e);
    return json({ outcome: "error", reason: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
