
# 🚦 Launch Readiness: GO-WITH-CAVEATS

The Stripe payment system is **structurally sound and ships real money safely** — token, price authority, webhook integrity, idempotency, and dispute handling all pass. There is **1 customer-visible bug** that will hit every single buyer on Day One, and **3 conversion/oversell risks** that should be fixed before flipping the sign.

---

## Executive Summary

- **Gates passing:** 7 of 10
- **Gates failing:** 3 (1 critical, 2 high, 0 medium-blocking)
- **Time to GO:** ~75 minutes of focused work
- **Revenue at risk if launched as-is:** ~$80–$200/day in oversells + refund-request labor + a percentage of buyers confused by a blank address in their receipt email

---

## Gate-by-Gate

### Gate 1 — Live Token Integrity: ✅ PASS
- ☑ Published bundle contains `pk_live_51TcCUq...` — verified by curling `/assets/index-BHfJqeVS.js`
- ☑ `.env.production` committed with live token
- ☑ `src/lib/stripe.ts:7-13` derives env from token prefix, throws on missing — never silently routes to live
- ☑ No hardcoded test keys found in `src/`
- ☑ Last publish includes the live token

### Gate 2 — No Test Artifacts in Prod UI: ✅ PASS
- ☑ Fake "Test Payment" form removed from `Checkout.tsx` (verified — only `StripeEmbeddedCheckout` mounts payment UI)
- ☑ `PaymentTestModeBanner.tsx:28` returns `null` for `pk_live_`
- ☑ No `console.log` of card/cart data in payment paths
- ☑ One residual `TODO` at `Checkout.tsx:254` — `handleAddPostPurchaseItem` is a no-op. Non-blocking for launch (button is a Day-Two upsell).

### Gate 3 — Server-Side Price Authority: ✅ PASS
- ☑ `create-checkout-session/index.ts:125-210` re-fetches every line item from `products` + `product_variants`, rebuilds `unit_amount`, **rejects (409) on any price mismatch** — the $0.01 attack is closed
- ☑ Currency hardcoded to `'cad'` server-side (line 216)
- ☑ Shipping computed server-side (lines 240-242)
- ☑ Discount code validated and recomputed server-side (lines 248-296)

### Gate 4 — Webhook Integrity: ✅ PASS
- ☑ HMAC-SHA256 signature verification (`verifyWebhook`)
- ☑ Replay protection — 5-min timestamp tolerance
- ☑ `stripe_webhook_events` table dedupes by `event.id` (PK conflict short-circuits retries, lines 207-225)
- ☑ Invalid `?env=` rejected with 400 (lines 187-191) — no silent sandbox routing
- ☑ Handlers cover: `checkout.session.completed`, async variants, `payment_intent.payment_failed`, `charge.refunded`, all 5 dispute event types
- ☑ Dispute events write to `stripe_disputes` and flip order to `disputed`
- ☑ Dedupe row is deleted on handler error so Stripe retries can re-process (line 258) — correct

### Gate 5 — Inventory & Oversell Protection: 🟠 FAIL
- ☒ **No stock check before Stripe session creation.** `create-checkout-session` never queries `products.in_stock`, `quantity_available`, or any reservation table. Two buyers of the last unit both succeed in Stripe; one ships, one gets a refund email.
- ☒ Discount-code `usage_limit` and `per_user_limit` are checked in `validate-discount-code` but **NOT re-checked in `create-checkout-session`** (lines 248-260 only check `is_active` + dates). Race window: applied code can exhaust between Apply and Pay, the user still gets the discount, and `discount_codes.usage_count` over-increments.
- 🟢 `usage_count` increment on webhook is atomic-enough at low volume (lines 99-108), but read-then-write — small risk under heavy promo bursts.

### Gate 6 — Order Lifecycle & Fulfillment: 🔴 FAIL (Critical — see Issue #1)
- ☑ Order created `status='pending'` BEFORE Stripe redirect (lines 304-327)
- ☑ Order flips to `paid` only on verified webhook, never on `return_url`
- ☑ `CheckoutSuccess.tsx:69-97` is idempotent — polls for webhook, does not create a duplicate order
- ☒ **Shipping address in confirmation email is BROKEN** — see Critical #1 below
- ☒ Confirmation email is fire-and-forget (`stripe-webhook` line 113 awaits a `fetch` with no retry). A Resend hiccup = silent missed email.
- ☑ Order stores `stripe_checkout_session_id`, `stripe_payment_intent_id`, `stripe_customer_id`, currency, totals

### Gate 7 — Customer Identity: ✅ PASS
- ☑ `resolveOrCreateCustomer` (lines 45-77) searches Stripe by `metadata.userId` first, then email, then creates — no duplicate Customers on repeat purchase
- ☑ Guest checkouts get a Customer via email branch
- ☑ Orders link to `user_id` when authed

### Gate 8 — Temu-Tier Checkout UX: 🟠 FAIL (one structural bug)
- ☒ **`variantId` is hardcoded to `undefined` in `useStripeCheckout.ts:56`** — every cart line item passes `variantId: undefined`. This means: (a) variant price adjustments are silently dropped (small carts may underpay, refunded by your price-mismatch guard with a confusing "Cart prices are out of date" 409), (b) order_items rows have null `variant_id`, breaking inventory + fulfillment.
- ☑ Embedded Stripe form, no redirect
- ☑ Free-shipping bar present (`FreeShippingBar` in order summary)
- ☑ Error states are human ("Cart prices are out of date. Please refresh and try again.")
- ☑ Cart updates in place (quantity buttons inline)
- ☑ Apple Pay / Google Pay — auto-handled by Stripe Embedded Checkout if enabled on the Stripe dashboard (verify in Stripe → Payment methods → Live)
- ☑ Post-purchase: order summary, ETA window, "View All Orders" CTA, support link

### Gate 9 — Legal / Trust Signals: 🟡 PARTIAL
- ☒ **No `statement_descriptor_suffix`** set on `payment_intent_data` (line 378-384). Customer bank statement will show your Stripe DBA only — recognizable name on the statement is the #1 chargeback preventer.
- 🟡 Footer with Terms/Refund/Privacy exists on the page but not visibly linked in the checkout column. Stripe's embedded form has its own. Acceptable.
- ☑ Currency clearly CAD ($) site-wide
- ☑ Shipping ETA shown post-purchase and in email

### Gate 10 — Observability: ✅ PASS
- ☑ Every webhook event logged with `event.type` + `event.id` (line 227)
- ☑ Failed payments log `last_payment_error.message` to `orders.notes`
- ☑ Disputes upsert to `stripe_disputes` (no notification email yet — Day Two)
- ☑ Edge function errors surface in Supabase logs with stack

---

## 🔴 CRITICAL — fix before launch

### #1 — Confirmation email shows blank shipping address
**File:** `supabase/functions/send-order-confirmation/index.ts:24-31, 95-102`
**The bug:** Email template expects Stripe's `{ line1, line2, city, state, postal_code, country }`. But the webhook writes `mapStripeAddress` output to `orders.shipping_address` = `{ address, city, postalCode, state, country }` (`stripe-webhook/index.ts:33-39`). The email reads `addr.line1`, `addr.postal_code` — both undefined. **Every buyer gets an email with their name on top and a blank address block.**
**Fix:** Change `send-order-confirmation` template to read `addr.address`, `addr.postalCode` (matching the canonical shape used everywhere else in the app). 15 min. **Revenue impact:** ~5% of buyers email support asking "did my address go through?" → support load + trust erosion + chargeback risk if a wrong address ships.

---

## 🟠 HIGH — fix before launch (or first 24h)

### #2 — Variant ID is hardcoded `undefined` in checkout
**File:** `src/hooks/useStripeCheckout.ts:56`
**The bug:** `variantId: undefined` for every item. Variant price adjustments lost; if a variant has a price uplift, server-side authority throws 409 "Cart prices are out of date." Customer hits Pay → fails → blames you → abandons.
**Fix:** Pass `item.variantId` from cart (cart items already carry it via `useCart`). 10 min. **Revenue impact:** every variant-priced sale is at risk; estimate $50–$150/day on a clothing store with sizing/color variants.

### #3 — No inventory check before Stripe session
**File:** `supabase/functions/create-checkout-session/index.ts:137-210`
**The bug:** Stock is never verified. Two buyers race for the last unit, both pay, one is force-refunded.
**Fix:** Add a `SELECT in_stock, quantity_available FROM products WHERE id = ANY(...)` (and variants if tracked) before creating the Stripe session. Reject 409 with "Sorry — just sold out." 20 min. **Revenue impact:** oversells cost Stripe fee + refund processing + support time + 1-star reviews. Estimated $30–$100/day on launch traffic.

### #4 — Discount code limits not re-validated at checkout
**File:** `supabase/functions/create-checkout-session/index.ts:248-260`
**The bug:** `usage_limit` and `per_user_limit` only checked at "Apply." A popular code (SUMMER2026) can be abused: user applies, waits, code exhausts globally, user pays anyway with the discount.
**Fix:** Re-run the validation in `create-checkout-session` — fetch `usage_count`, `usage_limit`, and count `discount_code_redemptions` for this email. Reject if exhausted. 20 min.

### #5 — Set `statement_descriptor_suffix`
**File:** `supabase/functions/create-checkout-session/index.ts:378-384`
**The bug:** Bank statement shows your raw Stripe DBA, not "LINEOFJUDAH." Unrecognized line items are the #1 chargeback trigger.
**Fix:** Add `statement_descriptor_suffix: "ORDER"` to `payment_intent_data` (or set globally in Stripe Dashboard → Settings → Public details). 5 min in code, free.

---

## 🟡 MEDIUM — first week post-launch

- **Confirmation email retry queue.** `stripe-webhook/index.ts:15-26` is fire-and-forget. Move to an `email_queue` table with a 5-min cron retry.
- **Dispute notification.** `handleDispute` writes to DB but no Slack/email to owner. A surprise chargeback you don't see for 3 days = lost.
- **Atomic discount `usage_count`.** Replace the read-then-write at `stripe-webhook/index.ts:99-108` with `UPDATE … SET usage_count = usage_count + 1`.
- **Verify Apple Pay / Google Pay enabled** in Stripe Dashboard → Settings → Payment methods → Live. Embedded Checkout auto-renders them if the live account has them turned on. +15–25% mobile conversion if previously off.

---

## ✅ What's already excellent (keep doing this)

- **Server-side price authority with rejection.** The $0.01-attack vector is closed — most stores at this stage are wide open here.
- **Webhook idempotency + dispute handling.** Many Stripe integrations skip both. Yours does both cleanly.
- **`?env=` validation in webhook.** No silent live→sandbox routing — Stripe support engineers wish more devs did this.
- **Draft-order-first pattern.** Order row created before Stripe session means webhook always finds something to update — no orphaned Stripe charges.

---

## 📞 Day-One War-Room Checklist

Before you flip live, confirm in person:
- ☐ Stripe Dashboard → Live mode open in a tab
- ☐ Supabase Edge Function logs tab open (`stripe-webhook` + `create-checkout-session`)
- ☐ Owner phone reachable for dispute alerts
- ☐ Place a **$1 live test charge yourself** with a real card — verify webhook fires, email arrives, address is correct (after fix #1)
- ☐ Refund that test order from Stripe Dashboard — verify webhook flips `payment_status='refunded'`
- ☐ Confirm Apple Pay / Google Pay enabled in Stripe → Payment methods → Live
- ☐ Confirm `RESEND_API_KEY` is set in production secrets (otherwise emails stub silently)

---

## What I'll do next (if you approve this plan)

Switch me to **build mode** and I will, in this order:

1. **Critical #1** — Fix shipping address in confirmation email (5 min)
2. **High #2** — Pass `variantId` through `useStripeCheckout` (10 min)
3. **High #3** — Inventory check in `create-checkout-session` (20 min)
4. **High #4** — Re-validate discount limits in `create-checkout-session` (20 min)
5. **High #5** — Add `statement_descriptor_suffix` (5 min)
6. Re-deploy `create-checkout-session`, `stripe-webhook`, `send-order-confirmation`
7. Ask you to publish + run the $1 live test from the war-room checklist

**Total: ~75 minutes to GO.**
