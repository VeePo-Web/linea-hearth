## Payments audit — what I found

Your checkout is half-wired and currently **cannot take a real payment**. Two mismatches:

1. **Backend uses an old BYOK Stripe pattern** — `create-checkout-session`, `create-payment-intent`, and `stripe-webhook` all read `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (neither exists) and call `api.stripe.com` directly. They silently return "Stripe not configured."
2. **Your project has Lovable's built-in payments enabled** — `STRIPE_SANDBOX_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`, and `VITE_PAYMENTS_CLIENT_TOKEN` are all set. Nothing is using them.
3. **Frontend Express Pay** looks for `VITE_STRIPE_PUBLISHABLE_KEY` (not set) instead of `VITE_PAYMENTS_CLIENT_TOKEN`, so Apple Pay / Google Pay buttons never render.
4. **No products exist in Stripe yet** — your 16 active apparel products are only in Postgres.

You said "nothing complicated" so the plan keeps your existing UI, hooks, and DB schema untouched and only fixes the payment pipe.

## Assumptions (push back if wrong)

- One-time purchases only — no subscriptions / memberships
- Physical apparel → **tax calculation only** (+0.5%, Stripe calculates GST/PST/HST per province, you file). Full end-to-end handling isn't available for physical goods.
- Post-purchase: mark order paid, decrement variant stock, send confirmation email (reuse `send-order-confirmation`)
- Sync **all 16 active products** at their current `price` / `sale_price`

## Plan

**1. Add shared Stripe gateway client**
- Create `supabase/functions/_shared/stripe.ts` (verbatim from Lovable's pattern) so all functions route through the connector gateway using `STRIPE_SANDBOX_API_KEY` / `STRIPE_LIVE_API_KEY` — no more `STRIPE_SECRET_KEY`.

**2. Sync the 16 products to Stripe**
- One-time `batch_create_product` call: each product gets `tax_code: 'txcd_99999999'` (general tangible goods) and a single one-time price in CAD. `price_id` = product slug.
- Store the `price_id` on `products` (add `stripe_price_id text` column) so checkout can resolve it.

**3. Rewrite `create-checkout-session` to use Embedded Checkout**
- Use gateway client, look up prices via `lookup_keys`, return `clientSecret` instead of a redirect URL.
- Add `automatic_tax: { enabled: true }`, `shipping_address_collection`, and one shipping option ($10 std / $0 over $99) matching your existing free-ship threshold.
- Resolve/create a Stripe Customer with `metadata.userId` when logged in.
- Pass `payment_intent_data: { description }` so dashboard rows aren't "Unknown product".

**4. Swap frontend to Embedded Checkout**
- Add `src/lib/stripe.ts` (reads `VITE_PAYMENTS_CLIENT_TOKEN`) and `src/components/StripeEmbeddedCheckout.tsx`.
- Update `useStripeCheckout` to invoke the function and mount `<EmbeddedCheckout />` inline on `/checkout` instead of redirecting.
- Point `useExpressPay` + `StripeProvider` at `VITE_PAYMENTS_CLIENT_TOKEN` so Apple/Google Pay buttons activate.
- Add `<PaymentTestModeBanner />` to the layout.

**5. Fix `stripe-webhook` for the gateway**
- Verify signature with `PAYMENTS_SANDBOX_WEBHOOK_SECRET` (env-routed via `?env=sandbox|live`).
- Handle `checkout.session.completed` and `payment_intent.succeeded`: mark order paid, decrement `product_variants.stock`, call `send-order-confirmation`. Idempotent on `payment_intent.id`.
- Handle `charge.refunded` to flip order status.

**6. Delete unused `create-payment-intent`**
- Express Pay now goes through the same embedded checkout session; the manual PaymentIntent path is dead code.

**7. Verify**
- Run a sandbox checkout with test card `4242 4242 4242 4242`, confirm: order created → webhook fires → stock decremented → confirmation email sent → success page renders.

## Technical details

- **Files added**: `supabase/functions/_shared/stripe.ts`, `src/lib/stripe.ts`, `src/components/StripeEmbeddedCheckout.tsx`, `src/components/PaymentTestModeBanner.tsx`
- **Files rewritten**: `supabase/functions/create-checkout-session/index.ts`, `supabase/functions/stripe-webhook/index.ts`, `src/hooks/useStripeCheckout.ts`, `src/hooks/useExpressPay.ts`, `src/components/checkout/StripeProvider.tsx`
- **Files deleted**: `supabase/functions/create-payment-intent/index.ts`
- **Migration**: `alter table products add column stripe_price_id text;` populated after `batch_create_product`
- **config.toml**: keeps `verify_jwt = false` on `create-checkout-session` and `stripe-webhook`
- **Bundle / discount-code logic** in your existing edge function stays — applied via Stripe `discounts` array on the session

## Out of scope (ask if you want them)

- Subscriptions / memberships
- Full end-to-end compliance handling (not eligible for physical goods)
- Printful / fulfillment integration
- Going live — requires Stripe account verification (separate flow)
