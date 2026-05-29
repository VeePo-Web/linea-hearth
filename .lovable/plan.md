## Post-Purchase One-Click Upsell

Apple-style: after payment confirms, surface ONE complementary product. Tap once → charges the saved card via `off_session` PaymentIntent, attached to a sibling order that ships with the original. 60-second signed offer token. Graceful fallbacks for 3DS, declines, and expired offers.

---

### 1. Save the payment method during the parent checkout

`create-checkout-session/index.ts` — add to `payment_intent_data`:
```ts
setup_future_usage: "off_session",
```
This persists the PM on the resolved Customer so we can reuse it. No other checkout changes.

### 2. Database — `post_purchase_offers`

New table to mint, track, and single-use-enforce offers.

| column | type | notes |
|---|---|---|
| `id` | uuid pk | |
| `parent_order_id` | uuid | references the original order |
| `customer_email` | text | |
| `stripe_customer_id` | text | snapshotted at grant |
| `parent_payment_intent_id` | text | source of the saved PM |
| `product_id` | uuid | |
| `variant_id` | uuid \| null | default in-stock variant |
| `unit_amount_cents` | int | server-authorized price after upsell discount |
| `original_unit_amount_cents` | int | for "was/now" display |
| `discount_pct` | int | 15 (configurable) |
| `token_hash` | text unique | SHA-256 of HS256 JWT |
| `expires_at` | timestamptz | grant time + 60s |
| `status` | text | `pending` \| `accepted` \| `expired` \| `declined` \| `failed` |
| `child_order_id` | uuid \| null | filled on success |
| `child_payment_intent_id` | text \| null | |
| `failure_reason` | text \| null | `authentication_required` \| `card_declined` \| etc. |
| `granted_at`, `accepted_at`, `updated_at` | timestamptz | |

RLS: admins read-all; no client write paths (everything goes through edge functions). GRANTs to `service_role` only.

### 3. Edge function — `grant-upsell-offer` (verify_jwt = false)

Called by `CheckoutSuccess` once per session (idempotent on `parent_order_id`).

Logic:
1. Load order; require `payment_status = 'paid'` AND `created_at > now() - 30 min`.
2. Refuse if a `post_purchase_offers` row already exists for this order (return existing if still `pending` AND not expired).
3. Pick candidate: top complementary product to the largest line in the order — reuse the same heuristic as `useCompleteTheLook` (same category, in stock, NOT already in the order). Default to a fallback "always-on" SKU if no match.
4. Pick a default in-stock variant; bail (return `null`) if none.
5. Compute `unit_amount_cents = round(sale-aware price * (1 - discount_pct/100))`. Hard-cap discount via env (`UPSELL_MAX_DISCOUNT_PCT`, default 20).
6. Mint HS256 JWT signed with `SUPABASE_SERVICE_ROLE_KEY`, payload `{ offerId, orderId, productId, variantId, unitAmountCents, exp: now+60s }`. Store its SHA-256 in `token_hash`.
7. Insert row, return `{ token, expiresAt, product: {...}, originalPriceCents, priceCents, discountPct, image }`.
8. Log `upsell_events` row `event_type='post_purchase_shown'`.

### 4. Edge function — `accept-upsell-offer` (verify_jwt = false)

Called when user taps "Add to Order".

Logic:
1. Verify JWT signature, look up row by `token_hash`, check `status='pending'`, `expires_at > now()`.
2. Atomically flip status to `accepting` (single-use guard).
3. Retrieve parent PaymentIntent → grab `payment_method` (it was saved via `setup_future_usage`).
4. Re-check variant stock; if depleted, mark `failed/out_of_stock` and return `409`.
5. Build a child draft `orders` row with `metadata.parentOrderId`, shipping copied from parent, `shipping_cents: 0` (ships together), one `order_items` row.
6. `stripe.paymentIntents.create({ amount, currency: 'cad', customer, payment_method, off_session: true, confirm: true, description: 'LOJ upsell - <parent #>', metadata: { childOrderId, parentOrderId, offerId } })`.
7. **Success** (`status='succeeded'`): mark offer `accepted`, child order `paid`, return `{ outcome: 'charged' }`. Webhook (existing `stripe-webhook` `payment_intent.succeeded` branch — add a thin handler keyed on `metadata.childOrderId`) finalizes confirmation email.
8. **`requires_action`** (3DS): mark offer `failed/authentication_required`, return `{ outcome: 'authentication_required', clientSecret: pi.client_secret }`. Frontend mounts `stripe.confirmCardPayment(clientSecret)` inline using `@stripe/stripe-js` to complete SCA without leaving the success page. No new Checkout Session needed.
9. **`StripeCardError`** (declined/expired card): mark `failed/<code>`, return `{ outcome: 'declined', reason }`.
10. Always log `upsell_events`.

### 5. Webhook hook (`stripe-webhook/index.ts`)

Add a small branch in `payment_intent.succeeded`: if `metadata.childOrderId`, mark that child order `paid` (idempotent) and fire `send-order-confirmation` for the child order. This catches the 3DS path where the success arrives via webhook, not the inline API response.

### 6. Frontend — `PostPurchaseOffer.tsx` (rewrite)

Replace the current hardcoded mock entirely.

State machine: `loading → idle → submitting → success | sca | declined | expired | error`.

- On mount with a token, kick a 60s countdown driven by `expiresAt` (not local 5-min timer). Auto-dismiss at 0.
- **Idle**: real product image, "was $X / now $Y / -Z%", single primary CTA "Add to Order — $Y", small "No thanks".
- **Submitting**: button → spinner + "Charging your card…". Disabled.
- **Success**: green confirmation row "Added — ships with your order. Confirmation sent to <email>.", auto-close after 2.5s.
- **SCA fallback**: render Stripe Elements with `clientSecret`, "Confirm payment" CTA → `confirmCardPayment` → on success show same success state.
- **Declined**: "Your card couldn't be charged. Add it to your next order?" with a single CTA that opens normal cart with that variant pre-added; no retry on the saved PM (avoids hammering a bad card).
- **Expired**: "Offer ended. Want to add it to a new order?" → cart link.
- All states use brand tokens (Forest Green `#4CAF50`, Silver Chrome, `rounded-none`). No champagne/gold classes — strip the existing `champagne-*` usage.

### 7. Frontend — `CheckoutSuccess.tsx` wiring

After `order` loads AND `payment_status === 'paid'` AND `!user || user.id === order.user_id`:
1. Call `supabase.functions.invoke('grant-upsell-offer', { body: { orderId: order.id } })` once (guard with a ref).
2. If response has an offer payload, open `<PostPurchaseOffer ... />` after a 600ms beat (let the success animation breathe).
3. Pass `offer`, `onAccept` (calls `accept-upsell-offer`), `onDismiss` (logs `event_type='post_purchase_declined'`).
4. Hide the offer entirely if the user is on `prefers-reduced-motion` AND we couldn't grant — never block the success page.

### 8. Anti-abuse / safety

- Server-side: hard cap discount %, single-use token, parent order must be paid + < 30 min old, only one offer per parent order, variant stock re-checked at accept, idempotency on `metadata.childOrderId` in webhook.
- Token: HS256, 60s `exp`, `token_hash` indexed unique, single-use flip before charging.
- Never trust client price. `accept-upsell-offer` recomputes `unit_amount_cents` from DB and compares to JWT claim — reject on mismatch.
- Rate-limit `grant-upsell-offer` to 5/min per `parent_order_id` via insert-or-update (effectively 1 since unique).
- Log every state transition to `upsell_events` for the existing admin upsell telemetry.

### 9. Out of scope (explicit)

- No subscription / recurring charges.
- No multi-item upsell carousel (one SKU, one tap).
- No coupon code generation — discount is baked into the offer price.
- No address re-collection — ships to parent's shipping_address verbatim.
- No retry of declined cards.
- Admin CMS for "upsell rules" — uses the existing complementary-product heuristic; we add a config UI later if take-rate justifies it.

### 10. Files

**Create**
- `supabase/migrations/<ts>_post_purchase_offers.sql`
- `supabase/functions/grant-upsell-offer/index.ts`
- `supabase/functions/accept-upsell-offer/index.ts`

**Edit**
- `supabase/functions/create-checkout-session/index.ts` — add `setup_future_usage: "off_session"`.
- `supabase/functions/stripe-webhook/index.ts` — child-order `payment_intent.succeeded` branch.
- `supabase/config.toml` — register two new functions with `verify_jwt = false`.
- `src/components/checkout/PostPurchaseOffer.tsx` — full rewrite per §6.
- `src/pages/CheckoutSuccess.tsx` — wiring per §7.

### 11. Smoke test

- Sandbox card `4242…` → checkout → success page → offer appears → tap → child order created `paid`.
- Sandbox card `4000 0025 0000 3155` (3DS) on parent → SCA branch on accept.
- Sandbox card `4000 0000 0000 0341` (saved PM later declines) on accept → declined branch.
- Reload success page → offer does NOT re-grant (idempotent).
- Wait 61s → tap → expired branch.

### Open questions

1. **Discount %** — default `15`. Want `20` or A/B-able via env? (I'll ship `UPSELL_DISCOUNT_PCT=15` env, fallback 15.)
2. **Eligibility window** — I'm proposing 30 min after the parent order paid. Confirm or change?
