# Take Linea Hearth checkout live

## Current state
- Sandbox + live Stripe keys are provisioned (`STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `PAYMENTS_LIVE_WEBHOOK_SECRET` all present).
- Go-live steps 1–4 done. Only the readiness check remains.
- Checkout code is wired with `automatic_tax: { enabled: true }`, CAD only, apparel tax code on every line item, embedded checkout, webhook with HMAC verify.
- Tax decision (locked): keep `automatic_tax` (+0.5%). No managed_payments — physical apparel isn't eligible.

## What to change in code

1. **Harden `src/lib/stripe.ts`** so a production build with a missing/unknown token fails loudly instead of silently defaulting to "live" and surfacing as `STRIPE_LIVE_API_KEY is not configured` deep in the edge function:
   - Derive env from token prefix (`pk_test_` → sandbox, `pk_live_` → live).
   - Throw on missing/unknown token instead of returning `"live"` by default.

2. **Update `PaymentTestModeBanner`** to also render a red "Production checkout not configured" strip when the token is missing — protects end users if `.env.production` ever ships empty.

3. **Production env file**: confirm `.env.production` exists with `VITE_PAYMENTS_CLIENT_TOKEN=pk_live_…`. If not, Lovable's go-live step 4 should have written it; we surface this in the readiness check rather than hand-editing.

4. **No tax-handling code change.** `automatic_tax: { enabled: true }` stays. Apparel tax code (`txcd_30060001`) on line items stays. Shipping tax code (`txcd_92010001`) stays.

5. **No managed_payments.** Explicitly do NOT add it — it would break live checkout for physical goods.

## Go-live actions for you (in the Payments tab)

1. Run the **Readiness check** — it validates live products, prices, webhooks.
2. Fix anything it flags (most common: product missing tax_code; products are synced sandbox→live on publish so this is usually clean).
3. Publish the site so `.env.production` ships with the `pk_live_` token to the live URL.

## After go-live — test live with a real card

Run **one real $1–$5 order** end-to-end on the published URL with a real Canadian address:
- Verify Stripe Dashboard shows the charge in **live** mode.
- Verify the webhook fires (`stripe-webhook` logs show `checkout.session.completed`).
- Verify the order row in the DB flips from `pending`/`unpaid` to `paid` with tax_cents filled in by Stripe.
- Verify the confirmation email arrives.
- Refund the test order from the Stripe dashboard.

## Out of scope (not changing)
- CAD-only checkout — staying CAD per project memory.
- Shipping rates ($10/$15/$35, $99 free threshold) — already correct.
- Discount code flow, abandoned cart, post-purchase signup — all already working in sandbox, will work identically in live.
- Switching to managed_payments later — only viable if/when you sell digital goods.

## Technical notes
- The shared utility `_shared/stripe.ts` already routes through the connector gateway and reads `STRIPE_LIVE_API_KEY` when `environment === "live"`. No edge-function code changes needed.
- Frontend sends `environment` derived from the client token, so production builds automatically request live sessions.
- Webhook endpoint is the same handler for both envs (Lovable registered `?env=sandbox` and `?env=live` URLs against `stripe-webhook`).

Approve to apply the two small frontend hardening edits and walk you through the readiness check.
