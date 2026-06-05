## What you're seeing

After you submit your card, Stripe's iframe shows "Loading payment details…", then eventually drops you onto our success page which spins on "Loading order details…" and finally errors out. I confirmed this from your data: of the 9 most recent live checkouts, **only 1 was ever marked paid** in our database. The other 8 have a Stripe session ID but `payment_status = unpaid`. That means Stripe is collecting cards fine — our backend just never hears back that the payment cleared, so the success page polls for 30 seconds and gives up.

## Root causes found

1. **`src/pages/CheckoutSuccess.tsx` is structurally broken.** The post-purchase upsell `useEffect` was pasted *inside the cleanup function of the polling `useEffect`*. As a result: the upsell never grants, `cancelled` is never set to `true` (so polling keeps running after unmount), and the cleanup is essentially dead code. This is also why the page sometimes appears stuck.

2. **The Stripe webhook isn't reliably updating orders.** Our `stripe-webhook` hard-requires `?env=live` or `?env=sandbox` on the URL. If the Stripe Dashboard webhook endpoint is missing that query param (or pointing at the wrong env), Stripe gets a 400 and our DB never flips `payment_status` to `paid`. That matches the pattern in the data — one order got through, the rest didn't.

3. **No client-side self-heal when the webhook is late or missing.** `reconcile-order` exists but is admin-only, so the success page can't ask the server to verify the session directly with Stripe.

4. **Success page uses polling, not Realtime.** Even when the webhook *does* fire, the user may wait up to 2s for the next poll tick. Realtime would flip the state instantly.

## Fix plan

### 1. Repair `src/pages/CheckoutSuccess.tsx`
- Move the upsell `useEffect` out of the polling effect's cleanup back to top-level.
- Properly close the polling effect with `return () => { cancelled = true; }`.
- While polling, if 6 seconds elapse without `payment_status === "paid"`, fire a one-shot call to a new public reconcile function (see step 2) and continue polling.
- Replace the 2s polling loop with a Postgres Realtime subscription on `orders` filtered by `stripe_checkout_session_id`, falling back to polling if Realtime errors. This makes the "Loading order details…" disappear the instant the webhook (or reconcile) writes.

### 2. New edge function `reconcile-session` (public, scoped)
A narrow, public variant of `reconcile-order` that the success page can call:
- Input: `{ sessionId, environment }`.
- Looks up the order by `stripe_checkout_session_id`. If already paid → returns ok.
- Retrieves the Stripe session via `createStripeClient(environment)`. If `payment_status === "paid"` or `status === "complete"`, applies the same updates as `handleCheckoutCompleted` (mark paid, copy tax/shipping/discount/total, save PI + customer, update addresses, fire order confirmation email, mark abandoned carts converted, record discount redemption).
- Idempotent: bails early if already paid.
- Registered in `supabase/config.toml` with `verify_jwt = false`.
- Rate-limited implicitly because it only runs once from the success page after the 6s grace.

This is the safety net: even if the webhook endpoint is broken or the `?env=` query is wrong, the user still sees their confirmation.

### 3. Webhook configuration check (no code change — guidance)
Confirm in Stripe Dashboard → Developers → Webhooks that:
- Live endpoint URL ends with `?env=live`
- Sandbox endpoint URL ends with `?env=sandbox`
- Both subscribe to: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.*`.

If the live URL is missing `?env=live`, that alone explains every stuck order. I can't read the Stripe Dashboard for you, but I'll surface this in the success page error copy so it's obvious when it happens.

### 4. Better failure copy on `CheckoutSuccess`
Replace the generic "Your payment is still being confirmed…" timeout message with two paths:
- If `reconcile-session` returns "Stripe says session not paid" → "Payment didn't complete. Your card was not charged."
- If reconcile succeeds after the timeout → silently flip to the paid success view.
- If both fail after ~40s → show contact link + the session ID so support can resolve it manually.

## Files to change

- `src/pages/CheckoutSuccess.tsx` — restructure effects, add Realtime + reconcile fallback, improve copy.
- `supabase/functions/reconcile-session/index.ts` — new public reconcile function.
- `supabase/config.toml` — register `[functions.reconcile-session]` with `verify_jwt = false`.

## Out of scope (call out, don't change)

- The Stripe Dashboard webhook URL itself — needs your eyes once. I'll add a banner on the success page if reconcile keeps reporting "not paid" so you'll know within one test order whether it's a webhook config issue.
- The 1 paid order missing `stripe_payment_intent_id` is unrelated cosmetic — Stripe didn't include `payment_intent` on the session retrieve in that case. Not affecting checkout UX.
