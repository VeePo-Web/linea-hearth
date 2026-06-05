import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, verifyWebhook, type StripeEnv } from "../_shared/stripe.ts";
import { sendAdminAlert } from "../_shared/admin-alert.ts";

// === Alert formatting helpers ===
const cad = (cents?: number | null) =>
  typeof cents === "number"
    ? `$${(cents / 100).toFixed(2)} CAD`
    : "(unknown amount)";

const dashboardLink = (env: StripeEnv, path: string) =>
  env === "live"
    ? `https://dashboard.stripe.com/${path}`
    : `https://dashboard.stripe.com/test/${path}`;

const opsOrderLink = (orderId: string) =>
  `https://lineofjudah.clothing/ops-portal/orders/${orderId}`;

function alertShell(title: string, rows: Array<[string, string]>, ctaUrl?: string, ctaLabel?: string) {
  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:13px;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 0;color:#111;font-size:13px;word-break:break-word;">${v}</td></tr>`,
    )
    .join("");
  const cta = ctaUrl
    ? `<p style="margin:24px 0 0;"><a href="${ctaUrl}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.04em;">${ctaLabel ?? "Open"}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:32px;background:#f5f5f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:28px 32px;border:1px solid #e5e5e5;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#888;">Line of Judah · Ops Alert</p>
    <h1 style="margin:0 0 20px;font-size:20px;font-weight:600;color:#111;letter-spacing:-0.01em;">${title}</h1>
    <table style="border-collapse:collapse;width:100%;">${rowsHtml}</table>
    ${cta}
    <hr style="margin:24px 0 12px;border:none;border-top:1px solid #eee;"/>
    <p style="margin:0;font-size:11px;color:#999;">Automated message · do not reply directly</p>
  </div></body></html>`;
}


let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

async function sendConfirmationEmail(orderId: string) {
  // One-shot guard: atomically claim the "we sent it" slot. If another
  // path (webhook vs. reconcile) raced us and already won, the UPDATE
  // returns zero rows and we no-op — preventing duplicate emails.
  const sb = getSupabase();
  const { data: claimed } = await sb
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("confirmation_email_sent_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) {
    console.log("Confirmation email already sent for", orderId, "— skipping");
    return;
  }
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-confirmation`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
  } catch (e) {
    console.error("Failed to trigger confirmation email", e);
    // Roll back the claim so a retry can re-send.
    await sb
      .from("orders")
      .update({ confirmation_email_sent_at: null })
      .eq("id", orderId);
  }
}

async function sendRefundEmail(orderId: string) {
  const sb = getSupabase();
  const { data: claimed } = await sb
    .from("orders")
    .update({ refund_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("refund_email_sent_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return;
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-refund-confirmation`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
  } catch (e) {
    console.error("Failed to trigger refund email", e);
    await sb
      .from("orders")
      .update({ refund_email_sent_at: null })
      .eq("id", orderId);
  }
}

// Generates a retry_token (if missing), sets retry_reason, then atomically
// claims retry_email_sent_at so a racing webhook/replay can't double-send.
async function triggerRetryEmail(
  orderId: string,
  reason: "expired" | "payment_failed",
) {
  const sb = getSupabase();

  // Ensure the order has a token + reason. Only set token if absent (don't
  // rotate on a second event for the same order).
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const { data: tokenRow } = await sb
    .from("orders")
    .update({ retry_token: token, retry_reason: reason })
    .eq("id", orderId)
    .is("retry_token", null)
    .select("id")
    .maybeSingle();

  // If the token already existed, just refresh the reason (latest event wins).
  if (!tokenRow) {
    await sb.from("orders").update({ retry_reason: reason }).eq("id", orderId);
  }

  // One-shot claim of the email slot.
  const { data: claimed } = await sb
    .from("orders")
    .update({ retry_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("retry_email_sent_at", null)
    .select("id, customer_email")
    .maybeSingle();
  if (!claimed) return;
  if (!(claimed as any).customer_email) return;

  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-retry-payment-email`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
  } catch (e) {
    console.error("Failed to trigger retry email", e);
    await sb
      .from("orders")
      .update({ retry_email_sent_at: null })
      .eq("id", orderId);
  }
}

// Stripe `Address` -> our jsonb shape
function mapStripeAddress(
  stripeAddr: { line1?: string | null; line2?: string | null; city?: string | null; postal_code?: string | null; country?: string | null; state?: string | null } | null | undefined,
) {
  if (!stripeAddr) return null;
  return {
    address: [stripeAddr.line1, stripeAddr.line2].filter(Boolean).join(", "),
    city: stripeAddr.city ?? "",
    postalCode: stripeAddr.postal_code ?? "",
    state: stripeAddr.state ?? "",
    country: stripeAddr.country ?? "",
  };
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const sb = getSupabase();
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("checkout.session.completed without orderId metadata", session.id);
    return;
  }

  // Idempotency at the order level (belt-and-suspenders alongside event dedupe).
  const { data: existing } = await sb
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();
  if (existing && (existing as any).payment_status === "paid") return;

  const stripe = createStripeClient(env);
  // Note: `shipping_details` cannot be expanded on API version 2026-03-25.dahlia
  // (it's now nested under `collected_information`). Only expand fields the
  // current API allows; the shipping/customer details come back by default.
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["total_details", "shipping_cost", "collected_information"],
  });

  const stripeShipping = mapStripeAddress(
    (full as any).collected_information?.shipping_details?.address
      ?? (full as any).shipping_details?.address,
  );
  const stripeBilling = mapStripeAddress(full.customer_details?.address);

  await sb
    .from("orders")
    .update({
      status: "processing",
      payment_status: "paid",
      stripe_payment_intent_id: (full.payment_intent as string) ?? null,
      stripe_customer_id: (full.customer as string) ?? null,
      tax_cents: full.total_details?.amount_tax ?? 0,
      discount_cents: full.total_details?.amount_discount ?? 0,
      shipping_cents: (full.shipping_cost as any)?.amount_total ?? 0,
      total_cents: full.amount_total ?? 0,
      ...(stripeShipping && { shipping_address: stripeShipping }),
      ...(stripeBilling && { billing_address: stripeBilling }),
      ...(full.customer_details?.phone && { customer_phone: full.customer_details.phone }),
    })
    .eq("id", orderId);

  if (
    full.total_details?.amount_discount &&
    full.total_details.amount_discount > 0
  ) {
    const { data: orderRow } = await sb
      .from("orders")
      .select("discount_id, customer_email")
      .eq("id", orderId)
      .single();
    if (orderRow && (orderRow as any).discount_id) {
      await sb.from("discount_code_redemptions").insert({
        discount_code_id: (orderRow as any).discount_id,
        order_id: orderId,
        customer_email: (orderRow as any).customer_email,
        discount_applied_cents: full.total_details.amount_discount,
      });
      const { data: dc } = await sb
        .from("discount_codes")
        .select("usage_count")
        .eq("id", (orderRow as any).discount_id)
        .single();
      if (dc) {
        await sb
          .from("discount_codes")
          .update({ usage_count: ((dc as any).usage_count ?? 0) + 1 })
          .eq("id", (orderRow as any).discount_id);
      }
    }
  }

  // Convert any in-flight abandoned-cart recovery sequence for this customer.
  // Stops further recovery emails the moment the order is paid, even if the
  // user checked out without clicking the recovery link.
  try {
    const { data: orderForEmail } = await sb
      .from("orders")
      .select("customer_email")
      .eq("id", orderId)
      .single();
    const customerEmail = (orderForEmail as any)?.customer_email?.toLowerCase();
    if (customerEmail) {
      await sb
        .from("abandoned_carts")
        .update({ status: "converted", converted_at: new Date().toISOString() })
        .eq("email", customerEmail)
        .in("status", ["pending", "email_1_sent", "email_2_sent", "email_3_sent"]);
    }
  } catch (e) {
    console.error("Failed to mark abandoned carts converted", e);
  }

  await sendConfirmationEmail(orderId);
}

async function handlePaymentFailed(paymentIntent: any) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;
  await getSupabase()
    .from("orders")
    .update({
      status: "cancelled",
      payment_status: "unpaid",
      notes: paymentIntent.last_payment_error?.message ?? "Payment failed",
    })
    .eq("id", orderId)
    .neq("payment_status", "paid");
}

async function handleRefund(charge: any) {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;
  const sb = getSupabase();
  const { data: updated } = await sb
    .from("orders")
    .update({ status: "refunded", payment_status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .select("id")
    .maybeSingle();
  if (updated && (updated as any).id) {
    await sendRefundEmail((updated as any).id);
  }
}

async function handleSessionExpired(session: any) {
  const sb = getSupabase();
  const sessionId = session.id;
  if (!sessionId) return;
  await sb
    .from("orders")
    .update({ status: "expired" })
    .eq("stripe_checkout_session_id", sessionId)
    .neq("payment_status", "paid");
}

async function handleDispute(dispute: any, env: StripeEnv) {
  const sb = getSupabase();
  const paymentIntentId = dispute.payment_intent ?? null;

  let orderId: string | null = null;
  if (paymentIntentId) {
    const { data: order } = await sb
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (order) orderId = (order as any).id;
  }

  await sb.from("stripe_disputes").upsert(
    {
      stripe_dispute_id: dispute.id,
      stripe_charge_id: dispute.charge,
      stripe_payment_intent_id: paymentIntentId,
      order_id: orderId,
      amount_cents: dispute.amount ?? 0,
      currency: dispute.currency ?? "cad",
      reason: dispute.reason ?? null,
      status: dispute.status ?? "needs_response",
      evidence_due_by: dispute.evidence_details?.due_by
        ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
        : null,
      environment: env,
      raw: dispute,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_dispute_id" },
  );

  if (orderId) {
    await sb
      .from("orders")
      .update({ status: "disputed", notes: `Dispute opened: ${dispute.reason ?? "unknown"}` })
      .eq("id", orderId);
  }
}

// === ADMIN ALERT DISPATCHERS ===
async function alertPaymentFailed(
  event: { id: string; type: string; data: { object: any } },
  env: StripeEnv,
) {
  const obj = event.data.object;
  const isSession = event.type.startsWith("checkout.session");
  const amount = isSession ? obj.amount_total : obj.amount;
  const orderId = obj.metadata?.orderId ?? "(no orderId)";
  const reason =
    obj.last_payment_error?.message ??
    obj.last_payment_error?.code ??
    obj.failure_message ??
    "Unknown failure reason";
  const declineCode = obj.last_payment_error?.decline_code ?? null;
  const email = isSession ? obj.customer_details?.email : obj.receipt_email;

  await sendAdminAlert({
    subject: `[LOJ Alert] Payment failed — ${orderId} — ${cad(amount)}`,
    idempotencyKey: event.id,
    context: { eventType: event.type, eventId: event.id, env },
    html: alertShell(
      "Payment failed",
      [
        ["Order", orderId],
        ["Amount", cad(amount)],
        ["Customer", email ?? "(unknown)"],
        ["Reason", reason],
        ...(declineCode ? [["Decline code", declineCode]] as Array<[string, string]> : []),
        ["Stripe event", event.type],
        ["Environment", env],
        ["When", new Date().toISOString()],
      ],
      orderId !== "(no orderId)"
        ? opsOrderLink(orderId)
        : dashboardLink(env, `events/${event.id}`),
      orderId !== "(no orderId)" ? "Open order" : "Open Stripe event",
    ),
  });
}

async function alertRefund(
  event: { id: string; type: string; data: { object: any } },
  env: StripeEnv,
) {
  const charge = event.data.object;
  await sendAdminAlert({
    subject: `[LOJ Alert] Refund processed — ${cad(charge.amount_refunded)}`,
    idempotencyKey: event.id,
    context: { eventId: event.id, env },
    html: alertShell(
      "Refund processed",
      [
        ["Charge", charge.id],
        ["Refunded", cad(charge.amount_refunded)],
        ["Original amount", cad(charge.amount)],
        ["Customer", charge.billing_details?.email ?? charge.receipt_email ?? "(unknown)"],
        ["Payment intent", charge.payment_intent ?? "(none)"],
        ["Environment", env],
      ],
      dashboardLink(env, `payments/${charge.payment_intent ?? ""}`),
      "Open in Stripe",
    ),
  });
}

async function alertDispute(
  event: { id: string; type: string; data: { object: any } },
  env: StripeEnv,
) {
  const d = event.data.object;
  await sendAdminAlert({
    subject: `[LOJ Alert] Dispute opened — ${cad(d.amount)} — ${d.reason ?? "unknown reason"}`,
    idempotencyKey: event.id,
    context: { eventId: event.id, env },
    html: alertShell(
      "Dispute opened",
      [
        ["Dispute", d.id],
        ["Amount", cad(d.amount)],
        ["Reason", d.reason ?? "(unknown)"],
        ["Status", d.status ?? "(unknown)"],
        ["Charge", d.charge ?? "(unknown)"],
        ["Evidence due", d.evidence_details?.due_by
          ? new Date(d.evidence_details.due_by * 1000).toISOString()
          : "(none)"],
        ["Environment", env],
      ],
      dashboardLink(env, `disputes/${d.id}`),
      "Open dispute",
    ),
  });
}



Deno.serve(async (req) => {
  console.log("stripe-webhook hit:", req.method, req.url);
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });


  // HARD-FAIL on unknown env. Routing a live event to sandbox creds
  // makes signature verification fail silently and Stripe retries for
  // 3 days before giving up — losing the order.
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "live" && rawEnv !== "sandbox") {
    console.error("Webhook rejected: missing/invalid ?env= query param", rawEnv);
    return new Response("Invalid env", { status: 400 });
  }
  const env: StripeEnv = rawEnv;

  let event: { type: string; data: { object: any }; id: string };
  try {
    event = await verifyWebhook(req, env);
  } catch (e) {
    console.error("Signature verification failed:", e);
    return new Response("Webhook error", { status: 400 });
  }

  // === EVENT DEDUPE ===
  // Stripe retries on any non-2xx for up to 3 days. We must not
  // double-fulfill on a retry. Inserting first means a concurrent retry
  // hits the PK conflict and short-circuits.
  const sb = getSupabase();
  const { error: dedupeErr } = await sb
    .from("stripe_webhook_events")
    .insert({
      event_id: event.id,
      type: event.type,
      environment: env,
      payload: event.data?.object ?? null,
    });
  if (dedupeErr) {
    // Unique-violation → we've already processed this event. Ack 200.
    if ((dedupeErr as any).code === "23505") {
      return new Response(JSON.stringify({ received: true, deduped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Failed to log webhook event", dedupeErr);
    // Fall through — better to process than to drop.
  }

  console.log("Webhook:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        await alertPaymentFailed(event, env);
        break;
      case "checkout.session.expired":
        await handleSessionExpired(event.data.object);
        break;
      case "charge.refunded":
      case "charge.refund.updated":
        await handleRefund(event.data.object);
        await alertRefund(event, env);
        break;
      case "charge.dispute.created":
        await handleDispute(event.data.object, env);
        await alertDispute(event, env);
        break;
      case "charge.dispute.updated":
      case "charge.dispute.funds_withdrawn":
      case "charge.dispute.funds_reinstated":
      case "charge.dispute.closed":
        await handleDispute(event.data.object, env);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
  } catch (e) {

    console.error("Handler error:", e);
    // Returning 500 lets Stripe retry the event. The dedupe row will
    // still be there, so we'd skip it — fix: delete the row so retries
    // re-process.
    await sb.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
