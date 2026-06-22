import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Package, Mail, CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";
import Layout from "@/components/layout/Layout";
import PostPurchaseSignup from "@/components/checkout/PostPurchaseSignup";
import PostPurchaseOffer, { type UpsellOffer } from "@/components/checkout/PostPurchaseOffer";

interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface OrderDetails {
  id: string;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  shipping_address: ShippingAddress;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  shipping_method: string | null;
  payment_status: string;
  created_at: string;
  user_id: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_color: string | null;
  unit_price_cents: number;
  quantity: number;
  total_cents: number;
}

const POLL_INTERVAL_MS = 2000;
const RECONCILE_AFTER_MS = 3000;
const RECONCILE_RETRY_MS = 12000;
const HARD_TIMEOUT_MS = 40000;

type TerminalState =
  | "payment_declined"     // Stripe reported a definitive failure — order is cancelled/unpaid in DB
  | "stripe_not_paid"      // Stripe says card was declined / session incomplete
  | "webhook_delayed"      // Reconcile succeeded but DB still unpaid (rare)
  | "reconcile_failed"     // Edge function errored — we can't reach the processor
  | "unknown";             // Timed out with no signal at all

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminalState, setTerminalState] = useState<TerminalState | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(true);
  const [upsellOffer, setUpsellOffer] = useState<UpsellOffer | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const upsellRequestedRef = useRef(false);
  const stripeNotPaidRef = useRef(false);
  const reconcileFailedRef = useRef(false);

  const sessionId = searchParams.get("session_id");

  // Fetch order + line items via the public edge function (service-role read).
  // This bypasses RLS, which is mandatory for guest checkouts where user_id is
  // null and the per-row policy `user_id = auth.uid()` would otherwise fail.
  const loadPaidOrder = async (cancelledRef: { current: boolean }): Promise<boolean> => {
    if (!sessionId) return false;
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("get-order-by-session", {
        body: { sessionId },
      });
      if (cancelledRef.current) return false;
      if (fnErr) {
        console.warn("get-order-by-session error", fnErr);
        return false;
      }
      const payload = data as { order: OrderDetails | null; items: OrderItem[]; status: string };
      // Terminal failure: the order exists but Stripe reported failure or expiry.
      // Stop polling immediately and surface the right message.
      if (payload?.status === "cancelled" || payload?.status === "expired") {
        setTerminalState("payment_declined");
        setError(
          payload.status === "expired"
            ? "Your checkout session expired before payment completed. No charge was made — please try again."
            : "Your card was declined. No charge was made — please try a different card.",
        );
        setLoading(false);
        return true; // signal "we're done" to stop pollers
      }
      if (payload?.status !== "paid" || !payload.order) return false;
      setOrder({
        ...payload.order,
        shipping_address: (payload.order.shipping_address as ShippingAddress) || {},
      });
      setOrderItems(payload.items ?? []);
      clearCart();
      setLoading(false);
      return true;
    } catch (e) {
      console.warn("loadPaidOrder threw", e);
      return false;
    }
  };

  // ===== Primary effect: resolve the paid order =====
  // 1. Subscribe to Realtime UPDATE on this order's row (instant flip when webhook lands).
  // 2. Poll every 2s as a fallback (covers Realtime hiccups + first paint).
  // 3. At 3s + 12s, call reconcile-session to ask Stripe directly — self-heal a missed webhook.
  // 4. Hard timeout at 40s with a state-specific message.
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const cancelledRef = { current: false };
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let reconcileTimer: ReturnType<typeof setTimeout> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let hardTimer: ReturnType<typeof setTimeout> | null = null;

    // Realtime: still useful when the user is the order owner. Anonymous
    // guests won't receive events due to RLS — that's fine, the 2s poll
    // covers them.
    const channel = supabase
      .channel(`order-paid-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `stripe_checkout_session_id=eq.${sessionId}`,
        },
        async () => {
          await loadPaidOrder(cancelledRef);
        },
      )
      .subscribe();

    const pollOnce = async () => {
      if (cancelledRef.current) return;
      const paid = await loadPaidOrder(cancelledRef);
      if (!paid && !cancelledRef.current) {
        pollTimer = setTimeout(pollOnce, POLL_INTERVAL_MS);
      }
    };

    const runReconcile = async (isRetry: boolean) => {
      if (cancelledRef.current) return;
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("reconcile-session", {
          body: { sessionId, environment: getStripeEnvironment() },
        });
        if (cancelledRef.current) return;
        if (fnErr) throw fnErr;
        if ((data as any)?.notPaid) {
          stripeNotPaidRef.current = true;
        } else {
          // Reconcile succeeded — poll picks up the row on the next tick.
          await loadPaidOrder(cancelledRef);
        }
      } catch (e) {
        console.warn(`reconcile-session ${isRetry ? "retry" : "first"} failed`, e);
        if (isRetry) {
          reconcileFailedRef.current = true;
        }
      }
    };

    pollOnce();
    reconcileTimer = setTimeout(() => runReconcile(false), RECONCILE_AFTER_MS);
    retryTimer = setTimeout(() => runReconcile(true), RECONCILE_RETRY_MS);
    hardTimer = setTimeout(() => {
      if (cancelledRef.current) return;
      setLoading((stillLoading) => {
        if (!stillLoading) return false;
        // Pick the most specific terminal state we have evidence for.
        let state: TerminalState;
        let message: string;
        if (stripeNotPaidRef.current) {
          state = "stripe_not_paid";
          message = "Your payment didn't complete. Your card was not charged. Please try again.";
        } else if (reconcileFailedRef.current) {
          state = "reconcile_failed";
          message = "We couldn't reach the payment processor to confirm your order. Refresh this page in a minute, or contact support with the session ID below — we'll have your order on our side either way.";
        } else {
          state = "unknown";
          message = "We couldn't confirm your payment in time. Check your email — if you don't see a confirmation within a few minutes, contact support with your session ID below.";
        }
        setTerminalState(state);
        setError(message);
        return false;
      });
    }, HARD_TIMEOUT_MS);

    return () => {
      cancelledRef.current = true;
      if (pollTimer) clearTimeout(pollTimer);
      if (reconcileTimer) clearTimeout(reconcileTimer);
      if (retryTimer) clearTimeout(retryTimer);
      if (hardTimer) clearTimeout(hardTimer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Grant a one-shot post-purchase upsell once the order is confirmed paid.
  useEffect(() => {
    if (!order || order.payment_status !== "paid") return;
    if (upsellRequestedRef.current) return;
    upsellRequestedRef.current = true;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("grant-upsell-offer", {
          body: { orderId: order.id },
        });
        const offer = (data as any)?.offer as UpsellOffer | null;
        if (offer) {
          setUpsellOffer(offer);
          setTimeout(() => setUpsellOpen(true), 600);
        }
      } catch (_) {
        // Silent — never block the success page on an upsell failure.
      }
    })();
  }, [order]);

  const getEstimatedDelivery = (shippingMethod: string) => {
    const start = new Date();
    const end = new Date();
    switch (shippingMethod) {
      case "overnight":
        start.setDate(start.getDate() + 1);
        end.setDate(end.getDate() + 1);
        break;
      case "express":
        start.setDate(start.getDate() + 2);
        end.setDate(end.getDate() + 3);
        break;
      default:
        start.setDate(start.getDate() + 3);
        end.setDate(end.getDate() + 5);
    }
    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatCents = (cents: number) => formatPriceCents(cents);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Confirming your payment…</p>
            <p className="text-xs text-muted-foreground/70">This usually takes a few seconds.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-light">
              {terminalState === "payment_declined"
                ? "Payment didn't go through"
                : terminalState === "stripe_not_paid"
                  ? "Payment not completed"
                  : terminalState === "reconcile_failed"
                    ? "We can't confirm right now"
                    : "Order processing"}
            </h1>
            <p className="text-muted-foreground">
              {error || "Your order is being processed. You will receive an email confirmation shortly."}
            </p>
            {sessionId && (
              <p className="text-[11px] text-muted-foreground/60 font-mono break-all">
                Session: {sessionId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/checkout")} className="rounded-none">
                {terminalState === "payment_declined" ? "Try a different card" : "Back to checkout"}
              </Button>
              <Button onClick={() => navigate("/")} className="rounded-none">
                Return to home
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-light mb-2">Thank You for Your Order!</h1>
            <p className="text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Email Confirmation */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
            <Mail className="w-4 h-4" />
            <span>Confirmation sent to {order.customer_email}</span>
          </div>

          {/* Post-Purchase Signup Prompt (for guest checkouts only) */}
          {!user && !order.user_id && showSignupPrompt && (
            <div className="mb-10">
              <PostPurchaseSignup
                orderEmail={order.customer_email}
                orderFirstName={order.customer_first_name}
                orderId={order.id}
                onSuccess={() => setShowSignupPrompt(false)}
                onSkip={() => setShowSignupPrompt(false)}
              />
            </div>
          )}

          {/* Order Items */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-6">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {[item.variant_size, item.variant_color].filter(Boolean).join(" / ")}
                    </p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCents(item.total_cents)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/20 p-6 mb-10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cents === 0 ? "FREE" : formatCents(order.shipping_cents)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-champagne-600">-{formatCents(order.discount_cents)}</span>
              </div>
            )}
            {order.tax_cents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCents(order.tax_cents)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-border font-medium">
              <span>Total</span>
              <span>{formatCents(order.total_cents)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-medium mb-3">Shipping Address</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.customer_first_name} {order.customer_last_name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.postalCode} {order.shipping_address.city}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Estimated Delivery</h3>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>{getEstimatedDelivery(order.shipping_method)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {order.shipping_method === "overnight" && "Next-day delivery"}
                {order.shipping_method === "express" && "Express shipping (2-3 days)"}
                {order.shipping_method === "standard" && "Standard shipping (3-5 days)"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="rounded-none" onClick={() => navigate("/")}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <Button asChild className="rounded-none">
              <Link to="/account/orders">
                View All Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Questions about your order?{" "}
            <Link to="/about/customer-care" className="underline hover:text-foreground">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
      {upsellOffer && (
        <PostPurchaseOffer
          isOpen={upsellOpen}
          offer={upsellOffer}
          customerEmail={order?.customer_email ?? ""}
          onClose={() => setUpsellOpen(false)}
        />
      )}
    </Layout>
  );
};

export default CheckoutSuccess;
