// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify as verifyJwt } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

async function getJwtKey(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function generateRewardCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "WORN-";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function detectMimeFromMagicBytes(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  // WEBP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  // HEIC: ....ftypheic / ftypheix / ftypmif1 / ftypmsf1
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return "image/heic";
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();
    const token = form.get("token") as string | null;
    const file = form.get("photo") as File | null;
    const caption = (form.get("caption") as string | null)?.slice(0, 140) || null;
    const city = (form.get("city") as string | null)?.slice(0, 80) || null;
    const consent = form.get("consent") === "true";

    if (!token || !file || !consent) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "file_too_large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return new Response(JSON.stringify({ error: "unsupported_type" }), {
        status: 415,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwtSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const key = await getJwtKey(jwtSecret);

    let payload: any;
    try {
      payload = await verifyJwt(token, key);
    } catch {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify invite + not already submitted
    const { data: invite } = await supabase
      .from("worn_in_the_wild_invites")
      .select("order_id, customer_email, submitted_at")
      .eq("order_id", payload.order_id)
      .maybeSingle();

    if (!invite) {
      return new Response(JSON.stringify({ error: "invite_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (invite.submitted_at) {
      return new Response(JSON.stringify({ error: "already_submitted" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: max 5 submissions/hr per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("worn_in_the_wild_submissions")
      .select("*", { count: "exact", head: true })
      .eq("customer_email", invite.customer_email)
      .gte("submitted_at", oneHourAgo);
    if ((count || 0) >= 5) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Magic-byte check
    const buf = new Uint8Array(await file.arrayBuffer());
    const detectedMime = detectMimeFromMagicBytes(buf);
    if (!detectedMime) {
      return new Response(JSON.stringify({ error: "invalid_image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NOTE: EXIF stripping is performed client-side via canvas re-encode. The
    // server-side magic-byte check ensures the file is a real image; if a
    // client somehow bypasses the canvas re-encode, EXIF may remain. We rely
    // on the canvas pipeline as the primary stripping mechanism.

    // Upload to storage
    const ext = detectedMime === "image/png" ? "png" : detectedMime === "image/webp" ? "webp" : "jpg";
    const photoPath = `${invite.order_id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("worn-in-the-wild")
      .upload(photoPath, buf, { contentType: detectedMime, upsert: false });

    if (uploadErr) {
      console.error("upload failed", uploadErr);
      return new Response(JSON.stringify({ error: "upload_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order context for customer_first_name + product tagging
    const { data: order } = await supabase
      .from("orders")
      .select("customer_first_name")
      .eq("id", invite.order_id)
      .maybeSingle();

    const { data: items } = await supabase
      .from("order_items")
      .select("product_id")
      .eq("order_id", invite.order_id);

    const productIds = (items || []).map((i) => i.product_id).filter(Boolean);

    // Generate one-time reward code
    let rewardCode = generateRewardCode();
    // Ensure uniqueness (best effort)
    for (let i = 0; i < 3; i++) {
      const { data: existing } = await supabase
        .from("discount_codes")
        .select("id")
        .eq("code", rewardCode)
        .maybeSingle();
      if (!existing) break;
      rewardCode = generateRewardCode();
    }

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const { data: discountRow, error: discountErr } = await supabase
      .from("discount_codes")
      .insert({
        code: rewardCode,
        name: "Worn in the Wild thank-you",
        description: "One-time 15% off for photo submission",
        discount_type: "percentage",
        discount_value: 15,
        usage_limit: 1,
        per_user_limit: 1,
        expires_at: expiresAt,
        is_active: true,
      })
      .select("id")
      .single();

    if (discountErr) console.error("discount insert error", discountErr);

    // Insert submission
    const { data: submission, error: subErr } = await supabase
      .from("worn_in_the_wild_submissions")
      .insert({
        order_id: invite.order_id,
        customer_email: invite.customer_email,
        customer_first_name: order?.customer_first_name || null,
        photo_path: photoPath,
        caption,
        city,
        status: "pending",
        product_ids: productIds,
        reward_code_id: discountRow?.id || null,
      })
      .select("id")
      .single();

    if (subErr) {
      console.error("submission insert error", subErr);
      return new Response(JSON.stringify({ error: "submission_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark invite as submitted
    await supabase
      .from("worn_in_the_wild_invites")
      .update({ submitted_at: new Date().toISOString() })
      .eq("order_id", invite.order_id);

    return new Response(
      JSON.stringify({
        ok: true,
        submissionId: submission.id,
        rewardCode,
        rewardPercent: 15,
        expiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("submit-worn-photo error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
