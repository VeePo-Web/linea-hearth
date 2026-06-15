import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveImageUrl } from "../_shared/imageUrl.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_color: string | null;
  variant_style: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

interface Order {
  id: string;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  shipping_address: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  billing_address: Record<string, unknown> | null;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  shipping_method: string | null;
  discount_code: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  payment_status: string;
  created_at: string;
  currency: string;
}

const INTERNAL_NOTIFY_RECIPIENTS = [
  "1.lineofjudah.1@gmail.com",
  "parker@veepo.ca",
];

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTapstitchBlock(order: Order, items: OrderItem[]): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const date = new Date(order.created_at).toISOString().slice(0, 10);
  const addr = order.shipping_address || {};
  const fullName = `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim() || "—";
  const cityLine = `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""}  ${addr.postalCode || ""}`.trim();
  const itemLines = items.map((it) => {
    const variant = [it.variant_style, it.variant_color, it.variant_size].filter(Boolean).join(" / ") || "Default";
    return `  ${it.quantity}x  ${it.product_name} — ${variant}`;
  }).join("\n");
  return [
    `Order #${orderNumber} — ${date}`,
    `Ship to:`,
    `  ${fullName}`,
    addr.address ? `  ${addr.address}` : null,
    `  ${cityLine}`,
    addr.country ? `  ${addr.country}` : null,
    order.customer_phone ? `Phone: ${order.customer_phone}` : null,
    `Email: ${order.customer_email}`,
    `Items:`,
    itemLines,
    `Shipping: ${order.shipping_method || "Standard"} — ${formatCurrency(order.shipping_cents, order.currency)}`,
    order.discount_cents > 0 ? `Discount${order.discount_code ? ` (${order.discount_code})` : ""}: -${formatCurrency(order.discount_cents, order.currency)}` : null,
    `Total:    ${formatCurrency(order.total_cents, order.currency)}`,
    `Stripe PI: ${order.stripe_payment_intent_id || "—"}`,
  ].filter(Boolean).join("\n");
}

function buildAdminNotificationHtml(order: Order, items: OrderItem[], siteUrl: string): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const addr = order.shipping_address || {};
  const fullName = `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim() || "—";
  const placedAt = new Date(order.created_at).toLocaleString("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto",
  });
  const anyStyle = items.some((it) => it.variant_style);
  const itemsRows = items.map((it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.product_name)}</td>
      ${anyStyle ? `<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.variant_style || "—")}</td>` : ""}
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.variant_size || "—")}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(it.variant_color || "—")}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(it.unit_price_cents, order.currency)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;"><strong>${formatCurrency(it.total_cents, order.currency)}</strong></td>
    </tr>`).join("");

  const shipLines = [
    fullName,
    addr.address,
    `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""} ${addr.postalCode || ""}`.trim(),
    addr.country,
  ].filter((l) => l && String(l).trim().length > 0).map((l) => escapeHtml(l)).join("<br>");

  const billing = order.billing_address as Record<string, string> | null;
  const billingHtml = billing && JSON.stringify(billing) !== JSON.stringify(addr)
    ? `<p style="margin:0 0 4px;"><strong>Billing address:</strong><br>${escapeHtml(JSON.stringify(billing))}</p>` : "";

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
      ${billingHtml}

      <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Items</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#fafaf9;text-align:left;">
          <th style="padding:8px;">Product</th>${anyStyle ? `<th style="padding:8px;">Style</th>` : ""}<th style="padding:8px;">Size</th><th style="padding:8px;">Color</th>
          <th style="padding:8px;text-align:center;">Qty</th><th style="padding:8px;text-align:right;">Unit</th><th style="padding:8px;text-align:right;">Total</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Summary</h2>
      <table width="100%" style="font-size:14px;">
        <tr><td>Subtotal</td><td align="right">${formatCurrency(order.subtotal_cents, order.currency)}</td></tr>
        ${order.discount_cents > 0 ? `<tr><td>Discount${order.discount_code ? ` (${escapeHtml(order.discount_code)})` : ""}</td><td align="right">-${formatCurrency(order.discount_cents, order.currency)}</td></tr>` : ""}
        <tr><td>Shipping${order.shipping_method ? ` (${escapeHtml(order.shipping_method)})` : ""}</td><td align="right">${formatCurrency(order.shipping_cents, order.currency)}</td></tr>
        ${order.tax_cents > 0 ? `<tr><td>Tax</td><td align="right">${formatCurrency(order.tax_cents, order.currency)}</td></tr>` : ""}
        <tr><td style="padding-top:8px;border-top:2px solid #1c1917;"><strong>Total</strong></td><td align="right" style="padding-top:8px;border-top:2px solid #1c1917;"><strong>${formatCurrency(order.total_cents, order.currency)}</strong></td></tr>
      </table>

      ${order.notes ? `<h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Customer notes</h2><p style="margin:0;white-space:pre-wrap;">${escapeHtml(order.notes)}</p>` : ""}

      <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Stripe</h2>
      <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#57534e;">PI: ${escapeHtml(order.stripe_payment_intent_id || "—")}</p>
      <p style="margin:0 0 16px;font-family:monospace;font-size:12px;color:#57534e;">Session: ${escapeHtml(order.stripe_checkout_session_id || "—")}</p>

      <h2 style="font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1px;color:#57534e;">Tapstitch — copy &amp; paste</h2>
      <pre style="background:#0c0a09;color:#fafaf9;padding:16px 20px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;border:1px solid #1c1917;margin:0 0 16px;">${escapeHtml(buildTapstitchBlock(order, items))}</pre>

      <p style="margin:24px 0 0;"><a href="${siteUrl}/ops-portal/orders/${order.id}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:12px 20px;font-size:13px;letter-spacing:0.5px;">Open in ops portal →</a></p>
    </div>
  </body></html>`;
}


// Format cents to currency display
function formatCurrency(cents: number, currency: string = "cad"): string {
  const amount = cents / 100;
  const symbols: Record<string, string> = {
    eur: "€",
    usd: "US$",
    gbp: "£",
    cad: "$",
  };
  const symbol = symbols[currency.toLowerCase()] || "$";
  return `${symbol}${amount.toFixed(2)}`;
}

// Calculate estimated delivery window
function getDeliveryWindow(shippingMethod: string | null, orderDate: Date): { start: string; end: string } {
  const method = shippingMethod?.toLowerCase() || "standard";
  
  let minDays = 3;
  let maxDays = 5;
  
  if (method.includes("express")) {
    minDays = 1;
    maxDays = 2;
  } else if (method.includes("priority")) {
    minDays = 2;
    maxDays = 3;
  }
  
  const startDate = new Date(orderDate);
  startDate.setDate(startDate.getDate() + minDays);
  
  const endDate = new Date(orderDate);
  endDate.setDate(endDate.getDate() + maxDays);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

// Build the premium HTML email template
function buildOrderConfirmationHtml(order: Order, items: OrderItem[], siteUrl: string): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName = order.customer_first_name || "Friend";
  const orderDate = new Date(order.created_at);
  const delivery = getDeliveryWindow(order.shipping_method, orderDate);
  const isFreeShipping = order.shipping_cents === 0;
  
  // Build address string — canonical app shape: { address, city, state, postalCode, country }
  const addr = order.shipping_address || {};
  const addressLines = [
    `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim(),
    addr.address,
    `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""} ${addr.postalCode || ""}`.trim(),
    addr.country,
  ].filter((l) => l && l.trim().length > 0);

  
  // Build items HTML
  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" valign="top">
              <img src="${resolveImageUrl(item.product_image_url)}" alt="${item.product_name}" width="80" height="100" style="display:block;object-fit:cover;border-radius:4px;background:#F5F5F4;" />
            </td>
            <td style="padding-left:16px;vertical-align:top;">
              <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1C1917;">${item.product_name}</p>
              <p style="margin:0 0 4px;font-size:14px;color:#78716C;">
                ${[item.variant_style ? `Style: ${item.variant_style}` : null, item.variant_size ? `Size: ${item.variant_size}` : null, item.variant_color ? `Color: ${item.variant_color}` : null].filter(Boolean).join(" / ")}
              </p>
              <p style="margin:0;font-size:14px;color:#78716C;">Qty: ${item.quantity}</p>
            </td>
            <td width="100" align="right" valign="top">
              <p style="margin:0;font-size:16px;font-weight:600;color:#1C1917;">${formatCurrency(item.total_cents, order.currency)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Confirmation - Line of Judah</title>
</head>
<body style="margin:0;padding:0;background-color:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Your order is on its way. Order #${orderNumber} confirmed — thank you for walking with us.
  </div>
  
  <!-- Email Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        
        <!-- Content Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          
          <!-- Logo Header with Favicon -->
          <tr>
            <td align="center" style="padding:48px 40px 32px;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
                <td style="vertical-align:middle;padding-right:10px;line-height:0;">
                  <img src="https://lineofjudah.clothing/favicon-180.png" width="22" height="22" alt="" style="display:block;border:0;border-radius:4px;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:3px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                </td>
              </tr></table>
              <div style="width:60px;height:1px;background:#C5C7CA;margin:14px auto 0;opacity:0.7;"></div>
            </td>
          </tr>
          
          <!-- Hero Message -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1C1917;letter-spacing:-0.5px;">YOUR ORDER IS ON ITS WAY</h1>
              <p style="margin:0 0 4px;font-size:14px;color:#78716C;">Order #${orderNumber}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#78716C;font-style:italic;">Worn faith, sent with care.</p>
            </td>
          </tr>
          
          <!-- Personal Greeting -->
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1C1917;">Hey ${firstName},</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44403C;">You didn't just place an order — you took a stand. Every thread is a testimony. Every stitch, a step in faith.</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44403C;font-weight:600;">Called, chosen, clothed. Welcome to the family.</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">Your purchase keeps independent, faith-rooted craft alive. From our family to yours — thank you.</p>
            </td>
          </tr>
          
          <!-- Order Items Section -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #E7E5E4;padding-top:32px;">
                <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">WHAT YOU'LL BE WEARING</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHtml}
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Order Summary -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#44403C;">Subtotal</td>
                  <td align="right" style="padding:8px 0;font-size:15px;color:#1C1917;">${formatCurrency(order.subtotal_cents, order.currency)}</td>
                </tr>
                ${order.discount_cents > 0 ? `
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#44403C;">Discount${order.discount_code ? ` (${order.discount_code})` : ""}</td>
                  <td align="right" style="padding:8px 0;font-size:15px;color:#059669;">-${formatCurrency(order.discount_cents, order.currency)}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#44403C;">Shipping</td>
                  <td align="right" style="padding:8px 0;font-size:15px;${isFreeShipping ? "color:#4CAF50;font-weight:600;" : "color:#1C1917;"}">${isFreeShipping ? "FREE" : formatCurrency(order.shipping_cents, order.currency)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:12px 0 0;">
                    <div style="border-top:2px solid #1C1917;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">Total</td>
                  <td align="right" style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">${formatCurrency(order.total_cents, order.currency)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Shipping Info -->
          <tr>
            <td style="padding:0 40px 40px;">
              <div style="background:#FAFAF9;border-radius:8px;padding:24px;">
                <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">ESTIMATED ARRIVAL</p>
                <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1C1917;">${delivery.start} – ${delivery.end}</p>
                <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#78716C;text-transform:uppercase;">Shipping to:</p>
                ${addressLines.map((line) => `<p style="margin:0;font-size:15px;color:#44403C;line-height:1.5;">${line}</p>`).join("")}
              </div>
            </td>
          </tr>
          
          <!-- Track Order CTA -->
          <tr>
            <td align="center" style="padding:0 40px 40px;">
              <a href="${siteUrl}/account/orders" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 32px;font-size:14px;font-weight:600;letter-spacing:0.5px;border-radius:0;">TRACK YOUR ORDER →</a>
            </td>
          </tr>
          
          <!-- Scripture / Mission -->
          <tr>
            <td style="padding:0 40px 48px;">
              <div style="border-top:1px solid #E7E5E4;padding-top:32px;text-align:center;">
                <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1C1917;letter-spacing:0.5px;">More than clothing. A statement of faith.</p>
                <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;line-height:1.7;">"The Lion of the tribe of Judah has triumphed."<br/><span style="font-size:12px;letter-spacing:0.05em;">— Revelation 5:5</span></p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#1C1917;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 4px;font-size:14px;color:#A8A29E;">Questions? We've got your back.</p>
                    <a href="mailto:hello@lineofjudah.clothing" style="font-size:14px;color:#FFFFFF;text-decoration:none;">hello@lineofjudah.clothing</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#78716C;">Faith you can wear.</p>
                    <p style="margin:0;font-size:13px;color:#A8A29E;font-style:italic;">Walk in it. — Olliver Abbey and the Line of Judah Team</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;">
                    <a href="https://instagram.com" style="display:inline-block;margin:0 8px;font-size:13px;color:#A8A29E;text-decoration:none;">Instagram</a>
                    <span style="color:#57534E;">•</span>
                    <a href="https://tiktok.com" style="display:inline-block;margin:0 8px;font-size:13px;color:#A8A29E;text-decoration:none;">TikTok</a>
                    <span style="color:#57534E;">•</span>
                    <a href="https://youtube.com" style="display:inline-block;margin:0 8px;font-size:13px;color:#A8A29E;text-decoration:none;">YouTube</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:24px;border-top:1px solid #292524;margin-top:24px;">
                    <p style="margin:16px 0 0;font-size:12px;color:#57534E;">© 2026 Line of Judah. All rights reserved.</p>
                    <p style="margin:8px 0 0;">
                      <a href="${siteUrl}/privacy" style="font-size:12px;color:#57534E;text-decoration:none;">Privacy</a>
                      <span style="color:#44403C;margin:0 8px;">•</span>
                      <a href="${siteUrl}/terms" style="font-size:12px;color:#57534E;text-decoration:none;">Terms</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") || "https://lineofjudah.clothing";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await req.json().catch(() => ({}));
    const { orderId, notifyAdminOnly } = body as { orderId?: string; notifyAdminOnly?: boolean };

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-order-confirmation] order=${orderId} notifyAdminOnly=${!!notifyAdminOnly}`);

    // Fetch order + items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderError || !order) {
      console.error("Failed to fetch order:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (itemsError) {
      console.error("Failed to fetch order items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("[send-order-confirmation] RESEND_API_KEY missing — stub mode");
      return new Response(
        JSON.stringify({ success: true, mode: "stub", message: "API key not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderTyped = order as Order;
    const itemsTyped = (items || []) as OrderItem[];
    const orderShort = orderId.slice(0, 8).toUpperCase();

    async function sendCustomer() {
      const emailHtml = buildOrderConfirmationHtml(orderTyped, itemsTyped, siteUrl);
      const subject = `Your order is on its way — #${orderShort}`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Line of Judah <orders@lineofjudah.clothing>",
          to: [orderTyped.customer_email],
          subject,
          html: emailHtml,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`Customer send failed: ${JSON.stringify(json)}`);
      return json.id as string;
    }

    async function sendAdmin() {
      const adminHtml = buildAdminNotificationHtml(orderTyped, itemsTyped, siteUrl);
      const fullName = `${orderTyped.customer_first_name || ""} ${orderTyped.customer_last_name || ""}`.trim();
      const adminSubject = `New order #${orderShort} — ${formatCurrency(orderTyped.total_cents, orderTyped.currency)}${fullName ? ` — ${fullName}` : ""}`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Line of Judah Orders <orders@lineofjudah.clothing>",
          to: INTERNAL_NOTIFY_RECIPIENTS,
          reply_to: orderTyped.customer_email,
          subject: adminSubject,
          html: adminHtml,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(`Admin send failed: ${JSON.stringify(json)}`);
      return json.id as string;
    }

    // Run customer + admin in parallel, each independent.
    const tasks: Array<Promise<{ kind: string; ok: boolean; id?: string; error?: string }>> = [];
    if (!notifyAdminOnly) {
      tasks.push(
        sendCustomer()
          .then((id) => {
            console.log(`[send-order-confirmation] customer ok order=${orderId} id=${id} to=${orderTyped.customer_email}`);
            return { kind: "customer", ok: true, id };
          })
          .catch((e) => {
            console.error(`[send-order-confirmation] customer FAILED order=${orderId}`, e);
            return { kind: "customer", ok: false, error: String(e?.message ?? e) };
          })
      );
    }
    tasks.push(
      sendAdmin()
        .then((id) => {
          console.log(`[send-order-confirmation] admin ok order=${orderId} id=${id} to=${INTERNAL_NOTIFY_RECIPIENTS.join(",")}`);
          return { kind: "admin", ok: true, id };
        })
        .catch((e) => {
          console.error(`[send-order-confirmation] admin FAILED order=${orderId}`, e);
          return { kind: "admin", ok: false, error: String(e?.message ?? e) };
        })
    );

    const results = await Promise.all(tasks);
    const anyOk = results.some((r) => r.ok);

    return new Response(
      JSON.stringify({ success: anyOk, mode: "live", results }),
      { status: anyOk ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in send-order-confirmation:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
