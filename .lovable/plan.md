# Payment Edge Case Fixes

Implementing all five gaps from the audit.

## 1. Duplicate confirmation emails (MED)

**Problem:** Webhook and reconcile both fire `send-order-confirmation` with no guard. Reconcile-rescued orders get two customer emails.

**Fix:**
- Migration: add `confirmation_email_sent_at timestamptz` to `orders`.
- In both `stripe-webhook` (`handleCheckoutCompleted`) and `reconcile-session`, before triggering email run:
  ```sql
  UPDATE orders SET confirmation_email_sent_at = now()
   WHERE id = $1 AND confirmation_email_sent_at IS NULL
   RETURNING id
  ```
  Only call `send-order-confirmation` when the UPDATE returns a row. The losing caller is a no-op.

## 2. Faster "card declined" UX (LOW UX)

**Problem:** `CheckoutSuccess.tsx` only recognizes `paid`. On declined payment, user waits the full 40s timeout.

**Fix:** In `loadPaidOrder` / poll loop in `CheckoutSuccess.tsx`, when `get-order-by-session` returns an order with `status='cancelled'` and `payment_status='unpaid'`, immediately set terminal state to a new `"payment_declined"` and render: "Your card was declined. No charge was made — please try a different card." with a "Back to checkout" CTA.

Also update `get-order-by-session` to return the order even when not paid (currently returns `not_found` to hide unpaid orders — relax this to also return `cancelled/unpaid` rows).

## 3. `checkout.session.expired` handler (LOW)

**Problem:** No case in webhook switch. 24h-old abandoned sessions leave orders as `pending/unpaid` forever.

**Fix:** Add case in `stripe-webhook/index.ts`:
```ts
case "checkout.session.expired":
  await handleSessionExpired(event.data.object);
  break;
```
Handler updates `orders` SET `status='expired'` WHERE `stripe_checkout_session_id = session.id` AND `payment_status != 'paid'`.

## 4. Double-click / orphan-draft cleanup (LOW)

**Problem:** Rapid double-click on Pay creates two draft orders + two Stripe sessions.

**Fix:**
- Client (`Checkout.tsx`): disable Pay button the moment the click handler fires; only re-enable on error response. Already partially there — verify and tighten. (No new round-trip dedupe needed; Stripe still only charges the completed session.)
- Server cleanup: weekly cron is overkill. Skip the cron; instead, add an index `(payment_status, status, created_at)` and rely on existing `pending/unpaid` orders aging naturally. They're already invisible in customer-facing pages.

## 5. Customer refund email (LOW polish)

**Problem:** `charge.refunded` updates DB + alerts admin, but customer gets no notification.

**Fix:** In `handleRefund` (stripe-webhook), after the order update, look up the order's email and call a new edge function `send-refund-confirmation` (templated like `send-order-confirmation`, Stone/Amber palette per memory, mission-driven copy). Guard with same one-shot pattern — add `refund_email_sent_at` column.

## Files touched

- New migration: add `confirmation_email_sent_at`, `refund_email_sent_at` to `orders`; add `'expired'` to allowed status values (text column, no enum change needed).
- `supabase/functions/stripe-webhook/index.ts` — one-shot email guards, `session.expired` case, refund email trigger.
- `supabase/functions/reconcile-session/index.ts` — one-shot email guard.
- `supabase/functions/get-order-by-session/index.ts` — return cancelled/unpaid orders too.
- `src/pages/CheckoutSuccess.tsx` — `payment_declined` terminal state + UI.
- `src/pages/Checkout.tsx` — verify Pay button disable-on-click.
- New: `supabase/functions/send-refund-confirmation/index.ts` + `supabase/config.toml` entry.

## Out of scope

- Resend bounce webhook (#17) — separate effort, requires Resend webhook config.
- Inventory reservation (#18) — N/A, print-on-demand.

## Verification

After deploy:
1. Test sandbox checkout with `4242 4242 4242 4242` → one confirmation email (not two).
2. Test sandbox with declined card `4000 0000 0000 0002` → success page shows "Card declined" within ~3s, not 40s timeout.
3. Refund an order in Stripe Dashboard → customer gets refund email, admin alert still fires.
4. Expire a session (wait or manually trigger via Stripe CLI) → order shows `expired`.