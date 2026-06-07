## Goal

All emails (order confirmations, retry/payment recovery, abandoned cart, refunds, review requests, worn-in-the-wild invites, admin alerts) are currently sending — or failing to send — from `@lineofjudah.com`. Your actual domain is `lineofjudah.clothing`. Resend is rejecting sends with a 403 because `lineofjudah.com` is not in your Resend account.

This plan fixes the from-addresses and support contacts to use the correct `.clothing` domain so Resend will accept them once you verify the domain there.

## Changes

### 1. Edge functions — swap `from:` addresses

Replace every `@lineofjudah.com` with `@lineofjudah.clothing` in:
- `supabase/functions/send-order-confirmation/index.ts` — `orders@`
- `supabase/functions/send-retry-payment-email/index.ts` — `orders@`
- `supabase/functions/send-refund-confirmation/index.ts` — `orders@`
- `supabase/functions/process-abandoned-carts/index.ts` — `noreply@`, `unsubscribe@`, `hello@`
- `supabase/functions/process-review-requests/index.ts` — same pattern
- `supabase/functions/process-worn-in-the-wild-invites/index.ts` — same pattern
- `supabase/functions/test-all-emails/index.ts` — `hello@` in HTML footers
- `supabase/functions/send-order-confirmation/index.ts` — `SITE_URL` fallback `https://lineofjudah.com` → `https://lineofjudah.clothing`

### 2. Frontend — support email mentions

- `src/pages/TermsOfService.tsx`
- `src/components/legal/LegalPageLayout.tsx`

Swap `hello@lineofjudah.com` → `hello@lineofjudah.clothing` (or whatever inbox alias you use — same change applies).

### 3. Redeploy affected edge functions

Deploy: `send-order-confirmation`, `send-retry-payment-email`, `send-refund-confirmation`, `process-abandoned-carts`, `process-review-requests`, `process-worn-in-the-wild-invites`, `test-all-emails`.

### 4. You verify the domain at Resend (one-time, manual)

After the code change, go to https://resend.com/domains and add `lineofjudah.clothing`. Resend will give you DNS records (SPF + DKIM, optionally DMARC) to add at your registrar. Once green, all the emails above start delivering.

## Out of scope

- No switch to Lovable Emails or change of email provider.
- No template/copy/design changes — only the domain string is touched.
- Inbox mailbox setup (receiving mail at `hello@lineofjudah.clothing`) is on you with your mail host; Resend only handles **sending**.

## Question for you

Which inbox alias do you want on the public-facing `mailto:` links — `hello@`, `support@`, `orders@`? Default is `hello@lineofjudah.clothing` (matches what's there today).
