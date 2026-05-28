# Enable Lovable Stripe Payments

## What this does
Activates Lovable's built-in Stripe integration — no API keys, no Stripe account setup, no dashboard configuration. Lovable provisions:
- A sandbox Stripe environment (test mode immediately)
- Webhook endpoints (sandbox + live) already pointed at the `stripe-webhook` edge function
- Env vars: `STRIPE_SANDBOX_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `VITE_PAYMENTS_CLIENT_TOKEN` (in `.env.development`)
- Live keys auto-provisioned later when you complete go-live

## Current state
Your codebase is already wired for this:
- `src/lib/stripe.ts` reads `VITE_PAYMENTS_CLIENT_TOKEN`
- `supabase/functions/_shared/stripe.ts` uses `createStripeClient` via the connector gateway
- `create-checkout-session` and `stripe-webhook` edge functions exist
- `StripeEmbeddedCheckout` component is in place

So once payments are enabled, checkout will work in sandbox immediately with no code changes required.

## Steps
1. Call `enable_stripe_payments` — provisions sandbox keys and webhooks
2. Verify `.env.development` now contains `VITE_PAYMENTS_CLIENT_TOKEN` starting with `pk_test_`
3. Confirm `PaymentTestModeBanner` shows the orange "test mode" strip in preview
4. Test a checkout in sandbox with card `4242 4242 4242 4242`

## Going live (later, separate step)
When you're ready for real money:
- Run go-live flow (business info, identity verification via Stripe)
- Lovable auto-provisions `STRIPE_LIVE_API_KEY` + `PAYMENTS_LIVE_WEBHOOK_SECRET`
- Production builds will automatically use the live token

## Notes
- The +3.5% managed payments / tax-handling decision can be made at go-live; sandbox doesn't need it.
- No code edits needed in this step — purely an integration activation.

Approve to proceed.