# Deep Stress-Test Audit — Checkout Confirmation Flow

## Scope
Audit every path from "Pay" click → success page resolution, simulate every realistic failure mode, and propose targeted fixes. Read-only investigation completed; this plan covers what to harden.

## Findings — Stress Test Matrix

| # | Scenario | Current Behavior | Severity |
|---|----------|------------------|----------|
| 1 | Webhook arrives within 6s | ✅ Clean resolve via Realtime/poll | OK |
| 2 | Webhook delayed 6–40s | Reconcile fires, flips order, resolves | OK |
| 3 | Webhook never arrives (wrong URL / missing `?env=live`) | 40s timeout → "Order processing" generic | **HIGH** |
| 4 | Webhook signature secret mismatch | Silent 400, same as #3 | **HIGH** |
| 5 | Card actually declined | Reconcile sets `stripeNotPaid` → clear message | OK if reconcile runs |
| 6 | `VITE_PAYMENTS_CLIENT_TOKEN` missing in prod | `getStripeEnvironment()` throws → reconcile never runs → generic timeout even on declines | **HIGH** |
| 7 | RLS blocks anon SELECT on `orders` by session_id | Poll + Realtime both silently return null → always times out | **CRITICAL** |
| 8 | `orders` not in Realtime publication | Falls back to 2s poll only (acceptable) | LOW |
| 9 | Race: webhook flips `paid` before `create-checkout-session` writes `stripe_checkout_session_id` | Poll can't find row by session_id → timeout | MED |
| 10 | Reconcile edge function itself errors (network/500) | No `stripeNotPaid` set → generic timeout message hides real cause | MED |
| 11 | `payment_intent.payment_failed` webhook | Sets order `cancelled/unpaid` but UI only polls for `paid` → still waits full 40s | MED |
| 12 | User closes tab mid-flow then returns | No resume path; new visit to `/checkout/success?session_id=…` works only if order row exists | LOW |
| 13 | Duplicate webhook delivery | Idempotent upsert by `orderId` — OK | OK |
| 14 | Clock skew > 5 min between Stripe + edge | Signature rejected | LOW |
| 15 | Stripe API version drift (`shipping_details` regression) | Already fixed last turn | OK |

## Remediation Plan

### Phase 1 — Critical correctness (do first)
1. **Audit `orders` RLS for session-id lookups.** Verify anon + authenticated can SELECT rows by `stripe_checkout_session_id`. If not, add a scoped policy or move the success-page read behind a public edge function (`get-order-by-session`) using service role + session-id verification against Stripe.
2. **Confirm `orders` is in `supabase_realtime` publication** (migration last turn added it — re-verify against live DB).
3. **Verify Stripe Dashboard webhook URL** ends with `?env=live` and points at `stripe-webhook` (user-side check — surface this clearly).

### Phase 2 — Eliminate silent failure modes
4. **Reorder `create-checkout-session`**: write `stripe_checkout_session_id` to the order row *before* returning client secret (close race #9).
5. **Make reconcile fire earlier and retry**: drop `RECONCILE_AFTER_MS` from 6s → 3s; on reconcile error, retry once at 12s instead of waiting for 40s timeout.
6. **Surface reconcile failures**: when reconcile throws, set a distinct `reconcileFailed` state so the UI shows "We couldn't reach the payment processor — refresh in a minute" instead of generic "Order processing".

### Phase 3 — Better user messaging
7. **Differentiate three terminal states** on `CheckoutSuccess.tsx`:
   - `stripeNotPaid` → "Payment not completed, card not charged, try again" (existing)
   - `webhookDelayed` (reconcile succeeded but DB still unpaid) → "Payment received, finalizing your order — safe to close, email coming"
   - `unknown` (reconcile failed or never ran) → "We can't confirm right now. Check your email or contact support with session ID `cs_...`"
8. **Listen for `payment_intent.payment_failed`** on client: subscribe to order row updates for `payment_status='failed'` so declines surface in <5s instead of 40s.

### Phase 4 — Observability
9. **Add structured logs** in `stripe-webhook` and `reconcile-session` (sessionId, env, action taken, latency) — already partially in place; verify and extend.
10. **Add a `checkout_attempts` audit row** when create-checkout-session is called and when reconcile is called, so support can trace any stuck order end-to-end.

### Phase 5 — Optional resilience
11. **Background reconcile sweep**: cron edge function every 5 min to reconcile orders stuck `pending/unpaid` < 1h old. Catches webhooks that drop entirely.
12. **Idempotency keys** on `create-checkout-session` to prevent duplicate orders if user double-clicks Pay.

## Technical Notes
- Files touched: `src/pages/CheckoutSuccess.tsx`, `supabase/functions/create-checkout-session/index.ts`, `supabase/functions/reconcile-session/index.ts`, `supabase/functions/stripe-webhook/index.ts`, new migration for RLS + (optional) cron, possible new `get-order-by-session` function.
- No schema-breaking changes; additive RLS policy + column reads only.
- Will preserve existing idempotency guarantees on webhook upserts and email sends.

## What I need from you before building
1. Confirm in **Stripe Dashboard → Webhooks**: live endpoint URL ends with `?env=live` and is enabled. (1-minute check.)
2. Approve scope — full Phase 1–4, or just Phase 1–2 (critical fixes) for now?
