// One-off endpoint: render both order confirmation emails (customer + admin)
// and send them to parker@veepo.ca for review. Uses the latest paid order
// if available, otherwise falls back to synthesized sample data.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REVIEW_RECIPIENT = "parker@veepo.ca";

// --- Inlined template builders (kept in sync with send-order-confirmation) ---
function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatCurrency(cents: number, currency = "cad"): string {
  const symbols: Record<string, string> = { eur: "€", usd: "$", gbp: "£", cad: "C$" };
  const symbol = symbols[(currency || "cad").toLowerCase()] || "$";
  return `${symbol}${(cents / 100).toFixed(2)}`;
}
function getDeliveryWindow(method: string | null, orderDate: Date) {
  const m = method?.toLowerCase() || "standard";
  let minDays = 3, maxDays = 5;
  if (m.includes("express")) { minDays = 1; maxDays = 2; }
  else if (m.includes("priority")) { minDays = 2; maxDays = 3; }
  const s = new Date(orderDate); s.setDate(s.getDate() + minDays);
  const e = new Date(orderDate); e.setDate(e.getDate() + maxDays);
  const f = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return { start: f(s), end: f(e) };
}

// Customer-facing HTML (mirror of send-order-confirmation buildOrderConfirmationHtml)
function buildCustomerHtml(order: any, items: any[], siteUrl: string): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName = order.customer_first_name || "Friend";
  const orderDate = new Date(order.created_at);
  const delivery = getDeliveryWindow(order.shipping_method, orderDate);
  const isFreeShipping = order.shipping_cents === 0;
  const addr = order.shipping_address || {};
  const addressLines = [
    `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim(),
    addr.address,
    `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""} ${addr.postalCode || ""}`.trim(),
    addr.country,
  ].filter((l) => l && String(l).trim().length > 0);
  const itemsHtml = items.map((item) => `
    <tr><td style="padding:16px 0;border-bottom:1px solid #E7E5E4;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="80" valign="top"><div style="width:80px;height:100px;background:#F5F5F4;border-radius:4px;"></div></td>
        <td style="padding-left:16px;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1C1917;">${escapeHtml(item.product_name)}</p>
          <p style="margin:0 0 4px;font-size:14px;color:#78716C;">${[item.variant_size ? `Size: ${item.variant_size}` : null, item.variant_color ? `Color: ${item.variant_color}` : null].filter(Boolean).join(" / ")}</p>
          <p style="margin:0;font-size:14px;color:#78716C;">Qty: ${item.quantity}</p>
        </td>
        <td width="100" align="right" valign="top"><p style="margin:0;font-size:16px;font-weight:600;color:#1C1917;">${formatCurrency(item.total_cents, order.currency)}</p></td>
      </tr></table>
    </td></tr>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your order is on its way. Order #${orderNumber} confirmed — thank you for walking with us.</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF9;"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <tr><td align="center" style="padding:48px 40px 32px;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
      <td style="vertical-align:middle;padding-right:10px;line-height:0;">
        <img src="https://lineofjudah.clothing/favicon-180.png" width="22" height="22" alt="" style="display:block;border:0;" />
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:3px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
      </td>
    </tr></table>
    <div style="width:60px;height:1px;background:#C5C7CA;margin:14px auto 0;opacity:0.7;"></div>
  </td></tr>
  <tr><td align="center" style="padding:0 40px 32px;">
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1C1917;letter-spacing:-0.5px;">YOUR ORDER IS ON ITS WAY</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#78716C;">Order #${orderNumber}</p>
    <p style="margin:8px 0 0;font-size:13px;color:#78716C;font-style:italic;">Worn faith, sent with care.</p>
  </td></tr>
  <tr><td style="padding:0 40px 40px;">
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1C1917;">Hey ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44403C;">You didn't just place an order — you took a stand. Every thread is a testimony. Every stitch, a step in faith.</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44403C;font-weight:600;">Called, chosen, clothed. Welcome to the family.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">Your purchase keeps independent, faith-rooted craft alive. Thank you.</p>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid #E7E5E4;padding-top:32px;">
    <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">WHAT YOU'LL BE WEARING</p>
    <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
  </div></td></tr>
  <tr><td style="padding:32px 40px;"><table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;font-size:15px;color:#44403C;">Subtotal</td><td align="right" style="padding:8px 0;font-size:15px;color:#1C1917;">${formatCurrency(order.subtotal_cents, order.currency)}</td></tr>
    ${order.discount_cents > 0 ? `<tr><td style="padding:8px 0;font-size:15px;color:#44403C;">Discount</td><td align="right" style="padding:8px 0;font-size:15px;color:#059669;">-${formatCurrency(order.discount_cents, order.currency)}</td></tr>` : ""}
    <tr><td style="padding:8px 0;font-size:15px;color:#44403C;">Shipping</td><td align="right" style="padding:8px 0;font-size:15px;${isFreeShipping ? "color:#4CAF50;font-weight:600;" : "color:#1C1917;"}">${isFreeShipping ? "FREE" : formatCurrency(order.shipping_cents, order.currency)}</td></tr>
    <tr><td colspan="2" style="padding:12px 0 0;"><div style="border-top:2px solid #1C1917;"></div></td></tr>
    <tr><td style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">Total</td><td align="right" style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">${formatCurrency(order.total_cents, order.currency)}</td></tr>
  </table></td></tr>
  <tr><td style="padding:0 40px 40px;"><div style="background:#FAFAF9;padding:24px;">
    <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">ESTIMATED ARRIVAL</p>
    <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1C1917;">${delivery.start} – ${delivery.end}</p>
    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#78716C;text-transform:uppercase;">Shipping to:</p>
    ${addressLines.map((line) => `<p style="margin:0;font-size:15px;color:#44403C;line-height:1.5;">${escapeHtml(line)}</p>`).join("")}
  </div></td></tr>
  <tr><td align="center" style="padding:0 40px 40px;">
    <a href="${siteUrl}/account/orders" style="display:inline-block;background:#1C1917;color:#fff;text-decoration:none;padding:16px 32px;font-size:14px;font-weight:600;letter-spacing:0.5px;">TRACK YOUR ORDER →</a>
  </td></tr>
  <tr><td style="padding:0 40px 48px;"><div style="border-top:1px solid #E7E5E4;padding-top:32px;text-align:center;">
    <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1C1917;letter-spacing:0.5px;">More than clothing. A statement of faith.</p>
    <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;line-height:1.7;">"The Lion of the tribe of Judah has triumphed."<br/><span style="font-size:12px;letter-spacing:0.05em;">— Revelation 5:5</span></p>
  </div></td></tr>
  <tr><td style="background:#1C1917;padding:32px 40px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">LINE OF JUDAH</p>
    <p style="margin:0 0 8px;font-size:13px;color:#A8A29E;">Faith you can wear.</p>
    <p style="margin:0;font-size:13px;color:#A8A29E;font-style:italic;">Walk in it. — Olliver Abbey and the Line of Judah Team</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function buildAdminHtml(order: any, items: any[], siteUrl: string): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const addr = order.shipping_address || {};
  const fullName = `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim() || "—";
  const placedAt = new Date(order.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" });
  const itemsRows = items.map((it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.product_name)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.variant_size || "—")}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.variant_color || "—")}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(it.unit_price_cents, order.currency)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;"><strong>${formatCurrency(it.total_cents, order.currency)}</strong></td>
    </tr>`).join("");
  const shipLines = [fullName, addr.address, `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""} ${addr.postalCode || ""}`.trim(), addr.country]
    .filter((l) => l && String(l).trim().length > 0).map((l) => escapeHtml(l)).join("<br>");
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f5f4;margin:0;padding:24px;color:#1c1917;">
  <div style="max-width:680px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e7e5e4;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;"><tr>
      <td style="vertical-align:middle;padding-right:10px;line-height:0;">
        <img src="https://lineofjudah.clothing/favicon-180.png" width="22" height="22" alt="" style="display:block;border:0;" />
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:2px;color:#1c1917;text-transform:uppercase;">LINE OF JUDAH — OPS</p>
      </td>
    </tr></table>
    <h1 style="margin:0 0 4px;font-size:20px;">New order #${orderNumber}</h1>
    <p style="margin:0 0 24px;color:#78716c;font-size:13px;">Placed ${escapeHtml(placedAt)} • Payment: <strong>${escapeHtml(order.payment_status)}</strong></p>
    <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Customer</h2>
    <p style="margin:0 0 4px;"><strong>${escapeHtml(fullName)}</strong></p>
    <p style="margin:0 0 4px;"><a href="mailto:${escapeHtml(order.customer_email)}">${escapeHtml(order.customer_email)}</a></p>
    ${order.customer_phone ? `<p style="margin:0 0 4px;">${escapeHtml(order.customer_phone)}</p>` : ""}
    <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Ship to</h2>
    <p style="margin:0 0 12px;line-height:1.5;">${shipLines}</p>
    <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Items</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#fafaf9;text-align:left;">
        <th style="padding:8px;">Product</th><th style="padding:8px;">Size</th><th style="padding:8px;">Color</th>
        <th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Unit</th><th style="padding:8px;text-align:right;">Total</th>
      </tr></thead><tbody>${itemsRows}</tbody>
    </table>
    <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Summary</h2>
    <table width="100%" style="font-size:14px;">
      <tr><td>Subtotal</td><td align="right">${formatCurrency(order.subtotal_cents, order.currency)}</td></tr>
      ${order.discount_cents > 0 ? `<tr><td>Discount</td><td align="right">-${formatCurrency(order.discount_cents, order.currency)}</td></tr>` : ""}
      <tr><td>Shipping${order.shipping_method ? ` (${escapeHtml(order.shipping_method)})` : ""}</td><td align="right">${formatCurrency(order.shipping_cents, order.currency)}</td></tr>
      ${order.tax_cents > 0 ? `<tr><td>Tax</td><td align="right">${formatCurrency(order.tax_cents, order.currency)}</td></tr>` : ""}
      <tr><td style="padding-top:8px;border-top:2px solid #1c1917;"><strong>Total</strong></td><td align="right" style="padding-top:8px;border-top:2px solid #1c1917;"><strong>${formatCurrency(order.total_cents, order.currency)}</strong></td></tr>
    </table>
    <p style="margin:24px 0 0;"><a href="${siteUrl}/ops-portal/orders/${order.id}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 20px;font-size:13px;letter-spacing:0.5px;">Open in ops portal →</a></p>
  </div></body></html>`;
}

function sampleOrder() {
  return {
    id: "sample00-aaaa-bbbb-cccc-000000000001",
    customer_email: "customer@example.com",
    customer_first_name: "Sample",
    customer_last_name: "Customer",
    customer_phone: "+1 416 555 0199",
    shipping_address: { address: "123 King St W", city: "Toronto", state: "ON", postalCode: "M5H 1A1", country: "Canada" },
    billing_address: null,
    subtotal_cents: 12000,
    shipping_cents: 0,
    discount_cents: 1000,
    tax_cents: 1430,
    total_cents: 12430,
    shipping_method: "standard",
    discount_code: "SUMMER2026",
    notes: null,
    stripe_payment_intent_id: "pi_sample_123",
    stripe_checkout_session_id: "cs_sample_123",
    payment_status: "paid",
    created_at: new Date().toISOString(),
    currency: "cad",
  };
}
function sampleItems() {
  return [
    { id: "i1", product_name: "Lion of Judah Heavyweight Tee", product_image_url: null, variant_size: "L", variant_color: "Forest Green", quantity: 1, unit_price_cents: 6500, total_cents: 6500 },
    { id: "i2", product_name: "Exodus 28 Crewneck", product_image_url: null, variant_size: "M", variant_color: "Chrome", quantity: 1, unit_price_cents: 5500, total_cents: 5500 },
  ];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") || "https://lineofjudah.clothing";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    let body: any = {};
    try { body = await req.json(); } catch { /* GET ok */ }
    const orderId: string | undefined = body?.orderId;

    let order: any = null;
    let items: any[] = [];
    let source = "sample";

    if (orderId) {
      const { data: o } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (o) {
        order = o;
        const { data: it } = await supabase.from("order_items").select("*").eq("order_id", o.id);
        items = it || [];
        source = "order:" + orderId;
      }
    }
    if (!order) {
      const { data: latest } = await supabase
        .from("orders").select("*").eq("payment_status", "paid")
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (latest) {
        order = latest;
        const { data: it } = await supabase.from("order_items").select("*").eq("order_id", latest.id);
        items = it || [];
        source = "latest_paid:" + latest.id;
      }
    }
    if (!order) {
      order = sampleOrder();
      items = sampleItems();
      source = "sample";
    }

    const orderNumber = order.id.slice(0, 8).toUpperCase();
    const customerHtml = buildCustomerHtml(order, items, siteUrl);
    const adminHtml = buildAdminHtml(order, items, siteUrl);

    const send = async (subject: string, html: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Line of Judah Review <onboarding@resend.dev>",
          to: [REVIEW_RECIPIENT],
          subject,
          html,
        }),
      });
      const json = await res.json();
      return { ok: res.ok, status: res.status, json };
    };

    const customerSend = await send(
      `[REVIEW — Customer Email] Order #${orderNumber}`,
      `<div style="background:#fef3c7;padding:12px;font-family:sans-serif;font-size:13px;border-bottom:2px solid #f59e0b;">
        <strong>REVIEW COPY</strong> — This is the email the customer receives on order confirmation. Source: ${source}.
      </div>${customerHtml}`
    );
    const adminSend = await send(
      `[REVIEW — Line of Judah Admin] Order #${orderNumber}`,
      `<div style="background:#fef3c7;padding:12px;font-family:sans-serif;font-size:13px;border-bottom:2px solid #f59e0b;">
        <strong>REVIEW COPY</strong> — This is the internal admin notification sent to Line of Judah on order confirmation. Source: ${source}.
      </div>${adminHtml}`
    );

    return new Response(JSON.stringify({
      success: customerSend.ok && adminSend.ok,
      source,
      recipient: REVIEW_RECIPIENT,
      customer: customerSend,
      admin: adminSend,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
