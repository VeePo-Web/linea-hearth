## Goal

Every email address the customer or admin actually reads, replies to, or clicks on must be `1.lineofjudah.1@gmail.com`. Outbound `From:` stays on the verified `lineofjudah.clothing` domain so Resend keeps delivering.

## Changes

### Edge functions — templates & headers
Replace every `mailto:hello@lineofjudah.clothing`, `mailto:unsubscribe@lineofjudah.clothing`, and `parker@veepo.ca` recipient/reply-to with `1.lineofjudah.1@gmail.com`. Keep `from:` strings untouched.

- `supabase/functions/send-order-confirmation/index.ts` — BCC admin list (line 52) and customer-support `mailto:` (line 398) → Gmail.
- `supabase/functions/send-admin-alert/index.ts` — `ADMIN_REPLY_TO` and admin recipient list → Gmail.
- `supabase/functions/process-abandoned-carts/index.ts` — `List-Unsubscribe` mailto + footer `mailto:hello@` → Gmail.
- `supabase/functions/process-review-requests/index.ts` — `List-Unsubscribe` mailto → Gmail.
- `supabase/functions/process-worn-in-the-wild-invites/index.ts` — BCC `parker@veepo.ca` → Gmail (keep BCC to `1.lineofjudah.1@gmail.com`, dedupe).
- `supabase/functions/send-refund-confirmation/index.ts` — any contact `mailto:` → Gmail (audit pass).
- `supabase/functions/send-retry-payment-email/index.ts` — any contact `mailto:` → Gmail (audit pass).
- `supabase/functions/test-all-emails/index.ts` — `TEST_TO` and footer `mailto:hello@` → Gmail.
- `supabase/functions/preview-order-emails/index.ts` — `REVIEW_RECIPIENT` → Gmail.

### App UI
- `src/pages/admin/AdminOrderDetail.tsx` line 122 — toast copy: replace `parker@veepo.ca` with `1.lineofjudah.1@gmail.com`.
- Verify `src/config/brand.ts` `email.support/legal/press` already = Gmail (it is) — no change.

### Out of scope (explicitly NOT changed)
- `from:` addresses on Resend sends (`orders@`, `noreply@`, `alerts@lineofjudah.clothing`) — required for Resend deliverability.
- Social handles like `@lineofjudah` / `@lineofjudahwear` (Instagram/Twitter, not email).
- Placeholders like `you@email.com`, `your@email.com`, `you@company.com` (form hints, not real addresses).
- `guest@checkout.temp` internal sentinel.
- Domain string `lineofjudah.clothing` used in links/footers (it's the website domain).

### Deploy
Redeploy the touched edge functions after edits.

## Verification
Re-run the grep audit; only `from:` `@lineofjudah.clothing` constants, social handles, and form placeholders should remain.
