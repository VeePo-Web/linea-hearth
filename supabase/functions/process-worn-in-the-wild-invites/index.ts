// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create as createJwt, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { resolveImageUrl } from "../_shared/imageUrl.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://lineofjudah-clothing.lovable.app";
const FROM_EMAIL = "Line of Judah <noreply@lineofjudah.com>";

async function getJwtKey(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function renderEmail(opts: {
  firstName: string | null;
  heroImage: string | null;
  productName: string;
  uploadUrl: string;
}): string {
  const greet = opts.firstName ? `${opts.firstName},` : "";
  const hero = `<img src="${resolveImageUrl(opts.heroImage)}" alt="${opts.productName}" style="width:100%;display:block;" />`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Worn in the wild</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;color:#111111;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;">

    <!-- Brand header with favicon -->
    <div style="padding:28px 28px 0;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
        <td style="vertical-align:middle;padding-right:10px;line-height:0;">
          <img src="https://lineofjudah.clothing/favicon-180.png" width="22" height="22" alt="" style="display:block;border:0;border-radius:4px;" />
        </td>
        <td style="vertical-align:middle;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;color:#111111;text-transform:uppercase;">LINE OF JUDAH</p>
        </td>
      </tr></table>
      <div style="width:60px;height:1px;background:#C5C7CA;margin:14px auto 0;opacity:0.7;"></div>
    </div>

    ${hero}
    <div style="padding:40px 28px 28px;">
      <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400;line-height:1.1;margin:0 0 12px;color:#111111;letter-spacing:-0.01em;">We'd love to see it on you.</h1>
      <div style="width:40%;height:1px;background:#C5C7CA;opacity:0.7;margin:0 0 28px;"></div>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 16px;">${greet}</p>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 16px;">
        Your <strong>${opts.productName}</strong> arrived a few days ago. By now you've worn it somewhere — and we'd love to see where.
      </p>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 16px;">
        We're building an archive of how this collection is worn in real life — by the people it was made for.
      </p>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1a1a1a;margin:0 0 32px;">
        If you have a photo, we'd be honored to include it. One tap below — that's it.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 28px;">
        <tr><td>
          <a href="${opts.uploadUrl}" style="display:block;background:#4CAF50;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;text-decoration:none;text-align:center;padding:16px 24px;letter-spacing:0.04em;text-transform:uppercase;">Send Your Photo</a>
        </td></tr>
      </table>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#6b7280;margin:0 0 32px;">
        By submitting, you grant us permission to feature your photo on the site and in marketing. You can revoke this anytime by replying to this email. No third-party sharing. Ever.
      </p>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;text-align:center;">
        <p style="font-family:Georgia,serif;font-style:italic;font-size:13px;color:#57534E;margin:0 0 12px;">Thank you for being part of this.</p>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;margin:0 0 16px;font-style:italic;">— Olliver Abbey and the Line of Judah Team</p>
        <p style="font-family:Georgia,serif;font-style:italic;font-size:12px;color:#9ca3af;margin:0;letter-spacing:0.04em;">for glory and for beauty</p>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9ca3af;margin:8px 0 0;letter-spacing:0.05em;">— Exodus 28:2</p>
      </div>
    </div>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const jwtSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // reuse for signing
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Find orders delivered 5+ days ago (or shipped 9+ days ago as fallback) with no invite yet
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const nineDaysAgo = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, customer_email, customer_first_name, delivered_at, shipped_at, status, payment_status")
      .eq("payment_status", "paid")
      .or(`delivered_at.lte.${fiveDaysAgo},and(delivered_at.is.null,shipped_at.lte.${nineDaysAgo})`)
      .not("customer_email", "is", null)
      .limit(50);

    if (ordersError) throw ordersError;
    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out orders that already have an invite
    const orderIds = orders.map((o) => o.id);
    const { data: existing } = await supabase
      .from("worn_in_the_wild_invites")
      .select("order_id")
      .in("order_id", orderIds);
    const existingSet = new Set((existing || []).map((r) => r.order_id));

    const candidates = orders.filter((o) => !existingSet.has(o.id));

    // Filter out opted-out customers
    const emails = candidates.map((c) => c.customer_email);
    const { data: optedOut } = await supabase
      .from("profiles")
      .select("email")
      .in("email", emails)
      .eq("worn_invites_opted_out", true);
    const optedSet = new Set((optedOut || []).map((p) => p.email));

    const key = await getJwtKey(jwtSecret);
    let sent = 0;
    let failed = 0;

    for (const order of candidates) {
      if (optedSet.has(order.customer_email)) continue;

      // Get the largest order item for hero
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, product_image_url, total_cents")
        .eq("order_id", order.id)
        .order("total_cents", { ascending: false })
        .limit(1);

      const hero = items?.[0] || null;
      if (!hero) continue;

      // Generate signed JWT
      const token = await createJwt(
        { alg: "HS256", typ: "JWT" },
        {
          order_id: order.id,
          email: order.customer_email,
          exp: getNumericDate(60 * 60 * 24 * 30), // 30 days
        },
        key,
      );

      const tokenHash = await sha256(token);
      const uploadUrl = `${SITE_URL}/worn-in-the-wild/upload?token=${encodeURIComponent(token)}`;

      // Insert invite record
      const { error: insertErr } = await supabase
        .from("worn_in_the_wild_invites")
        .insert({
          order_id: order.id,
          customer_email: order.customer_email,
          upload_token_hash: tokenHash,
        });

      if (insertErr) {
        console.error("Invite insert failed", order.id, insertErr);
        failed++;
        continue;
      }

      // Send email
      const html = renderEmail({
        firstName: order.customer_first_name,
        heroImage: hero.product_image_url,
        productName: hero.product_name,
        uploadUrl,
      });

      if (!resendApiKey) {
        console.log(`[STUB] Would send worn-invite to ${order.customer_email} for order ${order.id}`);
        sent++;
        continue;
      }

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [order.customer_email],
          subject: "Show us how you wear it.",
          html,
        }),
      });

      if (resendRes.ok) {
        sent++;
      } else {
        console.error("Resend failed", await resendRes.text());
        failed++;
      }
    }

    return new Response(JSON.stringify({ ok: true, candidates: candidates.length, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-worn-in-the-wild-invites error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
