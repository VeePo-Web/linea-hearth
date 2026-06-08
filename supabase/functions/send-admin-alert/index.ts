// Internal admin alert sender. Posts directly to api.resend.com with
// RESEND_API_KEY using the verified lineofjudah.clothing domain.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// === CONFIG ===
const ADMIN_FROM = "Line of Judah Alerts <alerts@lineofjudah.clothing>";
const ADMIN_REPLY_TO = "parker@veepo.ca";
const ADMIN_RECIPIENTS = [
  "parker@veepo.ca",
  "1.lineofjudah.1@gmail.com",
];

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface Payload {
  subject?: string;
  html?: string;
  context?: Record<string, unknown>;
  idempotencyKey?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Service-role gate. Webhook handlers call with SERVICE_ROLE_KEY in
  // the Authorization header — anything else (anon, user JWT, missing)
  // is rejected so this can't be abused as an open relay.
  const auth = req.headers.get("Authorization") ?? "";
  const expected = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`;
  if (!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || auth !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { subject, html, context, idempotencyKey } = body;
  if (!subject || !html) {
    return new Response(JSON.stringify({ error: "subject and html required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Idempotency: skip if we've already alerted for this event id.
  const supabase = sb();
  if (idempotencyKey) {
    const { data: prior } = await supabase
      .from("email_send_log")
      .select("id, status")
      .eq("message_id", idempotencyKey)
      .in("status", ["sent", "pending"])
      .limit(1)
      .maybeSingle();
    if (prior) {
      return new Response(
        JSON.stringify({ ok: true, deduped: true, status: (prior as any).status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  const messageId = idempotencyKey ?? crypto.randomUUID();

  // Best-effort pending log; tolerate missing email_send_log table.
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: "admin-alert",
    recipient_email: ADMIN_RECIPIENTS.join(","),
    status: "pending",
    metadata: { subject, context: context ?? null },
  }).then(() => {}).catch(() => {});

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "admin-alert",
      recipient_email: ADMIN_RECIPIENTS.join(","),
      status: "failed",
      error_message: "Missing RESEND_API_KEY",
    }).then(() => {}).catch(() => {});
    return new Response(JSON.stringify({ error: "Email provider not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: ADMIN_FROM,
      to: ADMIN_RECIPIENTS,
      reply_to: ADMIN_REPLY_TO,
      subject,
      html,
    }),
  });

  const responseText = await res.text();
  if (!res.ok) {
    console.error("send-admin-alert: Resend error", res.status, responseText);
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "admin-alert",
      recipient_email: ADMIN_RECIPIENTS.join(","),
      status: "failed",
      error_message: `Resend ${res.status}: ${responseText}`,
    }).then(() => {}).catch(() => {});
    return new Response(JSON.stringify({ error: "Failed to send alert", details: responseText }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: "admin-alert",
    recipient_email: ADMIN_RECIPIENTS.join(","),
    status: "sent",
    metadata: { resend_response: JSON.parse(responseText) },
  }).then(() => {}).catch(() => {});

  return new Response(JSON.stringify({ ok: true, messageId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
