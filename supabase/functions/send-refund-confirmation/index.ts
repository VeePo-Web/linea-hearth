// Sends a refund-confirmation email to the customer when a charge is
// refunded in Stripe. Mirrors send-order-confirmation: Stone/Amber palette,
// mission-driven copy. Triggered by stripe-webhook handleRefund (guarded
// by refund_email_sent_at one-shot in the webhook).

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

function buildRefundHtml(order: any, siteUrl: string): string {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const firstName = order.customer_first_name || "friend";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:48px 40px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a8a29e;">Line of Judah</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-weight:400;letter-spacing:-0.01em;color:#1c1917;">Your refund has been processed</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c;">${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c;">
      We've issued a full refund for order <strong>#${orderNumber}</strong>.
      The amount of <strong>${formatCents(order.total_cents)}</strong> will return
      to your original payment method within 5–10 business days, depending on your bank.
    </p>
    <table style="border-collapse:collapse;width:100%;margin:24px 0;border-top:1px solid #e7e5e4;border-bottom:1px solid #e7e5e4;">
      <tr><td style="padding:12px 0;font-size:13px;color:#78716c;">Order</td><td style="padding:12px 0;text-align:right;font-size:13px;color:#1c1917;">#${orderNumber}</td></tr>
      <tr><td style="padding:12px 0;border-top:1px solid #f5f5f4;font-size:13px;color:#78716c;">Refund amount</td><td style="padding:12px 0;border-top:1px solid #f5f5f4;text-align:right;font-size:13px;color:#1c1917;"><strong>${formatCents(order.total_cents)}</strong></td></tr>
    </table>
    <p style="margin:24px 0 16px;font-size:14px;line-height:1.6;color:#57534e;">
      If you have any questions, reply to this email — a human reads every message.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#57534e;">
      Thank you for your trust. The armor of holiness goes on every day —
      <em style="color:#92400e;">"And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."</em>
      <span style="color:#a8a29e;">— Exodus 28:2</span>
    </p>
    <hr style="margin:32px 0 16px;border:none;border-top:1px solid #e7e5e4;"/>
    <p style="margin:0;font-size:11px;color:#a8a29e;text-align:center;">
      <a href="${siteUrl}" style="color:#a8a29e;text-decoration:none;">lineofjudah.clothing</a>
    </p>
  </div>
</body></html>`;
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

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, customer_email, customer_first_name, total_cents, currency")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildRefundHtml(order, siteUrl);
    const orderNumber = (order as any).id.slice(0, 8).toUpperCase();
    const subject = `Your refund for order #${orderNumber}`;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY missing — stub mode for refund email", {
        to: (order as any).customer_email, subject,
      });
      return new Response(JSON.stringify({ success: true, mode: "stub" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Line of Judah <orders@lineofjudah.clothing>",
        to: [(order as any).customer_email],
        bcc: ["1.lineofjudah.1@gmail.com"],
        subject,
        html,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      console.error("Refund email send failed:", result);
      return new Response(JSON.stringify({ error: "Send failed", details: result }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-refund-confirmation error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
