# Stripe Payment System Audit — Linea Hearth

Audited eight layers: env hygiene, session construction, webhooks, data, UX, errors, go-live, leakage. Findings are dollar-ranked, evidence-backed, and ready to ship.

---

## 🔴 P0 — Revenue is bleeding *right now*

### FINDING #1 — Anyone can buy your entire catalog for $0.01
- **Layer:** 2 (Session construction)
- **File:** `supabase/functions/create-checkout-session/index.ts:128`
- **Evidence:** `const unitAmount = Math.round(item.price * 100);` — prices come straight from the client request body. No lookup against the `products` table. Hostile shopper opens DevTools, edits the fetch payload, sets `price: 0.50`, and Stripe happily charges 50¢ for a $200 hoodie.
- **Impact:** Catastrophic. One TikTok demo of this exploit = inventory wiped overnight at near-zero revenue. Even without malice, a stale client cache pushes wrong prices.
- **Fix:** In the edge function, fetch each `productId`/`variantId` from the DB and rebuild `unit_amount` from server-trusted prices. Reject the request if any client price differs by >0¢. Keep the client `price` only for display.
- **Verify:** curl the edge function with a tampered price body — must return 400.

### FINDING #2 — "Test Payment" button completes orders without charging — in LIVE
- **Layer:** 5 (UX) + 6 (Errors)
- **File:** `src/pages/Checkout.tsx:1055–1062`, with handler at `:246–263`
- **Evidence:** A second "Test Payment" button is rendered next to the Stripe embedded checkout. Its handler `handleCompleteOrder` does `await new Promise(r => setTimeout(r, 2000))` then sets `paymentComplete = true` and shows the success screen. **No Stripe call. No order.payment_status update.** Plus it collects raw `cardNumber`/`cvv`/`expiryDate` into React state via the dummy form above it — a PCI scope violation if the page is ever screen-recorded or logged.
- **Impact:** Every customer who clicks "Test Payment" instead of "Pay" gets the goods for free. Even at 1% mis-click rate on 100 orders/mo at $150 AOV = **$150/mo gifted + chargeback risk**. The PCI exposure alone is unacceptable in live mode.
- **Fix:** Delete the entire fake card form (`paymentDetails` state, all four inputs, the "Test Payment" button, and `handleCompleteOrder`). Leave only the Stripe embedded checkout. The "100% Secure Checkout" copy can stay.
- **Verify:** `rg "cardNumber|cvv|paymentDetails" src/pages/Checkout.tsx` returns nothing.

### FINDING #3 — Published bundle still has no live token
- **Layer:** 1 (Env hygiene)
- **File:** Last published `index-*.js` on `linea-hearth.lovable.app`
- **Evidence:** Previous turn — bundled `VITE_PAYMENTS_CLIENT_TOKEN` is `void 0`; `loadStripe(null)` returns `Promise.resolve(null)`. `.env.production` now correctly contains `pk_live_51TcCUq…`, but Vite only bakes env values **at build time**, and no publish has happened since.
- **Impact:** 100% of live shoppers see a broken Stripe iframe. Conversion = 0% on the live URL right now.
- **Fix:** Publish the app. (One click after you approve this plan.)
- **Verify:** `curl -s https://linea-hearth.lovable.app/assets/index-*.js | grep -o 'pk_live_[A-Za-z0-9]\{20\}'` returns the token.

---

## 🟠 P1 — Slow leaks (fix this week)

### FINDING #4 — Percent-discount cap silently desyncs DB from Stripe
- **File:** `create-checkout-session/index.ts:178–187`
- **Evidence:** When a code is `percentage` with `maximum_discount_cents`, you create a Stripe coupon at `percent_off` only (Stripe can't cap percent coupons) and store the capped value locally in `discountCents`. Stripe applies the *uncapped* percent. Order row says discount=$20; Stripe charged $40 off.
- **Impact:** Reconciliation drift, accounting errors, support tickets. Magnified during big promos.
- **Fix:** For percent codes with a cap, pre-compute the dollar discount yourself and create an `amount_off` coupon instead. One branch in the existing if/else.

### FINDING #5 — No inventory check before checkout → oversell
- **File:** `create-checkout-session/index.ts` (entire function)
- **Evidence:** No stock query. Two shoppers can buy the last unit; both succeed at Stripe.
- **Impact:** Refunds, apology emails, brand damage, fulfillment chaos. On Printful POD this matters less for stock, but matters a lot for **limited drops** and **discount-code single-use enforcement**.
- **Fix:** Before creating the Stripe session, atomically validate (a) variant in_stock, (b) discount code `usage_count < usage_limit`. Reserve via a short-lived `reservations` row or `SELECT … FOR UPDATE`.

### FINDING #6 — Webhook silently defaults missing/invalid `?env=` to sandbox
- **File:** `supabase/functions/stripe-webhook/index.ts:147`
- **Evidence:** `const env = rawEnv === "live" ? "live" : "sandbox";` — a misconfigured Stripe endpoint or a corrupted URL routes a live event to sandbox creds → signature check fails silently and Stripe retries for 3 days, then gives up.
- **Impact:** Lost orders that look "paid" in Stripe but never flip `payment_status` in your DB. Customer pays, gets nothing.
- **Fix:** If `rawEnv !== "live" && rawEnv !== "sandbox"`, log loudly and return 400 (not 200). Then add a `stripe_webhook_events` log table with `(event_id PK, type, env, processed_at)` to dedupe replays and surface failures.

### FINDING #7 — Live webhook handler missing key events
- **File:** `stripe-webhook/index.ts:158–169`
- **Evidence:** Handles `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`. Missing: `charge.dispute.created` (chargebacks), `charge.dispute.funds_withdrawn`, `payment_intent.succeeded` (covers payments outside Checkout), `charge.refund.updated` (partial refunds). Dispute events especially — you have no in-app visibility into chargebacks today.
- **Impact:** First chargeback hits, you find out via Stripe email 7 days later instead of immediately in the ops portal.
- **Fix:** Add a `charge.dispute.*` branch that writes to a new `disputes` table and emails ops.

---

## 🟡 P2 — Polish & growth levers

- **FINDING #8** — `stripe.coupons.create` on every checkout (≈200ms latency, rate-limit pressure). Cache one Stripe coupon per discount-code row, reuse.
- **FINDING #9** — `useStripeCheckout` doesn't pass `userId` explicitly; relies on JWT in `Authorization` header (works, but fragile — guest carts that later log in lose the link). Pass `user?.id` in the body.
- **FINDING #10** — Confirmation email is fire-and-forget (`fetch` with no await, no retry). If Resend hiccups, customer never gets receipt → support ticket. Move to a Postgres `email_queue` table + cron retry.
- **FINDING #11** — No Stripe Adaptive Acceptance / Network Tokens enabled. Adds ~1–3% to authorization rate on Visa/MC. One toggle in the Stripe dashboard.

---

## 🏆 Top 3 bleeds ranked by $ / hour

1. **#3 Re-publish** — 30 seconds, restores 100% of live revenue.
2. **#2 Delete fake card form** — 10 minutes, stops free-order exploit + PCI exposure.
3. **#1 Server-side price validation** — 45 minutes, kills the catastrophic price-tampering vector.

**Total time to close all three P0s: under 90 minutes. Estimated revenue protected: the entire business.**

---

## Implementation plan (in order)

1. **Re-publish** — restores live checkout. (User action.)
2. **Strip the fake card form from `Checkout.tsx`** — delete `paymentDetails` state, all four card inputs, the "Test Payment" button, the "or test with simulated payment" divider, and `handleCompleteOrder`. Replace with a clean Stripe-only payment section.
3. **Add server-side price authority in `create-checkout-session`** — fetch products by id, rebuild `unit_amount` from DB, reject mismatches.
4. **Fix percent-discount cap** in the same edge function — branch to `amount_off` when `maximum_discount_cents` is set.
5. **Harden webhook env routing** — reject unknown `?env=`, add `stripe_webhook_events` dedupe table (migration).
6. **Add inventory/usage reservation** — small edge-function preflight query before session create.
7. **Add dispute & extra payment events** to webhook switch.
8. **Pass `userId` explicitly** from `useStripeCheckout` for guest→auth continuity.
9. **Queue confirmation emails** via new `email_queue` table + existing `process-abandoned-carts`-style cron pattern.

## Technical notes

- All edge function changes stay within `create-checkout-session` and `stripe-webhook` — no new functions needed except an optional `process-email-queue`.
- New tables: `stripe_webhook_events` (event_id, type, env, processed_at), optional `email_queue`, optional `reservations`. Each will ship with GRANTs + RLS per project standards.
- No changes to `_shared/stripe.ts` — it's correct.
- No changes to `getStripeEnvironment()` / token derivation — already fails loud per the latest hardening.
- Frontend visual style untouched (Silver Chrome / Forest Green / rounded-none / CAD).

Approve to switch to build mode and I'll ship #2, #1, #4, #6, and #7 in one pass (the highest-leverage P0/P1 cluster), then circle back for the rest.
