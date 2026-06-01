// Grants a one-shot 60-second post-purchase upsell offer for a paid order.
// Idempotent on parent_order_id. Returns null if no eligible candidate.
import { createClient } from "npm:@supabase/supabase-js@2";
import { signUpsellToken, sha256Hex } from "../_shared/upsell-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ELIGIBILITY_WINDOW_MS = 30 * 60 * 1000; // 30 min post-paid
const TOKEN_TTL_SECONDS = 60;
const DEFAULT_DISCOUNT_PCT = 15;
const MAX_DISCOUNT_PCT = 20;

function discountPct(): number {
  const raw = Number(Deno.env.get("UPSELL_DISCOUNT_PCT"));
  const n = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DISCOUNT_PCT;
  return Math.min(Math.max(Math.round(n), 1), MAX_DISCOUNT_PCT);
}

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
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return json({ error: "Invalid orderId" }, 400);
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Load parent order
    const { data: order, error: orderErr } = await sb
      .from("orders")
      .select("id, payment_status, created_at, customer_email, stripe_customer_id, stripe_payment_intent_id")
      .eq("id", orderId)
      .maybeSingle();
    if (orderErr || !order) return json({ offer: null, reason: "order_not_found" });
    if ((order as any).payment_status !== "paid") return json({ offer: null, reason: "not_paid" });
    const orderAgeMs = Date.now() - new Date((order as any).created_at).getTime();
    if (orderAgeMs > ELIGIBILITY_WINDOW_MS) return json({ offer: null, reason: "expired_window" });

    // 2. Idempotency — return existing pending offer if still valid
    const { data: existing } = await sb
      .from("post_purchase_offers")
      .select("*")
      .eq("parent_order_id", orderId)
      .maybeSingle();
    if (existing) {
      const stillPending =
        (existing as any).status === "pending" &&
        new Date((existing as any).expires_at).getTime() > Date.now();
      if (!stillPending) return json({ offer: null, reason: "already_used" });
      // We don't keep the raw token anywhere — once it's gone, it's gone.
      // Browser keeps it in memory for the session; reloads simply lose the offer.
      return json({ offer: null, reason: "already_granted" });
    }

    // 3. Candidate selection — complementary to the order's largest line.
    const { data: orderItems } = await sb
      .from("order_items")
      .select("product_id, unit_price_cents, quantity")
      .eq("order_id", orderId);
    const inOrderProductIds = new Set(
      (orderItems ?? []).map((i: any) => i.product_id).filter(Boolean),
    );
    let anchorCategoryId: string | null = null;
    if (orderItems && orderItems.length) {
      const sorted = [...orderItems].sort(
        (a: any, b: any) => (b.unit_price_cents * b.quantity) - (a.unit_price_cents * a.quantity),
      );
      const anchorProductId = sorted[0]?.product_id;
      if (anchorProductId) {
        const { data: anchor } = await sb
          .from("products")
          .select("category_id")
          .eq("id", anchorProductId)
          .maybeSingle();
        anchorCategoryId = (anchor as any)?.category_id ?? null;
      }
    }

    let candidate: { id: string; name: string; price: number; sale_price: number | null; is_on_sale: boolean } | null = null;

    if (anchorCategoryId) {
      const { data: cands } = await sb
        .from("products")
        .select("id, name, price, sale_price, is_on_sale")
        .eq("status", "active")
        .eq("category_id", anchorCategoryId)
        .order("is_featured", { ascending: false })
        .limit(10);
      candidate = (cands ?? []).find((p: any) => !inOrderProductIds.has(p.id)) as any ?? null;
    }
    if (!candidate) {
      // Fallback: any featured active product not already in the order
      const { data: cands } = await sb
        .from("products")
        .select("id, name, price, sale_price, is_on_sale")
        .eq("status", "active")
        .eq("is_featured", true)
        .limit(10);
      candidate = (cands ?? []).find((p: any) => !inOrderProductIds.has(p.id)) as any ?? null;
    }
    if (!candidate) return json({ offer: null, reason: "no_candidate" });

    // 4. Pick a default variant (print-on-demand: no stock gating)
    const { data: variants } = await sb
      .from("product_variants")
      .select("id, size, color, price_adjustment")
      .eq("product_id", candidate.id);
    let pickedVariant: { id: string; size: string | null; color: string | null; price_adjustment: number } | null = null;
    if (variants && variants.length) {
      // Prefer medium-ish size if present
      const preferred = variants.find((v: any) => ["M", "Medium"].includes(v.size)) ?? variants[0];
      pickedVariant = {
        id: (preferred as any).id,
        size: (preferred as any).size,
        color: (preferred as any).color,
        price_adjustment: Number((preferred as any).price_adjustment ?? 0),
      };
    }

    // 5. Server-authorized price
    const basePrice = candidate.is_on_sale && candidate.sale_price != null
      ? Number(candidate.sale_price)
      : Number(candidate.price);
    const originalDollars = basePrice + (pickedVariant?.price_adjustment ?? 0);
    const pct = discountPct();
    const discountedDollars = originalDollars * (1 - pct / 100);
    const unitAmountCents = Math.round(discountedDollars * 100);
    const originalUnitAmountCents = Math.round(originalDollars * 100);

    // 6. Product image (first image, sort order)
    const { data: img } = await sb
      .from("product_images")
      .select("image_url")
      .eq("product_id", candidate.id)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    // 7. Mint token + persist offer
    const offerId = crypto.randomUUID();
    const expSeconds = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const token = await signUpsellToken({
      offerId,
      orderId,
      productId: candidate.id,
      variantId: pickedVariant?.id ?? null,
      unitAmountCents,
      exp: expSeconds,
    });
    const tokenHash = await sha256Hex(token);

    const { error: insErr } = await sb.from("post_purchase_offers").insert({
      id: offerId,
      parent_order_id: orderId,
      customer_email: (order as any).customer_email,
      stripe_customer_id: (order as any).stripe_customer_id,
      parent_payment_intent_id: (order as any).stripe_payment_intent_id,
      product_id: candidate.id,
      variant_id: pickedVariant?.id ?? null,
      unit_amount_cents: unitAmountCents,
      original_unit_amount_cents: originalUnitAmountCents,
      discount_pct: pct,
      token_hash: tokenHash,
      expires_at: new Date(expSeconds * 1000).toISOString(),
      status: "pending",
    });
    if (insErr) {
      // Race: another tab already minted one → treat as already_granted.
      if ((insErr as any).code === "23505") return json({ offer: null, reason: "race" });
      console.error("offer insert failed", insErr);
      return json({ error: "Failed to grant offer" }, 500);
    }

    return json({
      offer: {
        token,
        expiresAt: new Date(expSeconds * 1000).toISOString(),
        productId: candidate.id,
        variantId: pickedVariant?.id ?? null,
        productName: candidate.name,
        variantLabel: [pickedVariant?.size, pickedVariant?.color].filter(Boolean).join(" / ") || null,
        imageUrl: (img as any)?.image_url ?? null,
        priceCents: unitAmountCents,
        originalPriceCents: originalUnitAmountCents,
        discountPct: pct,
      },
    });
  } catch (e) {
    console.error("grant-upsell-offer error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
