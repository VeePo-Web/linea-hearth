import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, verifyWebhook, type StripeEnv } from "../_shared/stripe.ts";

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
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-confirmation`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
  } catch (e) {
    console.error("Failed to trigger confirmation email", e);
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
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["total_details", "shipping_cost", "customer_details", "shipping_details"],
  });

  const stripeShipping = mapStripeAddress((full as any).shipping_details?.address);
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
  await getSupabase()
    .from("orders")
    .update({ status: "refunded", payment_status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId);
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

Deno.serve(async (req) => {
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
        break;
      case "charge.refunded":
      case "charge.refund.updated":
        await handleRefund(event.data.object);
        break;
      case "charge.dispute.created":
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
