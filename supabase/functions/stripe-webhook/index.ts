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

  // Idempotency
  const { data: existing } = await sb
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();
  if (existing && (existing as any).payment_status === "paid") return;

  // Pull authoritative totals + address from Stripe (post-tax, post-discount)
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

  // Record discount redemption (if any)
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
      // Bump usage_count
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

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  const env: StripeEnv = rawEnv === "live" ? "live" : "sandbox";

  try {
    const event = await verifyWebhook(req, env);
    console.log("Webhook:", event.type, event.id);

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
        await handleRefund(event.data.object);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
