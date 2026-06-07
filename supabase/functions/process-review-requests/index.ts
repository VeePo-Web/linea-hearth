import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { resolveImageUrl } from "../_shared/imageUrl.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAYS_AFTER_DELIVERY = 9;
const MAX_LOOKBACK_DAYS = 30;

interface OrderItem {
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
}

interface EligibleOrder {
  id: string;
  customer_email: string;
  customer_first_name: string | null;
  delivered_at: string;
  order_items: OrderItem[];
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function buildEmail(order: EligibleOrder, siteUrl: string): { subject: string; html: string } {
  const firstName = order.customer_first_name?.trim() || 'Friend';
  const reviewUrl = `${siteUrl}/community?review=1`;

  const itemsHtml = order.order_items.slice(0, 3).map((it) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E7E5E4;width:80px;">
        <img src="${resolveImageUrl(it.product_image_url)}" alt="${it.product_name}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;" />
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #E7E5E4;vertical-align:middle;">
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;font-weight:500;color:#1C1917;">${it.product_name}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E7E5E4;text-align:right;vertical-align:middle;">
        <a href="${reviewUrl}" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#4CAF50;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">Review →</a>
      </td>
    </tr>
  `).join('');


  const subject = 'How does it wear?';
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#F5F5F4;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F5F5F4;">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#FFFFFF;">
      <tr><td align="center" style="padding:40px 40px 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
          <td style="vertical-align:middle;padding-right:10px;line-height:0;">
            <img src="https://lineofjudah.clothing/favicon-180.png" width="22" height="22" alt="" style="display:block;border:0;border-radius:4px;" />
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:3px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
          </td>
        </tr></table>
        <div style="width:60px;height:1px;background:#C5C7CA;margin:14px auto 0;opacity:0.7;"></div>
      </td></tr>
      <tr><td style="padding:32px 40px 24px;text-align:center;">
        <p style="margin:0 0 24px;font-size:11px;font-weight:700;letter-spacing:3px;color:#4CAF50;text-transform:uppercase;">Nine Days In</p>
        <h1 style="margin:0 0 16px;font-size:32px;font-weight:300;line-height:1.2;color:#1C1917;letter-spacing:-0.5px;">How's it wearing?</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">${firstName}, your order arrived nine days ago. We'd love to hear how it's holding up — the good, the imperfect, all of it. Reviews from real customers shape what we make next.</p>
      </td></tr>
      <tr><td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${itemsHtml}</table>
      </td></tr>
      <tr><td style="padding:16px 40px 48px;text-align:center;">
        <a href="${reviewUrl}" style="display:inline-block;padding:16px 40px;background:#1C1917;color:#FFFFFF;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Leave a Review</a>
        <p style="margin:24px 0 8px;font-size:13px;color:#57534E;font-style:italic;">Thank you for shaping ours.</p>
        <p style="margin:0 0 16px;font-size:13px;color:#A8A29E;font-style:italic;">— Olliver Abbey and the Line of Judah Team</p>
        <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#78716C;font-style:italic;">"And thou shalt make holy garments for Aaron thy brother for glory and for beauty." — Exodus 28:2</p>
      </td></tr>
      <tr><td style="background:#1C1917;padding:32px 40px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p>
        <p style="margin:0 0 16px;font-size:13px;color:#78716C;">Faith you can wear.</p>
        <p style="margin:0;font-size:12px;color:#57534E;">
          <a href="#" style="color:#57534E;text-decoration:underline;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  return { subject, html };
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  unsubscribeUrl: string,
  resendApiKey: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const finalHtml = html.replace('href="#"', `href="${unsubscribeUrl}"`);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Line of Judah <noreply@lineofjudah.clothing>',
        to: [to],
        subject,
        html: finalHtml,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@lineofjudah.clothing>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${txt.slice(0, 300)}` };
    }
    const data = await res.json();
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const unsubSecret = Deno.env.get('MARKETING_UNSUBSCRIBE_SECRET') ?? 'dev-secret';
  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://lineofjudah-clothing.lovable.app';

  const supabase = createClient(supabaseUrl, serviceKey);

  const cutoffSent = new Date(Date.now() - DAYS_AFTER_DELIVERY * 86400_000).toISOString();
  const lookbackFloor = new Date(Date.now() - MAX_LOOKBACK_DAYS * 86400_000).toISOString();

  // Eligible orders: delivered ≥9 days ago, ≤30 days ago, not yet sent, not cancelled/refunded
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, customer_email, customer_first_name, delivered_at, status, order_items(product_id, product_name, product_image_url)')
    .not('delivered_at', 'is', null)
    .lte('delivered_at', cutoffSent)
    .gte('delivered_at', lookbackFloor)
    .is('review_request_sent_at', null)
    .not('status', 'in', '(cancelled,refunded)')
    .limit(100);

  if (error) {
    console.error('Query failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: Array<{ orderId: string; status: string; detail?: string }> = [];

  for (const order of (orders ?? []) as EligibleOrder[]) {
    const email = order.customer_email?.toLowerCase().trim();
    if (!email) {
      results.push({ orderId: order.id, status: 'skipped', detail: 'no email' });
      continue;
    }

    // Suppression check
    const { data: suppressed } = await supabase
      .from('marketing_suppressions')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (suppressed) {
      await supabase.from('orders').update({ review_request_sent_at: new Date().toISOString() }).eq('id', order.id);
      results.push({ orderId: order.id, status: 'suppressed' });
      continue;
    }

    if (!order.order_items?.length) {
      results.push({ orderId: order.id, status: 'skipped', detail: 'no items' });
      continue;
    }

    // Build unsubscribe URL (HMAC over email)
    const token = await hmacHex(unsubSecret, email);
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-marketing?token=${token}&email=${encodeURIComponent(email)}`;

    const { subject, html } = buildEmail(order, siteUrl);

    if (!resendApiKey) {
      console.log(`[STUB] review request → ${email} for order ${order.id}`);
      await supabase.from('orders').update({ review_request_sent_at: new Date().toISOString() }).eq('id', order.id);
      await supabase.from('marketing_email_log').insert({
        cart_id: null,
        email,
        email_number: 4,
        status: 'stubbed',
        provider_message_id: 'stub',
      });
      results.push({ orderId: order.id, status: 'stubbed' });
      continue;
    }

    const sendRes = await sendViaResend(email, subject, html, unsubscribeUrl, resendApiKey);

    await supabase.from('marketing_email_log').insert({
      cart_id: null,
      email,
      email_number: 4,
      status: sendRes.ok ? 'sent' : 'failed',
      provider_message_id: sendRes.id ?? null,
      error: sendRes.error ?? null,
    });

    if (sendRes.ok) {
      await supabase.from('orders').update({ review_request_sent_at: new Date().toISOString() }).eq('id', order.id);
      results.push({ orderId: order.id, status: 'sent' });
    } else {
      results.push({ orderId: order.id, status: 'failed', detail: sendRes.error });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
