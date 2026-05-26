## Checkout & Payments Audit — Status + Reusable Audit Prompt

### Part 1 — Where you actually stand right now

**Wired and working (sandbox / test mode):**
- ✅ `create-checkout-session` edge function — builds Stripe Embedded Checkout session via gateway (`createStripeClient`), CAD line items, GST 5% tax rate, $99 free-shipping threshold, customer resolve by `userId`/email, draft order pre-written to DB, `orderId` stamped to session metadata.
- ✅ `stripe-webhook` edge function — verifies signature, handles `checkout.session.completed`, `async_payment_succeeded`, `charge.refunded`; updates order status, decrements stock, triggers confirmation email. Idempotent (skips already-paid).
- ✅ DB tables present: `orders`, `order_items`, `product_variants`, `discount_codes`, `abandoned_carts`.
- ✅ Server-side discount validation (`validate-discount-code`).
- ✅ Abandoned cart sync + recovery emails wired.
- ✅ Order confirmation email function wired.
- ✅ `verify_jwt = false` correctly set on all payment functions in `config.toml`.
- ✅ Sandbox publishable key present in `.env.development` (`pk_test_…`).
- ✅ Test mode banner component exists.

**🚫 Blocker — you cannot accept real money yet:**
Go-live status: **stuck at step 1 of 5** (`claim_account: in_progress`). That means:
- No `STRIPE_LIVE_API_KEY` exists in secrets (confirmed — only `STRIPE_SANDBOX_API_KEY` is present).
- No `PAYMENTS_LIVE_WEBHOOK_SECRET`.
- No `pk_live_…` token in `.env.production`.
- Live Stripe account has not been claimed, KYC/business verification not submitted, Lovable app not installed on live, live readiness check not run.

**Short answer:** test checkout works end-to-end. **Real payments do not work yet** — you need to finish the 5-step go-live flow in the Payments tab before a single real card can be charged.

<presentation-actions><presentation-open-payments>Go to payments</presentation-open-payments></presentation-actions>

---

### Part 2 — The reusable audit prompt (paste this back to me anytime)

Save this. Whenever you want a fresh pass, paste it verbatim:

```text
ROLE: You are a senior payments/checkout engineer auditing a Lovable + Stripe
(Embedded Checkout) commerce stack. Be ruthless. No flattery. No "looks good."
Every claim must cite a file path or a tool output.

SCOPE — audit the following surfaces and produce a PASS / WARN / FAIL verdict
on each, with the exact file + line evidence and the smallest fix:

A. CLIENT CHECKOUT (src/pages/Checkout.tsx, src/hooks/useStripeCheckout.ts,
   src/components/checkout/StripeEmbeddedCheckout.tsx, src/lib/stripe.ts)
   1. Required-field validation before initiateCheckout (email regex, name,
      address completeness, postal code format per country).
   2. Cart -> Stripe line item mapping integrity (price in CAD cents, image
      absolute URL, variant size/color in product metadata, productId/variantId
      preserved).
   3. Free-shipping threshold parity client <-> server ($99 CAD, standard only).
   4. Discount code: server-validated only? Never trust client discount amount.
   5. Embedded checkout lifecycle: no remount on rerender (stable
      clientSecret), proper unmount on cancel, return_url uses
      {CHECKOUT_SESSION_ID} literal.
   6. Error UX: stripeError surfaced, cart preserved on cancel, "cancelled=true"
      handled, retry path obvious.
   7. Empty cart guard, double-submit guard (isProcessing latch).
   8. Test-mode banner rendered on every checkout-adjacent route.

B. EDGE FUNCTION: create-checkout-session
   1. Uses createStripeClient from _shared/stripe.ts (NEVER raw Stripe SDK with
      env keys — these are gateway connection ids, not secrets).
   2. CORS preflight + headers on every response (including 4xx/5xx).
   3. verify_jwt = false in supabase/config.toml.
   4. Input validation: items non-empty, customerEmail format, shippingAddress
      complete, shippingMethod enum, amounts coerced server-side from DB (not
      trusted from client) — FLAG if unit prices come from req.body.
   5. Customer resolution: resolveOrCreateCustomer with metadata.userId
      searchable via stripe.customers.search.
   6. Draft order written BEFORE session.create; orderId in session metadata
      AND payment_intent_data.metadata.
   7. Tax: GST tax rate cached, applied to line items AND shipping.
   8. Idempotency: if user reloads and re-submits, do we create duplicate
      orders + Stripe sessions? Flag.
   9. Inventory check: do we validate variant stock BEFORE creating the
      session? Currently we only decrement post-payment — flag overselling
      risk.
   10. Discount application: server fetches discount_codes row by id, applies
       to Stripe via coupon/discount or recomputed line_items. Flag if
       discount is only client-side cosmetic.

C. EDGE FUNCTION: stripe-webhook
   1. Signature verification via verifyWebhook (HMAC-SHA256, 5-min freshness).
   2. Correct env routing via ?env=sandbox|live query param.
   3. Idempotent on checkout.session.completed (skip if already paid). PASS.
   4. Handles: checkout.session.completed, async_payment_succeeded,
      checkout.session.expired (cart unlock?), charge.refunded,
      charge.dispute.created, payment_intent.payment_failed.
   5. Stock decrement is atomic / race-safe (current impl: read-modify-write,
      flag as race condition under concurrent orders).
   6. Confirmation email fire-and-forget — if it fails, is the order still
      marked paid? Confirm no email-failure can block order finalization.
   7. Returns 200 fast (<5s) to avoid Stripe retries.

D. DATABASE (orders, order_items, product_variants, discount_codes,
   abandoned_carts, profiles, user_roles)
   1. RLS enabled on every table. List any without.
   2. orders RLS: user can SELECT own orders only; INSERT must be service-role
      only (the client must NEVER write to orders directly).
   3. order_items RLS mirrors orders.
   4. discount_codes: SELECT public OK for code lookup? Or service-role only
      via edge function? Flag if usage_count/max_uses can be tampered.
   5. product_variants.stock_quantity: who can UPDATE? Must be admin/service
      only.
   6. Index coverage: orders(stripe_checkout_session_id),
      orders(stripe_payment_intent_id), order_items(order_id),
      product_variants(product_id).
   7. abandoned_carts: PII exposure — emails accessible by anon? Flag.

E. SECRETS & CONFIG
   1. STRIPE_SANDBOX_API_KEY, PAYMENTS_SANDBOX_WEBHOOK_SECRET,
      SUPABASE_SERVICE_ROLE_KEY, LOVABLE_API_KEY present.
   2. .env.development has pk_test_, .env.production has pk_live_ (or flag).
   3. No real Stripe secret keys in repo or env vars (gateway-only).

F. GO-LIVE READINESS (call payments--get_go_live_status)
   Report current step, what user must do next, and the linkout markup:
   <presentation-actions><presentation-open-payments>Go to payments
   </presentation-open-payments></presentation-actions>

G. COMPLIANCE & TAX
   1. Apparel = tangible goods. Confirm if Stripe Tax / managed_payments is
      enabled or if we're hand-rolling GST 5%. We currently hand-roll — flag
      that PST/HST/QST are NOT collected for non-AB Canadian buyers, and US
      sales tax is not collected at all. Recommend managed_payments or
      automatic_tax once go-live completes.
   2. Shipping address allowed_countries = [CA, US]. Confirm matches business
      intent.
   3. Refund policy + dispute handling: who handles chargebacks today?

H. OBSERVABILITY
   1. Edge function logs reviewed (last 24h) — list any errors.
   2. Webhook delivery success rate in Stripe dashboard.
   3. Orders stuck in "pending" > 1h (abandoned-session cleanup job?).

DELIVERABLE FORMAT:
- A single table: surface | check | verdict | evidence | fix
- Then a "BLOCKERS TO FIRST REAL SALE" bullet list, ordered by severity.
- Then a "POST-GO-LIVE HARDENING" list (race conditions, tax, idempotency).
- End with one sentence: "Ready to sell? YES / NO — because <reason>."

CONSTRAINTS:
- Cite file paths or psql output for every claim.
- No speculation. If you can't verify, say "UNVERIFIED — check X".
- Don't propose new features. Only audit what exists.
```

---

### What I'd do if you say go

1. Run that audit prompt against the repo and return the verdict table.
2. Walk you through the 5-step Stripe go-live flow in the Payments tab.
3. After live keys provision, harden the two highest-risk items I already see without a full audit: **(a)** pre-session stock check to prevent overselling, **(b)** decide on `managed_payments` vs current hand-rolled GST so tax is correct for all buyer provinces/states.