// Test endpoint: sends every email template to parker@veepo.ca for inbox QA.
// Templates duplicated verbatim from production senders so output matches what customers receive.
// READ-ONLY relative to production code — does not import or modify any other function.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_TO = "parker@veepo.ca";
const FROM = "Line of Judah <noreply@lineofjudah.clothing>";
const SITE_URL = "https://lineofjudah.clothing";

// ============================================================================
// Helpers (copied from send-order-confirmation)
// ============================================================================
function formatCurrency(cents: number, currency = "cad"): string {
  const symbols: Record<string, string> = { eur: "€", usd: "$", gbp: "£", cad: "C$" };
  return `${symbols[currency.toLowerCase()] || "$"}${(cents / 100).toFixed(2)}`;
}

function getDeliveryWindow(method: string | null, orderDate: Date) {
  const m = method?.toLowerCase() || "standard";
  let minDays = 3, maxDays = 5;
  if (m.includes("express")) { minDays = 1; maxDays = 2; }
  else if (m.includes("priority")) { minDays = 2; maxDays = 3; }
  const s = new Date(orderDate); s.setDate(s.getDate() + minDays);
  const e = new Date(orderDate); e.setDate(e.getDate() + maxDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return { start: fmt(s), end: fmt(e) };
}

// ============================================================================
// 1. ORDER CONFIRMATION (verbatim from send-order-confirmation)
// ============================================================================
function buildOrderConfirmationHtml(order: any, items: any[], siteUrl: string): string {
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
  ].filter((l) => l && l.trim().length > 0);

  const itemsHtml = items.map((item) => `
    <tr><td style="padding:16px 0;border-bottom:1px solid #E7E5E4;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="80" valign="top">
          ${item.product_image_url
            ? `<img src="${item.product_image_url}" alt="${item.product_name}" width="80" height="100" style="display:block;object-fit:cover;border-radius:4px;background:#F5F5F4;" />`
            : `<div style="width:80px;height:100px;background:#F5F5F4;border-radius:4px;"></div>`}
        </td>
        <td style="padding-left:16px;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#1C1917;">${item.product_name}</p>
          <p style="margin:0 0 4px;font-size:14px;color:#78716C;">${[item.variant_size ? `Size: ${item.variant_size}` : null, item.variant_color ? `Color: ${item.variant_color}` : null].filter(Boolean).join(" / ")}</p>
          <p style="margin:0;font-size:14px;color:#78716C;">Qty: ${item.quantity}</p>
        </td>
        <td width="100" align="right" valign="top">
          <p style="margin:0;font-size:16px;font-weight:600;color:#1C1917;">${formatCurrency(item.total_cents, order.currency)}</p>
        </td>
      </tr></table>
    </td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Order Confirmation - Line of Judah</title></head>
<body style="margin:0;padding:0;background-color:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your armor is on the way. Order #${orderNumber} confirmed. Welcome to the tribe.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF9;"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;max-width:600px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <tr><td align="center" style="padding:48px 40px 32px;">
        <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:3px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
        <div style="width:60px;height:2px;background:#F59E0B;margin:16px auto 0;"></div>
      </td></tr>
      <tr><td align="center" style="padding:0 40px 32px;">
        <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#1C1917;letter-spacing:-0.5px;">YOUR ARMOR IS ON THE WAY</h1>
        <p style="margin:0;font-size:14px;color:#78716C;">Order #${orderNumber}</p>
      </td></tr>
      <tr><td style="padding:0 40px 40px;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1C1917;">Hey ${firstName},</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44403C;">You didn't just place an order—you made a declaration. Every thread you wear is a statement. Every stitch is a stand.</p>
        <p style="margin:0;font-size:16px;line-height:1.6;color:#44403C;font-weight:600;">Welcome to the tribe.</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="border-top:1px solid #E7E5E4;padding-top:32px;">
        <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">WHAT YOU'RE WEARING INTO BATTLE</p>
        <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
      </div></td></tr>
      <tr><td style="padding:32px 40px;"><table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;font-size:15px;color:#44403C;">Subtotal</td><td align="right" style="padding:8px 0;font-size:15px;color:#1C1917;">${formatCurrency(order.subtotal_cents, order.currency)}</td></tr>
        ${order.discount_cents > 0 ? `<tr><td style="padding:8px 0;font-size:15px;color:#44403C;">Discount${order.discount_code ? ` (${order.discount_code})` : ""}</td><td align="right" style="padding:8px 0;font-size:15px;color:#059669;">-${formatCurrency(order.discount_cents, order.currency)}</td></tr>` : ""}
        <tr><td style="padding:8px 0;font-size:15px;color:#44403C;">Shipping</td><td align="right" style="padding:8px 0;font-size:15px;${isFreeShipping ? "color:#F59E0B;font-weight:600;" : "color:#1C1917;"}">${isFreeShipping ? "FREE" : formatCurrency(order.shipping_cents, order.currency)}</td></tr>
        <tr><td colspan="2" style="padding:12px 0 0;"><div style="border-top:2px solid #1C1917;"></div></td></tr>
        <tr><td style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">Total</td><td align="right" style="padding:12px 0 0;font-size:18px;font-weight:700;color:#1C1917;">${formatCurrency(order.total_cents, order.currency)}</td></tr>
      </table></td></tr>
      <tr><td style="padding:0 40px 40px;"><div style="background:#FAFAF9;border-radius:8px;padding:24px;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:2px;color:#78716C;text-transform:uppercase;">ETA TO THE FRONT LINE</p>
        <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1C1917;">📦 ${delivery.start} – ${delivery.end}</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#78716C;text-transform:uppercase;">Shipping to:</p>
        ${addressLines.map((l) => `<p style="margin:0;font-size:15px;color:#44403C;line-height:1.5;">${l}</p>`).join("")}
      </div></td></tr>
      <tr><td align="center" style="padding:0 40px 40px;">
        <a href="${siteUrl}/account/orders" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 32px;font-size:14px;font-weight:600;letter-spacing:0.5px;border-radius:0;">TRACK YOUR ORDER →</a>
      </td></tr>
      <tr><td style="padding:0 40px 48px;"><div style="border-top:1px solid #E7E5E4;padding-top:32px;text-align:center;">
        <p style="margin:0 0 16px;font-size:15px;font-style:italic;color:#78716C;line-height:1.6;">"Every outfit is an open door. You don't preach—you spark curiosity. They ask. You answer."</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1C1917;">This isn't just clothing. It's armor.</p>
      </div></td></tr>
      <tr><td style="background:#1C1917;padding:32px 40px;"><table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center"><p style="margin:0 0 4px;font-size:14px;color:#A8A29E;">Questions? We've got your back.</p><a href="mailto:hello@lineofjudah.com" style="font-size:14px;color:#FFFFFF;text-decoration:none;">hello@lineofjudah.com</a></td></tr>
        <tr><td align="center" style="padding-top:24px;"><p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p><p style="margin:0;font-size:13px;color:#78716C;">For those who walk different.</p></td></tr>
      </table></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// ============================================================================
// 2. WORN IN THE WILD INVITE (verbatim from process-worn-in-the-wild-invites)
// ============================================================================
function renderWornInvite(opts: { firstName: string | null; heroImage: string | null; productName: string; uploadUrl: string; }): string {
  const greet = opts.firstName ? `${opts.firstName},` : "";
  const hero = opts.heroImage ? `<img src="${opts.heroImage}" alt="${opts.productName}" style="width:100%;display:block;" />` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Worn in the wild</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;color:#111111;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;">
    ${hero}
    <div style="padding:40px 28px 28px;">
      <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400;line-height:1.1;margin:0 0 12px;color:#111111;letter-spacing:-0.01em;">Worn in the wild.</h1>
      <div style="width:40%;height:1px;background:#9ca3af;opacity:0.6;margin:0 0 28px;"></div>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 16px;">${greet}</p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 16px;">It's been five days since your <strong>${opts.productName}</strong> arrived.</p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 16px;">By now you've worn it. To the gym. To church. To the street. Somewhere it became part of you.</p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 28px;">We're building an archive of how this armor lives in the real world — not on models, not in studios, on the people it was made for.</p>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 32px;">If you have a photo, send it. One tap below.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 28px;"><tr><td>
        <a href="${opts.uploadUrl}" style="display:block;background:#4CAF50;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;text-align:center;padding:16px 24px;letter-spacing:0.04em;text-transform:uppercase;">Send Your Photo</a>
      </td></tr></table>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#6b7280;margin:0 0 32px;">By submitting, you grant us permission to feature your photo on the site and in marketing. You can revoke this anytime by replying to this email. No third-party sharing. Ever.</p>
      <div style="border-top:1px solid #e5e7eb;padding-top:24px;text-align:center;">
        <p style="font-family:Georgia,serif;font-style:italic;font-size:12px;color:#9ca3af;margin:0;letter-spacing:0.04em;">for glory and for beauty</p>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9ca3af;margin:8px 0 0;letter-spacing:0.05em;">— Exodus 28:2</p>
      </div>
    </div>
  </div>
</body></html>`;
}

// ============================================================================
// 3-5. ABANDONED CART (verbatim from process-abandoned-carts)
// ============================================================================
function getEmailFooter(siteUrl: string): string {
  return `<tr><td style="background:#1C1917;padding:32px 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center"><p style="margin:0 0 4px;font-size:14px;color:#A8A29E;">Questions? We've got your back.</p><a href="mailto:hello@lineofjudah.com" style="font-size:14px;color:#FFFFFF;text-decoration:none;">hello@lineofjudah.com</a></td></tr>
    <tr><td align="center" style="padding-top:24px;"><p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p><p style="margin:0;font-size:13px;color:#78716C;">For those who walk different.</p></td></tr>
    <tr><td align="center" style="padding-top:24px;"><p style="margin:0;font-size:12px;color:#57534E;">© 2026 Line of Judah. All rights reserved.</p><p style="margin:8px 0 0;"><a href="${siteUrl}/privacy-policy" style="font-size:12px;color:#57534E;text-decoration:none;">Privacy</a><span style="color:#44403C;margin:0 8px;">•</span><a href="${siteUrl}/terms-of-service" style="font-size:12px;color:#57534E;text-decoration:none;">Terms</a><span style="color:#44403C;margin:0 8px;">•</span><a href="${SITE_URL}/unsubscribe?test=1" style="font-size:12px;color:#57534E;text-decoration:none;">Unsubscribe</a></p></td></tr>
  </table></td></tr>`;
}

function getEmail1Html(cart: any, recoveryUrl: string, siteUrl: string): string {
  const itemsHtml = cart.cart_items.map((item: any) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;"><img src="${item.image}" alt="${item.name}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;border-radius:4px;" /></td>
      <td style="padding:16px;border-bottom:1px solid #E7E5E4;vertical-align:top;"><p style="margin:0 0 4px;font-size:14px;font-weight:500;color:#1C1917;">${item.name}</p><p style="margin:0;font-size:12px;color:#78716C;">Size: ${item.size || 'One Size'}${item.color ? ` · ${item.color}` : ''}</p></td>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;text-align:right;vertical-align:top;"><p style="margin:0;font-size:14px;font-weight:500;color:#1C1917;">${item.priceFormatted}</p></td>
    </tr>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Your armor is waiting</title></head>
<body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;"><tr><td align="center" style="padding:40px 20px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p><div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div></td></tr>
  <tr><td style="padding:48px 40px 32px;text-align:center;"><h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">YOUR ARMOR IS WAITING</h1><p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">You started something. Your selection is on standby—<br/>armor ready, mission waiting.</p></td></tr>
  <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${itemsHtml}</table></td></tr>
  <tr><td style="padding:24px 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="border-top:2px solid #1C1917;padding-top:16px;text-align:right;"><p style="margin:0;font-size:16px;color:#1C1917;">Total: <strong style="font-weight:600;">$${cart.cart_total.toLocaleString()}</strong></p></td></tr></table></td></tr>
  <tr><td style="padding:16px 40px 48px;text-align:center;"><a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">CONTINUE WHERE YOU LEFT OFF</a></td></tr>
  <tr><td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;"><p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">"Every outfit is an open door."</p></td></tr>
  ${getEmailFooter(siteUrl)}
</table></td></tr></table></body></html>`;
}

function getEmail2Html(cart: any, recoveryUrl: string, siteUrl: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>The mission continues</title></head>
<body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;"><tr><td align="center" style="padding:40px 20px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p><div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div></td></tr>
  <tr><td style="padding:48px 40px 24px;text-align:center;"><h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">THE MISSION CONTINUES</h1><p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">You came close. Your armor is still waiting—but not forever.<br/>Every piece is a declaration. Don't leave it behind.</p></td></tr>
  <tr><td style="padding:24px 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E7E5E4;border-radius:8px;"><tr><td style="padding:32px;text-align:center;"><p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#78716C;text-transform:uppercase;">YOUR CART</p><p style="margin:0 0 8px;font-size:32px;font-weight:300;color:#1C1917;">$${cart.cart_total.toLocaleString()}</p><p style="margin:0;font-size:13px;color:#78716C;">${cart.cart_items.length} item${cart.cart_items.length > 1 ? 's' : ''} waiting</p></td></tr></table></td></tr>
  <tr><td style="padding:16px 40px 48px;text-align:center;"><a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">GEAR UP NOW</a></td></tr>
  <tr><td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;"><p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">"You don't preach—you spark curiosity. They ask. You answer."</p></td></tr>
  ${getEmailFooter(siteUrl)}
</table></td></tr></table></body></html>`;
}

function getEmail3Html(cart: any, recoveryUrl: string, discountCode: string, siteUrl: string): string {
  const discountedTotal = (cart.cart_total * 0.85).toFixed(2);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>15% reinforcement—your final call</title></head>
<body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;"><tr><td align="center" style="padding:40px 20px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p><div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div></td></tr>
  <tr><td style="padding:48px 40px 24px;text-align:center;"><p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.2em;color:#F59E0B;text-transform:uppercase;">FINAL CALL</p><h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">REINFORCEMENT INCOMING</h1><p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">This is it. We're giving you 15% off to finish<br/>what you started. After this, the next move is yours.</p></td></tr>
  <tr><td style="padding:24px 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:2px solid #1C1917;border-radius:8px;overflow:hidden;"><tr><td style="padding:32px;text-align:center;background:#FAFAF9;"><p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#78716C;text-transform:uppercase;">— EXCLUSIVE OFFER —</p><p style="margin:0 0 12px;font-size:28px;font-weight:600;letter-spacing:0.1em;color:#1C1917;">${discountCode}</p><p style="margin:0;font-size:13px;color:#78716C;">15% off · Expires in 24 hours</p></td></tr></table></td></tr>
  <tr><td style="padding:16px 40px;text-align:center;"><p style="margin:0 0 4px;font-size:14px;color:#A8A29E;text-decoration:line-through;">$${cart.cart_total.toLocaleString()}</p><p style="margin:0;font-size:32px;font-weight:300;color:#1C1917;">$${discountedTotal}</p></td></tr>
  <tr><td style="padding:24px 40px 48px;text-align:center;"><a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">CLAIM YOUR REINFORCEMENT</a><p style="margin:16px 0 0;font-size:12px;color:#A8A29E;">Offer expires in 24 hours</p></td></tr>
  <tr><td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;"><p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">"This isn't just clothing. It's armor."</p></td></tr>
  ${getEmailFooter(siteUrl)}
</table></td></tr></table></body></html>`;
}

// ============================================================================
// 6. REVIEW REQUEST (verbatim from process-review-requests)
// ============================================================================
function buildReviewEmail(order: any, siteUrl: string): { subject: string; html: string } {
  const firstName = order.customer_first_name?.trim() || 'Friend';
  const reviewUrl = `${siteUrl}/community?review=1`;
  const itemsHtml = order.order_items.slice(0, 3).map((it: any) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E7E5E4;width:80px;">${it.product_image_url ? `<img src="${it.product_image_url}" alt="${it.product_name}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;" />` : ''}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #E7E5E4;vertical-align:middle;"><p style="margin:0;font-size:14px;font-weight:500;color:#1C1917;">${it.product_name}</p></td>
      <td style="padding:12px 0;border-bottom:1px solid #E7E5E4;text-align:right;vertical-align:middle;"><a href="${reviewUrl}" style="font-size:12px;color:#4CAF50;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">Review →</a></td>
    </tr>`).join('');
  const subject = 'How did your armor serve you?';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#F5F5F4;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F5F4;"><tr><td align="center" style="padding:40px 20px;">
  <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#FFFFFF;">
    <tr><td style="padding:48px 40px 24px;text-align:center;"><p style="margin:0 0 24px;font-size:11px;font-weight:700;letter-spacing:3px;color:#4CAF50;text-transform:uppercase;">Nine Days In</p><h1 style="margin:0 0 16px;font-size:32px;font-weight:300;line-height:1.2;color:#1C1917;letter-spacing:-0.5px;">How did your<br/>armor serve you?</h1><p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">${firstName}, your order arrived nine days ago. We'd be grateful for your honest words — the good, the imperfect, all of it. Other warriors are watching, weighing.</p></td></tr>
    <tr><td style="padding:24px 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${itemsHtml}</table></td></tr>
    <tr><td style="padding:16px 40px 48px;text-align:center;"><a href="${reviewUrl}" style="display:inline-block;padding:16px 40px;background:#1C1917;color:#FFFFFF;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Leave a Review</a><p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#78716C;font-style:italic;">"And thou shalt make holy garments for Aaron thy brother for glory and for beauty." — Exodus 28:2</p></td></tr>
    <tr><td style="background:#1C1917;padding:32px 40px;text-align:center;"><p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p><p style="margin:0 0 16px;font-size:13px;color:#78716C;">For those who walk different.</p><p style="margin:0;font-size:12px;color:#57534E;"><a href="${SITE_URL}/unsubscribe?test=1" style="color:#57534E;text-decoration:underline;">Unsubscribe</a></p></td></tr>
  </table></td></tr></table></body></html>`;
  return { subject, html };
}

// ============================================================================
// Resend send helper
// ============================================================================
async function sendViaResend(apiKey: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to: [TEST_TO], subject: `[TEST] ${subject}`, html }),
  });
  const text = await res.text();
  let parsed: unknown = null;
  try { parsed = JSON.parse(text); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, body: parsed ?? text };
}

// ============================================================================
// Mock data
// ============================================================================
const mockOrder = {
  id: "abcdef12-3456-7890-abcd-ef1234567890",
  customer_email: TEST_TO,
  customer_first_name: "Parker",
  customer_last_name: "Test",
  shipping_address: { address: "123 King St W", city: "Toronto", state: "ON", postalCode: "M5H 1A1", country: "CA" },
  subtotal_cents: 21800, shipping_cents: 0, discount_cents: 0, total_cents: 21800,
  shipping_method: "Standard", discount_code: null,
  created_at: new Date().toISOString(), currency: "cad",
};

const mockOrderItems = [
  { id: "i1", product_name: "Armor Tee — Forest", product_image_url: "https://lineofjudah.clothing/og-image.jpg", variant_size: "L", variant_color: "Forest Green", quantity: 1, unit_price_cents: 8900, total_cents: 8900 },
  { id: "i2", product_name: "Anointed Hoodie — Chrome", product_image_url: "https://lineofjudah.clothing/og-image.jpg", variant_size: "M", variant_color: "Silver Chrome", quantity: 1, unit_price_cents: 12900, total_cents: 12900 },
];

const mockCart = {
  id: "cart-test-1", email: TEST_TO,
  cart_items: [
    { id: 1, name: "Armor Tee — Forest", price: 89, priceFormatted: "$89.00", image: "https://lineofjudah.clothing/og-image.jpg", quantity: 1, category: "tees", size: "L", color: "Forest Green" },
    { id: 2, name: "Anointed Hoodie — Chrome", price: 129, priceFormatted: "$129.00", image: "https://lineofjudah.clothing/og-image.jpg", quantity: 1, category: "hoodies", size: "M", color: "Silver Chrome" },
  ],
  cart_total: 218, recovery_token: "TEST_TOKEN", status: "abandoned", discount_code: "LOJ15-TEST00",
  created_at: new Date().toISOString(), email_1_sent_at: null, email_2_sent_at: null, email_3_sent_at: null,
};

const mockReviewOrder = {
  id: "rev-test-1", customer_email: TEST_TO, customer_first_name: "Parker",
  delivered_at: new Date().toISOString(),
  order_items: [
    { product_id: "p1", product_name: "Armor Tee — Forest", product_image_url: "https://lineofjudah.clothing/og-image.jpg" },
    { product_id: "p2", product_name: "Anointed Hoodie — Chrome", product_image_url: "https://lineofjudah.clothing/og-image.jpg" },
  ],
};

// ============================================================================
// Handler
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const recoveryUrl = `${SITE_URL}/cart?recover=TEST_TOKEN`;
  const review = buildReviewEmail(mockReviewOrder, SITE_URL);

  const tests = [
    { name: "1-order-confirmation", subject: "Your Line of Judah order — confirmed", html: buildOrderConfirmationHtml(mockOrder, mockOrderItems, SITE_URL) },
    { name: "2-worn-in-the-wild-invite", subject: "Worn in the wild", html: renderWornInvite({ firstName: "Parker", heroImage: "https://lineofjudah.clothing/og-image.jpg", productName: "Armor Tee — Forest", uploadUrl: `${SITE_URL}/worn/upload?t=TEST` }) },
    { name: "3-abandoned-cart-1-gentle-reminder", subject: "You left something behind", html: getEmail1Html(mockCart, recoveryUrl, SITE_URL) },
    { name: "4-abandoned-cart-2-social-proof", subject: "Still thinking it over?", html: getEmail2Html(mockCart, recoveryUrl, SITE_URL) },
    { name: "5-abandoned-cart-3-discount", subject: "15% off — last call on your cart", html: getEmail3Html(mockCart, recoveryUrl, "LOJ15-TEST00", SITE_URL) },
    { name: "6-review-request", subject: review.subject, html: review.html },
  ];

  const results: any[] = [];
  for (const t of tests) {
    try {
      const r = await sendViaResend(apiKey, t.subject, t.html);
      results.push({ template: t.name, ok: r.ok, status: r.status, response: r.body });
    } catch (e) {
      results.push({ template: t.name, ok: false, error: (e as Error).message });
    }
    // Throttle to stay under Resend's 5 req/s limit
    await new Promise((res) => setTimeout(res, 300));
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  return new Response(
    JSON.stringify({ to: TEST_TO, total: tests.length, sent, failedCount: failed.length, results }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
