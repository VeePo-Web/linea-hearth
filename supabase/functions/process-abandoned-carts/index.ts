import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email timing configuration
const EMAIL_1_DELAY_HOURS = 1; // 1 hour after abandonment
const EMAIL_2_DELAY_HOURS = 24; // 24 hours after abandonment
const EMAIL_3_DELAY_HOURS = 72; // 72 hours after abandonment (with discount)

interface CartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

interface AbandonedCart {
  id: string;
  email: string;
  cart_items: CartItem[];
  cart_total: number;
  recovery_token: string;
  status: string;
  discount_code: string | null;
  created_at: string;
  email_1_sent_at: string | null;
  email_2_sent_at: string | null;
  email_3_sent_at: string | null;
}

// Generate a unique discount code
function generateDiscountCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LOJ15-';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// HMAC-SHA256 hex helper for signed unsubscribe links.
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

interface SendResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

// Real Resend send with List-Unsubscribe headers for Gmail/Yahoo bulk-sender compliance.
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeUrl: string,
  resendApiKey?: string,
): Promise<SendResult> {
  // Inject the unsubscribe URL into the footer placeholder (templates render href="#").
  const finalHtml = html.replace('href="#"', `href="${unsubscribeUrl}"`);

  if (!resendApiKey) {
    console.log(`[STUB] Would send email to ${to}: ${subject}`);
    return { ok: true, providerMessageId: 'stub' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Line of Judah <noreply@lineofjudah.com>',
        to: [to],
        subject,
        html: finalHtml,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@lineofjudah.com>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { ok: false, error: `Resend ${response.status}: ${error.slice(0, 300)}` };
    }

    const data = await response.json();
    return { ok: true, providerMessageId: data?.id };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Failed to send email:', msg);
    return { ok: false, error: msg };
  }
}

// Shared email footer component
function getEmailFooter(siteUrl: string): string {
  return `
    <!-- Dark Footer -->
    <tr>
      <td style="background:#1C1917;padding:32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;color:#A8A29E;">Questions? We've got your back.</p>
              <a href="mailto:hello@lineofjudah.com" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;color:#FFFFFF;text-decoration:none;">hello@lineofjudah.com</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;color:#FFFFFF;text-transform:uppercase;">LINE OF JUDAH</p>
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#78716C;">For those who walk different.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <a href="https://instagram.com" style="display:inline-block;margin:0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#A8A29E;text-decoration:none;">Instagram</a>
              <span style="color:#57534E;">•</span>
              <a href="https://tiktok.com" style="display:inline-block;margin:0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#A8A29E;text-decoration:none;">TikTok</a>
              <span style="color:#57534E;">•</span>
              <a href="https://youtube.com" style="display:inline-block;margin:0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#A8A29E;text-decoration:none;">YouTube</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;">© 2026 Line of Judah. All rights reserved.</p>
              <p style="margin:8px 0 0;">
                <a href="${siteUrl}/privacy-policy" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;text-decoration:none;">Privacy</a>
                <span style="color:#44403C;margin:0 8px;">•</span>
                <a href="${siteUrl}/terms-of-service" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;text-decoration:none;">Terms</a>
                <span style="color:#44403C;margin:0 8px;">•</span>
                <a href="#" style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#57534E;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

// Email templates using premium editorial tone - Line of Judah brand voice
function getEmail1Html(cart: AbandonedCart, recoveryUrl: string, siteUrl: string): string {
  const itemsHtml = cart.cart_items.map(item => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;">
        <img src="${item.image}" alt="${item.name}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;border-radius:4px;" />
      </td>
      <td style="padding:16px;border-bottom:1px solid #E7E5E4;vertical-align:top;">
        <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;font-weight:500;color:#1C1917;">${item.name}</p>
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#78716C;">Size: ${item.size || 'One Size'}${item.color ? ` · ${item.color}` : ''}</p>
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #E7E5E4;text-align:right;vertical-align:top;">
        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;font-weight:500;color:#1C1917;">${item.priceFormatted}</p>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <title>Your armor is waiting | Line of Judah</title>
    </head>
    <body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                  <div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div>
                </td>
              </tr>
              
              <!-- Hero -->
              <tr>
                <td style="padding:48px 40px 32px;text-align:center;">
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">
                    YOUR ARMOR IS WAITING
                  </h1>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">
                    You started something. Your selection is on standby—<br/>armor ready, mission waiting.
                  </p>
                </td>
              </tr>
              
              <!-- Items -->
              <tr>
                <td style="padding:0 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>
              
              <!-- Total -->
              <tr>
                <td style="padding:24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="border-top:2px solid #1C1917;padding-top:16px;text-align:right;">
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:16px;color:#1C1917;">
                          Total: <strong style="font-weight:600;">$${cart.cart_total.toLocaleString()}</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding:16px 40px 48px;text-align:center;">
                  <a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
                    CONTINUE WHERE YOU LEFT OFF
                  </a>
                </td>
              </tr>
              
              <!-- Brand Quote -->
              <tr>
                <td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;">
                  <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">
                    "Every outfit is an open door."
                  </p>
                </td>
              </tr>
              
              ${getEmailFooter(siteUrl)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getEmail2Html(cart: AbandonedCart, recoveryUrl: string, siteUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <title>The mission continues | Line of Judah</title>
    </head>
    <body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                  <div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div>
                </td>
              </tr>
              
              <!-- Hero -->
              <tr>
                <td style="padding:48px 40px 24px;text-align:center;">
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">
                    THE MISSION CONTINUES
                  </h1>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">
                    You came close. Your armor is still waiting—but not forever.<br/>Every piece is a declaration. Don't leave it behind.
                  </p>
                </td>
              </tr>
              
              <!-- Summary Card -->
              <tr>
                <td style="padding:24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E7E5E4;border-radius:8px;">
                    <tr>
                      <td style="padding:32px;text-align:center;">
                        <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#78716C;text-transform:uppercase;">
                          YOUR CART
                        </p>
                        <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:32px;font-weight:300;color:#1C1917;">
                          $${cart.cart_total.toLocaleString()}
                        </p>
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#78716C;">
                          ${cart.cart_items.length} item${cart.cart_items.length > 1 ? 's' : ''} waiting
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding:16px 40px 48px;text-align:center;">
                  <a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
                    GEAR UP NOW
                  </a>
                </td>
              </tr>
              
              <!-- Brand Quote -->
              <tr>
                <td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;">
                  <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">
                    "You don't preach—you spark curiosity. They ask. You answer."
                  </p>
                </td>
              </tr>
              
              ${getEmailFooter(siteUrl)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getEmail3Html(cart: AbandonedCart, recoveryUrl: string, discountCode: string, siteUrl: string): string {
  const discountedTotal = (cart.cart_total * 0.85).toFixed(2);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <title>15% reinforcement—your final call | Line of Judah</title>
    </head>
    <body style="margin:0;padding:0;background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAFAF9;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #E7E5E4;">
                  <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
                  <div style="width:40px;height:2px;background:#F59E0B;margin:0 auto;"></div>
                </td>
              </tr>
              
              <!-- Hero -->
              <tr>
                <td style="padding:48px 40px 24px;text-align:center;">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.2em;color:#F59E0B;text-transform:uppercase;">
                    FINAL CALL
                  </p>
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;letter-spacing:0.02em;color:#1C1917;">
                    REINFORCEMENT INCOMING
                  </h1>
                  <p style="margin:0;font-size:15px;line-height:1.6;color:#57534E;">
                    This is it. We're giving you 15% off to finish<br/>what you started. After this, the next move is yours.
                  </p>
                </td>
              </tr>
              
              <!-- Discount Code Card -->
              <tr>
                <td style="padding:24px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:2px solid #1C1917;border-radius:8px;overflow:hidden;">
                    <tr>
                      <td style="padding:32px;text-align:center;background:#FAFAF9;">
                        <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.15em;color:#78716C;text-transform:uppercase;">
                          — EXCLUSIVE OFFER —
                        </p>
                        <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:28px;font-weight:600;letter-spacing:0.1em;color:#1C1917;">
                          ${discountCode}
                        </p>
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:13px;color:#78716C;">
                          15% off · Expires in 24 hours
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Price Comparison -->
              <tr>
                <td style="padding:16px 40px;text-align:center;">
                  <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;color:#A8A29E;text-decoration:line-through;">
                    $${cart.cart_total.toLocaleString()}
                  </p>
                  <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:32px;font-weight:300;color:#1C1917;">
                    $${discountedTotal}
                  </p>
                </td>
              </tr>
              
              <!-- CTA -->
              <tr>
                <td style="padding:24px 40px 48px;text-align:center;">
                  <a href="${recoveryUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:16px 48px;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;border-radius:4px;">
                    CLAIM YOUR REINFORCEMENT
                  </a>
                  <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:12px;color:#A8A29E;">
                    Offer expires in 24 hours
                  </p>
                </td>
              </tr>
              
              <!-- Brand Quote -->
              <tr>
                <td style="padding:32px 40px;background:#FAFAF9;border-top:1px solid #E7E5E4;">
                  <p style="margin:0;font-size:14px;font-style:italic;color:#78716C;text-align:center;line-height:1.6;">
                    "This isn't just clothing. It's armor."
                  </p>
                </td>
              </tr>
              
              ${getEmailFooter(siteUrl)}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

const FUNCTIONS_BASE = `${Deno.env.get('SUPABASE_URL') || ''}/functions/v1`;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type EmailNumber = 1 | 2 | 3;

interface ProcessDeps {
  supabase: ReturnType<typeof createClient>;
  resendApiKey?: string;
  unsubscribeSecret: string;
  siteUrl: string;
}

// Per-cart pre-send guard. Returns null if the send should proceed, or a
// terminal status string if the sequence must be stopped + logged + skipped.
async function suppressionReason(
  deps: ProcessDeps,
  cart: AbandonedCart,
): Promise<null | { status: string; reason: string }> {
  // 1. Expired (>30 days from creation).
  if (Date.now() - new Date(cart.created_at).getTime() > THIRTY_DAYS_MS) {
    return { status: 'expired', reason: 'cart older than 30 days' };
  }

  // 2. Customer already placed a paid order after the cart was captured.
  const { data: paidOrder } = await deps.supabase
    .from('orders')
    .select('id')
    .eq('customer_email', cart.email.toLowerCase())
    .eq('payment_status', 'paid')
    .gt('created_at', cart.created_at)
    .limit(1)
    .maybeSingle();
  if (paidOrder) {
    return { status: 'converted', reason: 'customer placed a paid order' };
  }

  // 3. Email is on the marketing suppression list (unsubscribe/bounce/etc.).
  const { data: suppression } = await deps.supabase
    .from('marketing_suppressions')
    .select('email')
    .eq('email', cart.email.toLowerCase())
    .maybeSingle();
  if (suppression) {
    return { status: 'suppressed', reason: 'email on suppression list' };
  }

  return null;
}

async function processCart(
  deps: ProcessDeps,
  cart: AbandonedCart,
  emailNumber: EmailNumber,
  subject: string,
  buildHtml: (recoveryUrl: string) => { html: string; discountCode?: string },
): Promise<'sent' | 'skipped' | 'failed'> {
  const skip = await suppressionReason(deps, cart);
  if (skip) {
    await deps.supabase
      .from('abandoned_carts')
      .update({ status: skip.status })
      .eq('id', cart.id);
    await deps.supabase.from('marketing_email_log').insert({
      cart_id: cart.id,
      email: cart.email,
      email_number: emailNumber,
      status: `skipped_${skip.status}`,
      error: skip.reason,
    });
    return 'skipped';
  }

  const recoveryUrl = `${deps.siteUrl}/recover-cart?token=${cart.recovery_token}`;
  const emailLower = cart.email.toLowerCase();
  const unsubToken = await hmacHex(deps.unsubscribeSecret, emailLower);
  const unsubscribeUrl = `${FUNCTIONS_BASE}/unsubscribe-marketing?token=${unsubToken}&email=${encodeURIComponent(emailLower)}`;

  const { html, discountCode } = buildHtml(recoveryUrl);
  const result = await sendEmail(cart.email, subject, html, unsubscribeUrl, deps.resendApiKey);

  await deps.supabase.from('marketing_email_log').insert({
    cart_id: cart.id,
    email: cart.email,
    email_number: emailNumber,
    provider_message_id: result.providerMessageId ?? null,
    status: result.ok ? 'sent' : 'failed',
    error: result.error ?? null,
  });

  if (!result.ok) return 'failed';

  const now = new Date().toISOString();
  const update: Record<string, unknown> =
    emailNumber === 1
      ? { email_1_sent_at: now, status: 'email_1_sent' }
      : emailNumber === 2
        ? { email_2_sent_at: now, status: 'email_2_sent' }
        : { email_3_sent_at: now, status: 'email_3_sent', discount_code: discountCode };

  await deps.supabase.from('abandoned_carts').update(update).eq('id', cart.id);
  return 'sent';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const unsubscribeSecret = Deno.env.get('MARKETING_UNSUBSCRIBE_SECRET') || 'dev-only-do-not-use';
    const siteUrl = Deno.env.get('SITE_URL') || 'https://lineofjudah-clothing.lovable.app';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const deps: ProcessDeps = { supabase, resendApiKey, unsubscribeSecret, siteUrl };

    const now = new Date();
    const results = { email1Sent: 0, email2Sent: 0, email3Sent: 0, skipped: 0, errors: 0 };

    const tally = (r: 'sent' | 'skipped' | 'failed', n: EmailNumber) => {
      if (r === 'skipped') results.skipped++;
      else if (r === 'failed') results.errors++;
      else if (n === 1) results.email1Sent++;
      else if (n === 2) results.email2Sent++;
      else results.email3Sent++;
    };

    // Email 1 — 1h after capture
    const email1Threshold = new Date(now.getTime() - EMAIL_1_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email1Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .is('email_1_sent_at', null)
      .lt('created_at', email1Threshold.toISOString());
    for (const cart of email1Carts || []) {
      const r = await processCart(deps, cart as AbandonedCart, 1, 'Your armor is waiting | Line of Judah', (url) => ({
        html: getEmail1Html(cart as AbandonedCart, url, siteUrl),
      }));
      tally(r, 1);
    }

    // Email 2 — 24h after capture
    const email2Threshold = new Date(now.getTime() - EMAIL_2_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email2Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'email_1_sent')
      .is('email_2_sent_at', null)
      .lt('created_at', email2Threshold.toISOString());
    for (const cart of email2Carts || []) {
      const r = await processCart(deps, cart as AbandonedCart, 2, 'The mission continues | Line of Judah', (url) => ({
        html: getEmail2Html(cart as AbandonedCart, url, siteUrl),
      }));
      tally(r, 2);
    }

    // Email 3 — 72h after capture, with 15% discount
    const email3Threshold = new Date(now.getTime() - EMAIL_3_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email3Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'email_2_sent')
      .is('email_3_sent_at', null)
      .lt('created_at', email3Threshold.toISOString());
    for (const cart of email3Carts || []) {
      const discountCode = generateDiscountCode();
      const r = await processCart(deps, cart as AbandonedCart, 3, '15% reinforcement—your final call | Line of Judah', (url) => ({
        html: getEmail3Html(cart as AbandonedCart, url, discountCode, siteUrl),
        discountCode,
      }));
      tally(r, 3);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Abandoned cart processing complete',
        results,
        note: resendApiKey ? 'Emails sent via Resend' : 'Emails stubbed (RESEND_API_KEY not configured)',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    console.error('Error processing abandoned carts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

