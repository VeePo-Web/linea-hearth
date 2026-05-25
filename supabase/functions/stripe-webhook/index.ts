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

async function decrementStock(orderId: string) {
  const sb = getSupabase();
  const { data: items } = await sb
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  if (!items) return;
  for (const it of items as Array<{ variant_id: string | null; quantity: number }>) {
    if (!it.variant_id) continue;
    const { data: v } = await sb
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", it.variant_id)
      .single();
    if (v && typeof (v as any).stock_quantity === "number") {
      const next = Math.max(0, (v as any).stock_quantity - it.quantity);
      await sb
        .from("product_variants")
        .update({ stock_quantity: next })
        .eq("id", it.variant_id);
    }
  }
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

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const sb = getSupabase();
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("checkout.session.completed without orderId metadata", session.id);
    return;
  }

  // Idempotency: skip if already paid
  const { data: existing } = await sb
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();
  if (existing && (existing as any).payment_status === "paid") return;

  // Pull final amounts from Stripe (post-tax)
  const stripe = createStripeClient(env);
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["total_details", "shipping_cost"],
  });

  await sb
    .from("orders")
    .update({
      status: "processing",
      payment_status: "paid",
      stripe_payment_intent_id: (full.payment_intent as string) ?? null,
      stripe_customer_id: (full.customer as string) ?? null,
      tax_cents: full.total_details?.amount_tax ?? 0,
      shipping_cents: (full.shipping_cost as any)?.amount_total ?? 0,
      total_cents: full.amount_total ?? 0,
    })
    .eq("id", orderId);

  await decrementStock(orderId);
  await sendConfirmationEmail(orderId);
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
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object, env);
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
