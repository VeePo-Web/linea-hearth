# Stripe deep audit, $1 test path, and failure alerts

## 1. Deep Stripe audit — could it be your own card?

Pull a full read-only picture from Stripe (via the connector gateway) before drawing conclusions:

- **Customer `cus_UdiSlOI9lBQnXO`** (parker@veepo.ca): list every `payment_intent` and `charge` ever attached — successes, failures, blocked. Check Radar outcome (`risk_level`, `risk_score`, `network_status`, `seller_message`) on each.
- **Pull this specific successful charge** for order FF614293: confirm `outcome.network_status == "approved_by_network"`, `risk_level`, `payment_method_details.card.checks` (cvc/postal/address), funding type (credit/debit/prepaid), country, and brand. This tells us if your card is being soft-flagged.
- **Search all Stripe Events** in live for `payment_intent.payment_failed` and `charge.failed` in the last 7 days — surface anything we never heard about because the webhook wasn't wired.
- **Cross-check `failed_orders`-equivalent**: pending/unpaid orders in our DB created in the last 7 days, joined to whatever Stripe knows about them.

Surfaced as a single report in chat: card brand/funding/country, success vs decline counts, risk scores, any Radar blocks, and any silent declines we missed. If your card is being flagged, you'll see it here. (Spoiler from earlier audit: the $40 charge was `succeeded`, so the only failure mode so far is **the webhook never reaching us**, not the card. But this audit confirms it definitively.)

## 2. $1 Heavenly Hat test (temporary)

- Find the Heavenly Hat product in `products` (and any variant rows that override base price). Snapshot current `price_cents` into a note in `.lovable/heavenly-hat-original-price.md` so we can revert with one command.
- `UPDATE` price to `100` cents on the product and every variant (compare-at price left alone).
- Verify on the storefront PLP/PDP that it shows $1.00.

## 3. Failure-purchase alert emails

### Trigger points (inside `supabase/functions/stripe-webhook/index.ts`)
Add admin alerts on these existing event handlers:
- `payment_intent.payment_failed` → `handlePaymentFailed`
- `checkout.session.async_payment_failed` (currently only logs — add alert + mark order unpaid)
- `charge.dispute.created` → already updates DB, add alert
- `charge.refunded` → add alert (so you know when one fires)

### Mechanism
New shared helper `supabase/functions/_shared/admin-alert.ts` that POSTs to a new edge function `send-admin-alert` with `{ subject, html, context }`.

`send-admin-alert` edge function:
- Sends via **Resend** (existing `RESEND_API_KEY` is set).
- **From:** `Line of Judah Alerts <onboarding@resend.dev>` — guaranteed deliverable today even though `lineofjudah.clothing` isn't verified in Resend yet. Once you verify the domain, flip one constant to `alerts@lineofjudah.clothing` and redeploy.
- **To:** `parker@veepo.ca`, `1.lineofjudah.1@gmail.com` (both hardcoded as `ADMIN_ALERT_RECIPIENTS` constant — easy to edit later).
- **Reply-to:** same admin list.
- Subject format: `[LOJ Alert] Payment failed — order FF614293 — $40 CAD`.
- Body: editorial-stripped HTML — order id (linked to ops portal), customer email, amount, failure reason from Stripe (`last_payment_error.message` / decline_code), payment method type, timestamp, link to Stripe Dashboard event.
- Logged to `email_send_log` so failures are auditable.
- Idempotency key per Stripe event id so retries don't double-alert.

### Out of scope
- Not touching the customer-facing `send-order-confirmation` flow (still blocked on Resend verifying `lineofjudah.com`). Separate fix.
- Not building the new domain verification — admin alerts route around it.

## Technical notes
- Gateway used for Stripe reads: `https://connector-gateway.lovable.dev/stripe` with `X-Connection-Api-Key: $STRIPE_LIVE_API_KEY`.
- Resend used directly via existing `RESEND_API_KEY` secret (no connector needed — secret already exists).
- All work is server-side; no UI changes except the Heavenly Hat price reflecting through existing PDP/PLP queries.

## Out of scope
- Switching to Lovable's built-in email system.
- Fixing the customer-facing order confirmation email path (separate Resend domain verification task).
- Re-registering the Stripe webhook (still your action — covered last turn).
