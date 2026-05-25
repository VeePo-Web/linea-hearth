# Stripe Payments Integration — Implementation Plan

Eligibility check ran: classifies as physical apparel. Stripe is suitable (overriding Shopify suggestion per your direction). Printful handles fulfillment downstream.

**Note on Stripe tax option:** For physical goods, Stripe offers tax *calculation + collection* (`automatic_tax: true`) — not full Merchant-of-Record handling. You're still responsible for filing/remittance, but Stripe tracks nexus thresholds and alerts you. Adds ~0.5% per transaction. This matches what you requested.

---

## Phase 0 — Enable Stripe Payments
Call `enable_stripe_payments`. Sandbox is created instantly; live mode requires account claim later.

## Phase 1 — Catalog Sync
- **Migration**: add `products.stripe_product_id`, `product_variants.stripe_price_id`, `discount_codes.stripe_coupon_id`, `orders.refunded_cents`, new `stripe_webhook_events` table (PK `event_id`, admin-only SELECT, service-role INSERT). Indexes on Stripe ID columns + `orders.stripe_checkout_session_id`, `orders.stripe_payment_intent_id`, `orders.payment_status`.
- Edge function `sync-stripe-catalog` (admin-only, JWT verified): iterates active products → `batch_create_product` with tax code `txcd_30060005` (apparel lookup per product, not hardcoded), images from `product_images`, metadata. One Stripe Price per variant in CAD cents from `price + price_adjustment`. Persists IDs back.
- Hook fire-and-forget invocation into `AdminProductForm.tsx` after successful save.

## Phase 2 — Rewrite `create-checkout-session`
Zod-validated body: `{ items[], customer_*, shipping_address, discount_code?, shipping_method, success_url, cancel_url }`.

Server logic (never trusts client money):
1. Re-fetch variants, recompute unit prices, reject OOS.
2. Validate discount via existing `validate-discount-code`.
3. Shipping matrix (CAD cents): subtotal ≥ 9900 → 0; else standard 1000 / express 1500 / oversize 3500.
4. Build `line_items` from Stripe `price` IDs (so Stripe Tax classifies correctly).
5. Insert `orders` row (`status='pending'`, `payment_status='unpaid'`, `stripe_checkout_session_id`) + `order_items` BEFORE returning URL — enables abandoned-cart detection and admin visibility.
6. Stripe session config:
```
mode: 'payment', currency: 'cad',
shipping_address_collection: { allowed_countries: ['CA','US'] },
shipping_options: [...matrix],
automatic_tax: { enabled: true },
tax_id_collection: { enabled: true },
phone_number_collection: { enabled: true },
discounts: stripeCouponId ? [{ coupon }] : undefined,
allow_promotion_codes: false,
metadata: { supabase_order_draft_id, discount_code, shipping_method }
```
Returns `{ url, session_id, order_id }`.

## Phase 3 — Rewrite `stripe-webhook`
Lovable-managed signature verification (no manual HMAC). Idempotency via `stripe_webhook_events` insert-on-conflict.

Handles:
- `checkout.session.completed` → flip paid, write Stripe-authoritative `shipping/tax/discount/total_cents`, insert `discount_code_redemptions`, atomically decrement `stock_quantity`, invoke `send-order-confirmation`, **TODO block** for Printful submission with payload shape commented.
- `payment_intent.payment_failed` → mark failed, send retry email.
- `charge.refunded` → write `refunded_cents`, set `refunded`/`partially_refunded`, email customer.
- `charge.dispute.created` → `status='disputed'`, alert `parker@veepo.ca`.
- `customer.subscription.*` → log + ignore.

## Phase 4 — Frontend Checkout
- `useStripeCheckout`/`Checkout.tsx`: remove any Elements / PaymentIntent path, redirect to returned `url`.
- Keep all pre-checkout UX (cart awareness, free-ship celebrations, discount entry, address autofill, typo detection, save-for-later, just-added toast).
- `/checkout/success?session_id=...` → query the now-paid order, run post-purchase 1-click signup (WELCOME10-), show summary.
- Cancel → `/checkout` with cart preserved.
- Remove/retire `create-payment-intent`, `ExpressCheckout`, `StripeProvider`, `useExpressPay`, `ExpressPayButton` (legacy BYOK Elements). Free-up `VITE_STRIPE_PUBLISHABLE_KEY` references.

## Phase 5 — Admin Payments (`/ops-portal/payments`)
032c industrial-elegant, `rounded-none`, silver chrome. Reuses admin guard + 30-min timeout.
- Live revenue strip (today / 7d / 30d / all-time, paid orders).
- Recent transactions table → opens `AdminOrderDetail`. Filter chips: Paid / Refunded / Disputed / Failed.
- Payouts card via new `list-stripe-payouts` edge function.
- Refund action in `AdminOrderDetail` → new `refund-stripe-charge` edge function with reason dropdown; webhook reconciles.
- Disputes inbox with deep links to Stripe-hosted evidence URLs.
- Catalog sync button + last-sync timestamp.
- Shipping rules read-only card linking to `mem://technical/backend/shipping-logic`.

## Phase 6 — Discount Codes ↔ Stripe Coupons
`AdminDiscounts.tsx` save → mirror coupon to Stripe (pct or fixed CAD, expires, max_redemptions), store `stripe_coupon_id`. Checkout passes coupon → Stripe Tax computes on discounted base. Client-side validation stays UX-only.

## Phase 7 — Migration (single call)
All columns + `stripe_webhook_events` table + RLS + indexes listed above.

## Phase 8 — QA (sandbox, `4242 4242 4242 4242`)
- [ ] $50 cart → $10 ship → $60 + tax
- [ ] $120 cart → $0 ship → tax still applied
- [ ] `SUMMER2026` reduces tax base server-side
- [ ] `4000 0000 0000 0002` → `payment_status='failed'`, retry email
- [ ] Successful pay → paid + stock decremented + confirmation + post-purchase signup + webhook event row
- [ ] Admin refund → refunded + email
- [ ] Webhook replay → idempotent
- [ ] 30-min abandoned → recovery email fires
- [ ] Admin Payments totals match `orders` table, payouts render

---

## Technical notes
- **No `STRIPE_SECRET_KEY`** anywhere. Lovable-managed Stripe client only.
- All currency CAD. Server is source of truth for prices/discount/shipping/tax.
- `rounded-none` everywhere. `<Link>` only. CORS + Zod on every edge function.
- `src/integrations/supabase/{client,types}.ts` untouched.
- After completion, update `mem://technical/payments/stripe-integration` with final architecture.

## Files touched (estimate)
- **New**: `sync-stripe-catalog`, `list-stripe-payouts`, `refund-stripe-charge` edge functions; `AdminPayments.tsx`; migration.
- **Rewritten**: `create-checkout-session`, `stripe-webhook`, `Checkout.tsx`, `CheckoutSuccess.tsx`, `useStripeCheckout.ts`, `AdminProductForm.tsx` (hook), `AdminDiscounts.tsx` (coupon mirror), `AdminOrderDetail.tsx` (refund action).
- **Removed**: `create-payment-intent`, `ExpressCheckout.tsx`, `StripeProvider.tsx`, `useExpressPay.ts`, `ExpressPayButton.tsx`.

Approve to switch to build mode and execute Phases 0 → 8 sequentially. Phase 0 (`enable_stripe_payments`) opens a form for your business details — fill that in to provision the sandbox.