## Goal
Add `parker@veepo.ca` to the BCC list on every outbound email so Parker silently receives a copy of every send, alongside the existing `1.lineofjudah.1@gmail.com` recipient.

## Changes

For each send-site, set `bcc: ["1.lineofjudah.1@gmail.com", "parker@veepo.ca"]` (or add `parker@veepo.ca` to the existing array — never remove the gmail).

- `supabase/functions/send-order-confirmation/index.ts` — `INTERNAL_NOTIFY_RECIPIENTS` array (used as admin/internal copy).
- `supabase/functions/process-abandoned-carts/index.ts` — BCC array in Resend payload.
- `supabase/functions/process-review-requests/index.ts` — BCC array in Resend payload.
- `supabase/functions/process-worn-in-the-wild-invites/index.ts` — BCC array in Resend payload.
- `supabase/functions/send-refund-confirmation/index.ts` — BCC array in Resend payload.
- `supabase/functions/send-retry-payment-email/index.ts` — BCC array in Resend payload.
- `supabase/functions/test-all-emails/index.ts` — `BCC` constant.
- `supabase/functions/send-admin-alert/index.ts` — already sends TO Line of Judah; add `parker@veepo.ca` to `ADMIN_RECIPIENTS` so alerts also reach Parker.

Out of scope: `preview-order-emails` (one-off internal review tool, no customer BCC), Reply-To addresses, From: addresses, mailto links in template bodies. All visible/contact addresses stay `1.lineofjudah.1@gmail.com`; Parker is BCC only.

## Deploy
Redeploy the 8 touched edge functions.

## Verify
`rg "bcc:" supabase/functions` — every array should contain both addresses.
