// Sends a "retry payment" email when a Stripe Checkout Session expires
// (24h timeout) or a payment_intent fails (card declined, 3DS abandoned).
// Idempotency is enforced upstream by the webhook one-shot UPDATE pattern
// on `retry_email_sent_at` / `retry_email_followup_sent_at`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)} CAD`;
}

interface OrderItem {
  product_name: string;
  variant_size: string | null;
  variant_color: string | null;
  quantity: number;
  unit_price_cents: number;
  product_image_url: string | null;
}

function buildHtml(opts: {
  order: any;
  items: OrderItem[];
  recoverUrl: string;
  reason: "expired" | "payment_failed";
  isFollowup: boolean;
  siteUrl: string;
}): { subject: string; html: string } {
  const { order, items, recoverUrl, reason, isFollowup, siteUrl } = opts;
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName = order.customer_first_name || "friend";

  let headline: string;
  let lede: string;
  let subject: string;
  if (reason === "payment_failed") {
    headline = isFollowup ? "One more try — your cart is still here" : "Your card was declined";
    lede = isFollowup
      ? "Your selection is still saved. A different card usually does the trick — most declines are simply a bank flagging the first attempt."
      : "Don't worry — this happens. Most card declines are just your bank flagging a new merchant. A second attempt, or a different card, almost always works.";
    subject = isFollowup
      ? `Still here when you're ready — order #${orderNumber}`
      : `Your card was declined — order #${orderNumber}`;
  } else {
    headline = isFollowup ? "One more try — your cart is still here" : "Your checkout timed out";
    lede = isFollowup
      ? "Your selection is still saved. Step back in when you're ready — we held everything for you."
      : "Stripe sessions expire after 24 hours. No worries — we saved your cart. Step back in whenever you're ready.";
    subject = isFollowup
      ? `Still here when you're ready — order #${orderNumber}`
      : `Your cart is waiting — order #${orderNumber}`;
  }

  const itemsHtml = items
    .map((it) => {
      const img = it.product_image_url
        ? `<img src="${escapeHtml(it.product_image_url)}" alt="" width="64" height="80" style="display:block;width:64px;height:80px;object-fit:cover;border:1px solid #e7e5e4;" />`
        : "";
      const variant = [it.variant_size, it.variant_color].filter(Boolean).join(" · ") || "—";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #f5f5f4;width:80px;vertical-align:top;">${img}</td>
          <td style="padding:14px 12px;border-bottom:1px solid #f5f5f4;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:14px;color:#1c1917;font-weight:500;">${escapeHtml(it.product_name)}</p>
            <p style="margin:0;font-size:12px;color:#78716c;">${escapeHtml(variant)} · Qty ${it.quantity}</p>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #f5f5f4;text-align:right;vertical-align:top;font-size:13px;color:#1c1917;">
            ${formatCents(it.unit_price_cents * it.quantity)}
          </td>
        </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:48px 40px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a8a29e;">Line of Judah</p>
    <h1 style="margin:0 0 20px;font-size:26px;font-weight:400;letter-spacing:-0.01em;line-height:1.25;color:#1c1917;">${escapeHtml(headline)}</h1>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#44403c;">${escapeHtml(firstName)},</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#44403c;">${escapeHtml(lede)}</p>

    <table style="border-collapse:collapse;width:100%;margin:8px 0 24px;">${itemsHtml}</table>

    <table style="border-collapse:collapse;width:100%;margin:0 0 32px;border-top:1px solid #e7e5e4;">
      <tr><td style="padding:14px 0;font-size:13px;color:#78716c;">Order total</td>
          <td style="padding:14px 0;text-align:right;font-size:14px;color:#1c1917;"><strong>${formatCents(order.total_cents || order.subtotal_cents || 0)}</strong></td></tr>
    </table>

    <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
      <tr><td style="background:#1c1917;">
        <a href="${escapeHtml(recoverUrl)}" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;font-weight:500;">
          Continue Checkout
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 32px;text-align:center;font-size:12px;color:#a8a29e;">Or paste this link: <br/><a href="${escapeHtml(recoverUrl)}" style="color:#a8a29e;word-break:break-all;">${escapeHtml(recoverUrl)}</a></p>

    <p style="margin:24px 0 8px;font-size:14px;line-height:1.65;color:#57534e;">
      Questions? Reply to this email — a human reads every message.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.65;color:#57534e;">
      <em style="color:#92400e;">"And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."</em>
      <span style="color:#a8a29e;">— Exodus 28:2</span>
    </p>
    <hr style="margin:32px 0 16px;border:none;border-top:1px solid #e7e5e4;"/>
    <p style="margin:0;font-size:11px;color:#a8a29e;text-align:center;">
      <a href="${escapeHtml(siteUrl)}" style="color:#a8a29e;text-decoration:none;">lineofjudah.clothing</a>
    </p>
  </div>
</body></html>`;

  return { subject, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const siteUrl = Deno.env.get("SITE_URL") || "https://lineofjudah.clothing";

    const body = await req.json();
    const orderId: string | undefined = body.orderId;
    const isFollowup: boolean = !!body.isFollowup;
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, customer_email, customer_first_name, total_cents, subtotal_cents, retry_token, retry_reason, payment_status")
      .eq("id", orderId)
      .single();
    if (error || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ord = order as any;
    if (ord.payment_status === "paid") {
      return new Response(JSON.stringify({ skipped: "already_paid" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!ord.customer_email || !ord.retry_token) {
      return new Response(JSON.stringify({ error: "Missing email or retry_token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, variant_size, variant_color, quantity, unit_price_cents, product_image_url")
      .eq("order_id", orderId);

    const reason: "expired" | "payment_failed" =
      ord.retry_reason === "payment_failed" ? "payment_failed" : "expired";
    const recoverUrl = `${siteUrl}/recover-payment?token=${ord.retry_token}`;

    const { subject, html } = buildHtml({
      order: ord,
      items: (items as OrderItem[]) || [],
      recoverUrl,
      reason,
      isFollowup,
      siteUrl,
    });

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY missing — stub retry email", { to: ord.customer_email, subject });
      return new Response(JSON.stringify({ success: true, mode: "stub" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Line of Judah <orders@lineofjudah.com>",
        to: [ord.customer_email],
        subject,
        html,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      console.error("Retry email send failed:", result);
      return new Response(JSON.stringify({ error: "Send failed", details: result }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-retry-payment-email error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
