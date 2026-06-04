# Order confirmation + internal admin notification

## Background

`send-order-confirmation` (Resend, called from `stripe-webhook` on `checkout.session.completed`) already sends a branded confirmation to the customer with their items, sizes/colors, totals, discount, shipping address, and ETA. That stays.

## Changes

### 1. Add an internal admin notification email

In `supabase/functions/send-order-confirmation/index.ts`, after the customer email is sent, send a **second** email containing the full order detail:

- **To:** `1.lineofjudah.1@gmail.com`, `parker@veepo.ca` (both as `to` recipients so each gets a normal inbox copy)
- **From:** `Line of Judah Orders <orders@lineofjudah.com>` (same verified sender already in use)
- **Reply-To:** `customer_email` (so replying goes straight to the buyer)
- **Subject:** `New order #ABC12345 — $XX.XX CAD — {First Last}`
- **Body (admin-focused, plain inline HTML, no marketing):**
  - Order #, placed-at timestamp, payment status
  - Customer: full name, email, phone
  - Shipping address (full lines)
  - Billing address if present and different
  - Line items table: image thumb, product name, size, color, SKU, qty, unit price, line total
  - Subtotal, discount + code, shipping method + cost, tax, **total**
  - Stripe Payment Intent + Checkout Session IDs (for ops lookup)
  - Internal notes / customer notes if present
  - Link to `/ops-portal/orders/{id}` (admin order detail)

Failure of the admin email must not fail the customer email — wrap it in its own try/catch and log only.

### 2. Make "send to Line of Judah" mean both inboxes everywhere

Apply the same dual-recipient rule to any other place where an email is sent **to** the Line of Judah inbox (internal notifications only — never to customer-facing emails). Audit and update if found:
- `supabase/functions/submit-worn-photo/index.ts`
- `supabase/functions/process-worn-in-the-wild-invites/index.ts`
- `supabase/functions/review-worn-submission/index.ts` (only admin-direction emails)
- `src/components/contact/ContactForm.tsx` flow if it triggers a notify email
- Ambassador application notify if one exists

Centralize the recipient list as a constant `INTERNAL_NOTIFY_RECIPIENTS = ["1.lineofjudah.1@gmail.com", "parker@veepo.ca"]` inside each function (no shared lib needed; keeps edge functions self-contained).

If no internal-notification email exists today for contact form or ambassador apps, do **not** add new ones in this pass — out of scope unless the user asks. Only modify existing ones.

### 3. No DB / no new env vars

Uses existing `RESEND_API_KEY`. No migration, no secret changes, no schema.

### 4. Out of scope

- Not changing the customer confirmation template (already complete with all their info).
- Not adding contact-form notifications or admin alerts where none currently exist.
- Not switching email providers.

---

## Quick confirm

I'm planning to **CC parker@veepo.ca on the existing internal-notification emails only** (admin alerts), not on customer-facing emails like order confirmations, shipping updates, abandoned cart, etc. Customer emails still go only to the customer. Sound right?
