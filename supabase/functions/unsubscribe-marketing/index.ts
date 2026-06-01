import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function page(title: string, message: string, accent: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Line of Judah</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0a;color:#e7e5e4;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{max-width:480px;width:100%;background:#141414;border:1px solid #2a2a2a;padding:48px 32px;text-align:center}
  .badge{display:inline-block;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accent};border-bottom:1px solid ${accent}66;padding-bottom:6px;margin-bottom:24px}
  h1{font-size:24px;font-weight:300;letter-spacing:-0.01em;margin-bottom:16px;color:#fff}
  p{font-size:14px;line-height:1.6;color:#a8a29e;margin-bottom:24px}
  a{display:inline-block;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#fff;border:1px solid #4CAF50;padding:14px 28px;text-decoration:none}
  a:hover{background:#4CAF50}
</style></head>
<body><div class="card"><div class="badge">Line of Judah</div><h1>${title}</h1><p>${message}</p><a href="https://lineofjudah-clothing.lovable.app/shop">Continue browsing</a></div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? "";
    const email = (url.searchParams.get("email") ?? "").toLowerCase().trim();

    if (!token || !email) {
      return new Response(page("Invalid link", "This unsubscribe link is missing required information.", "#c44"), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const secret = Deno.env.get("MARKETING_UNSUBSCRIBE_SECRET");
    if (!secret) {
      console.error("MARKETING_UNSUBSCRIBE_SECRET not set");
      return new Response(page("Unavailable", "Please try again later.", "#c44"), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const expected = await hmacHex(secret, email);
    if (!timingSafeEqual(expected, token)) {
      return new Response(page("Invalid link", "This unsubscribe link could not be verified.", "#c44"), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await sb.from("marketing_suppressions").upsert(
      { email, reason: "unsubscribe" },
      { onConflict: "email" },
    );

    return new Response(
      page(
        "Unsubscribed",
        `You'll no longer receive cart recovery emails at <strong>${email}</strong>. Order confirmations and shipping updates are unaffected.`,
        "#4CAF50",
      ),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (e) {
    console.error("unsubscribe-marketing error:", e);
    return new Response(page("Error", "Something went wrong. Please try again.", "#c44"), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }
});
