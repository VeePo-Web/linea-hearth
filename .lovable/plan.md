# Payment came through on Stripe — webhook never reached us

## What actually happened

- Stripe **did** capture CA$40.00 from parker@veepo.ca (customer `cus_UdiSlOI9lBQnXO`, order `FF614293`). Your Stripe email confirms it.
- In our database, order `ff614293-6e8c-4a98-8465-49b0046ebf02` is still `status: pending` / `payment_status: unpaid`, with `stripe_payment_intent_id: null`.
- The `stripe-webhook` edge function has **never been invoked** — zero rows in `stripe_webhook_events`, zero HTTP requests in edge logs.
- The success page therefore polls/checks an order that never flipped to `paid` → "still processing" forever.

Conclusion: the Stripe → Lovable webhook is not wired up (or is wired without the required `?env=live` query parameter, which the handler hard-rejects with 400).

## Plan

### 1. Backfill THIS order now (one-shot reconciliation)
Build a small admin-only edge function `reconcile-order` that:
- Takes `{ orderId, environment }`.
- Looks up the order; if already `paid`, no-op.
- Calls Stripe `checkout.sessions.list({ limit: 100 })` or retrieves by the session id stored in `orders.stripe_session_id` (if we stored it — verify in `create-checkout-session`). Falls back to finding the most recent paid Session whose `metadata.orderId === orderId`.
- Runs the exact same update path as `handleCheckoutCompleted` in `stripe-webhook/index.ts` (status `processing`, payment_status `paid`, tax/discount/shipping/total, addresses, phone, `stripe_payment_intent_id`, `stripe_customer_id`), then triggers `send-order-confirmation`.
- Protected by `verify_jwt = false` + an explicit admin-role check via `has_role(auth.uid(), 'admin')`.
- Invoke it once from the ops portal (or via `supabase--curl_edge_functions`) for order `FF614293`.

### 2. Fix the webhook for all future orders
This is a config step you have to do in your Stripe Dashboard — I can't do it from code:

In Stripe Dashboard → **Developers → Webhooks → Add endpoint**, register **two** endpoints:

```
https://harckavibhmimndfvnyo.supabase.co/functions/v1/stripe-webhook?env=live
https://harckavibhmimndfvnyo.supabase.co/functions/v1/stripe-webhook?env=sandbox
```

Events to subscribe to (matches the handler's switch):
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.refund.updated`
- `charge.dispute.created` / `.updated` / `.funds_withdrawn` / `.funds_reinstated` / `.closed`

Then copy each endpoint's **Signing secret** into the corresponding Lovable Cloud secret:
- Live secret → `PAYMENTS_LIVE_WEBHOOK_SECRET` (currently set — verify it matches the live endpoint, not a stale one)
- Sandbox secret → `PAYMENTS_SANDBOX_WEBHOOK_SECRET` (same)

If the secrets are stale, signature verification will silently fail with 400 → Stripe retries for 3 days then gives up.

### 3. Safety net on the success page
Add a polling fallback to `src/pages/CheckoutSuccess.tsx` so even if a future webhook is slow/dropped the UI eventually reflects truth:
- After mount, poll `orders` by id every 2s up to 30s.
- If still unpaid after that, show "We're confirming your payment — you'll get an email shortly" + a link to `/account/orders` instead of an infinite spinner.

### 4. Diagnostic logging
Add a one-line `console.log("webhook hit", req.url, req.method)` at the very top of `supabase/functions/stripe-webhook/index.ts` (before env validation) so we can confirm in edge logs that Stripe is reaching us at all once you register the endpoint.

## Technical notes
- The handler already dedupes via `stripe_webhook_events` (PK on `event_id`), so re-delivering historical events from the Stripe Dashboard "Resend" button after step 2 is safe — it will fulfill any other orders stuck like this one without double-charging.
- Once the webhook is live, you can also retroactively reconcile by clicking "Resend" on the `checkout.session.completed` event for order FF614293 in Stripe Dashboard → Events. That would replace step 1 entirely. I'd still build `reconcile-order` since it's the right operational tool to have.

## Out of scope
- No changes to `create-checkout-session`, pricing, tax, or cart logic.
- No migration to Stripe Embedded Checkout — current redirect-based flow stays.
