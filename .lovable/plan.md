# Payment Retry Emails (Expired + Failed Checkouts)

Two new app emails that fire when a checkout falls over: **Stripe session expired** (24h timeout) and **payment failed** (card declined, 3DS abandoned). Each contains a one-click link that rehydrates the original cart and drops the customer back at `/checkout`. A 24h follow-up resends once if still unpaid.

This is post-checkout and complements (does not replace) the existing pre-checkout `abandoned_carts` recovery sequence.

---

## 1. Database migration

Add to `orders`:
- `retry_email_sent_at TIMESTAMPTZ` — first email idempotency claim
- `retry_email_followup_sent_at TIMESTAMPTZ` — 24h follow-up claim
- `retry_token TEXT UNIQUE` — opaque token for the email link
- `retry_reason TEXT` — `'expired' | 'payment_failed'`

Fix the existing `orders_status_check` constraint to allow `'expired'` and `'disputed'` (webhook already writes these — currently silently failing).

Index: `idx_orders_retry_eligible` on `(payment_status, status, retry_email_sent_at)` partial for cron scan.

## 2. Webhook triggers (`stripe-webhook/index.ts`)

In the existing handlers:
- `handleSessionExpired` → after the UPDATE, look up the order's email, generate `retry_token`, set `retry_reason='expired'`, then call new `sendRetryEmail(orderId)` (guarded by `retry_email_sent_at IS NULL` one-shot pattern).
- `handlePaymentFailed` → same, with `retry_reason='payment_failed'`.

Skip if order has no `customer_email` or items.

## 3. New edge function: `send-retry-payment-email`

Mirrors `send-order-confirmation` (Resend, Stone/Amber palette, Exodus 28:2 footer). Two templates branched on `retry_reason`:
- **Expired**: "Your checkout timed out — your cart is waiting"
- **Payment failed**: "Your card was declined — try again"

CTA button → `https://lineofjudah.clothing/recover-payment?token={retry_token}`

## 4. New edge function: `recover-payment`

GET endpoint. Validates `retry_token`, returns the order's `order_items` (joined) so the client can rehydrate cart. Rejects if order is `paid`, `refunded`, or token is >7 days old. Marks order as touched (no status change).

## 5. New page: `/recover-payment` (`src/pages/RecoverPayment.tsx`)

On mount: calls `recover-payment`, writes items to `useCart` (same pattern as existing `RecoverCart.tsx`), navigates to `/checkout`. Shows error states for invalid/expired/already-paid tokens. Add route to `App.tsx`.

## 6. 24h follow-up cron

Extend the existing `process-abandoned-carts` schedule (or add a new query inside it) to also scan:

```sql
SELECT id FROM orders
WHERE payment_status = 'unpaid'
  AND status IN ('expired', 'cancelled')
  AND retry_email_sent_at IS NOT NULL
  AND retry_email_sent_at < now() - interval '24 hours'
  AND retry_email_followup_sent_at IS NULL
  AND created_at > now() - interval '7 days';
```

For each row: claim `retry_email_followup_sent_at`, call `send-retry-payment-email` with `isFollowup: true` (small copy tweak: "One more try — your cart is still here").

## 7. Config

`supabase/config.toml`: register `send-retry-payment-email` and `recover-payment` with `verify_jwt = false`.

---

## Out of scope
- Restoring shipping address / discount code (cart only; user re-enters at checkout — keeps flow simple per your "rehydrate cart, send to /checkout" choice)
- Third recovery email beyond 24h
- SMS retry
- Unsubscribe link on retry emails (these are transactional, not marketing — same policy as order confirmation)

## Files
- New migration (columns, constraint fix, index)
- New `supabase/functions/send-retry-payment-email/index.ts`
- New `supabase/functions/recover-payment/index.ts`
- New `src/pages/RecoverPayment.tsx` + route in `src/App.tsx`
- Edit `supabase/functions/stripe-webhook/index.ts` (two trigger hooks)
- Edit `supabase/functions/process-abandoned-carts/index.ts` (24h follow-up scan)
- Edit `supabase/config.toml` (register 2 functions)
