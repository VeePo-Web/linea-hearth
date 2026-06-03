# Test All Email Templates

Send every transactional/lifecycle email template the site uses to `parker@veepo.ca` for inbox QA. No changes to remixing, payments, or existing email logic.

## What gets sent (6 emails)

The site currently has 4 email-sending edge functions, with abandoned cart split into 3 stages — 6 distinct templates total:

1. **Order Confirmation** — from `send-order-confirmation`
2. **Worn in the Wild Invite** — from `process-worn-in-the-wild-invites`
3. **Abandoned Cart #1** (1h, gentle reminder) — from `process-abandoned-carts`
4. **Abandoned Cart #2** (24h, social proof) — from `process-abandoned-carts`
5. **Abandoned Cart #3** (72h, LOJ15 discount) — from `process-abandoned-carts`
6. **Review Request** (9 days post-delivery) — from `process-review-requests`

## Approach

Create a new edge function `test-all-emails` that:

- Imports the existing `RESEND_API_KEY` secret (already configured).
- Reuses the existing render/build template functions by extracting them into the existing functions' files or copying them inline into the test function (read-only — no logic changes to live functions).
- Feeds each template realistic mock data:
  - Mock order: 2 line items (Tee + Hoodie), CAD totals, shipping to a Toronto address, summer 2026 date.
  - Mock cart: 3 items at $89 CAD totaling above free-shipping ($99) threshold for variety.
  - Mock worn-in-the-wild invite: product name + hero image + signed upload URL placeholder.
  - Mock review request: 2 delivered items, signed review URL placeholder.
- Sends all 6 emails sequentially via Resend `POST /emails` with:
  - `to: parker@veepo.ca`
  - `from: Line of Judah <noreply@lineofjudah.com>` (matches production)
  - Subject prefixed with `[TEST]` so they're filterable in the inbox.
- Returns a JSON summary `{ sent: 6, failed: [], messageIds: [...] }`.

## How it's triggered

A single tool call to `supabase--curl_edge_functions` with `POST /test-all-emails` immediately after deployment. No UI, no DB changes, no cron — purely a developer test endpoint. Function deploys with `verify_jwt = false` so it can be called directly.

## What is NOT changing

- No edits to `send-order-confirmation`, `process-worn-in-the-wild-invites`, `process-abandoned-carts`, `process-review-requests`.
- No edits to Stripe, payments, webhooks, remix config.
- No new DB tables, secrets, or RLS policies.
- No edits to live email content / branding — templates render with the exact same HTML the customer would receive.

## Technical notes

- File: `supabase/functions/test-all-emails/index.ts`
- Uses fetch directly to `https://api.resend.com/emails` with `RESEND_API_KEY`.
- Skips the abandoned-cart unsubscribe-signing complexity by injecting a static placeholder URL — the goal is visual QA, not link functionality.
- After deploy, I'll invoke the endpoint once and report back which emails landed successfully and any Resend errors per template.
