## Pre-launch verification plan

Cannot run an actual live purchase from this environment, but here's a layered check that gets you confidence equivalent to a stress test.

## Tier 1 — Static checks (I can do now, no risk)

1. **Re-grep code** for any residual `lineofjudah.com` references, any hardcoded `pk_test`, any `success_url`/`cancel_url` left over from redirect-mode checkout (Embedded mode uses `return_url` only).
2. **Verify `supabase/config.toml`** has `verify_jwt = false` on every payment-related function (`create-checkout-session`, `stripe-webhook`, `get-order-by-session`, `reconcile-session`, `recover-payment`, `send-retry-payment-email`).
3. **Confirm webhook endpoint** is registered for **live** mode in your Stripe dashboard pointing at `stripe-webhook?env=live`, and the `PAYMENTS_LIVE_WEBHOOK_SECRET` matches.
4. **Replay the 2 recent live orders** in the DB to confirm the schema columns match what `get-order-by-session` returns to `CheckoutSuccess.tsx`.

## Tier 2 — Synthetic webhook stress (I can do, zero customer impact)

5. **Fire 5 simulated webhook events** at the deployed `stripe-webhook` function:
   - `checkout.session.completed` (happy path) → expect order flips to `paid` + confirmation email queued.
   - `checkout.session.expired` → expect retry email row created with `retry_token`.
   - `payment_intent.payment_failed` → expect retry email + `retry_reason='payment_failed'`.
   - `charge.refunded` → expect refund confirmation email.
   - Duplicate of #1 (same event id) → expect idempotent no-op.
   I'll use synthetic Stripe payloads + the live webhook secret to sign them properly. Each runs against a throwaway test order I insert and then delete.
6. **Hit `recover-payment` with the test token** from step 5 → confirm cart items round-trip and `/recover-payment` page renders.

## Tier 3 — End-to-end live test (you do, ~$1)

7. **You** put one cheap item in cart, run a real checkout with a real card, and confirm:
   - Success page renders within 10s.
   - Order confirmation email arrives (requires Resend DNS verified for `lineofjudah.clothing`).
   - Order shows in `/account/orders` and `/ops-portal/orders`.
   Refund yourself from the ops portal afterward to verify the refund email path.

## Launch-readiness verdict (after each tier)

After Tier 1 + 2 pass: **safe to soft-launch** (happy path proven, retry path simulated).
After Tier 3 passes: **safe to fully launch and announce**.

## What's still blocked on you, not me

- **Resend DNS verification for `lineofjudah.clothing`** — without this, every email (confirmation, retry, refund, abandoned cart) silently fails with 403. Customers will still be charged correctly and the success page will work — they just won't receive any email. This is the single biggest launch blocker.
- **Tier 3 real-card test** — I cannot do this; only you can.

## Out of scope

- Performance/load testing (Stripe + Supabase scale way past your expected volume).
- 3DS / SCA edge cases (Stripe handles these inside the embedded form; nothing for us to test).
- Mobile-specific payment methods (Apple Pay / Google Pay) — enabled by default in Embedded Checkout if your Stripe account allows them.
