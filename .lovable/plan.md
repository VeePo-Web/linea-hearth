## Goal

Send Parker (parker@veepo.ca) review copies of both order confirmation emails that get generated on a paid order:
1. The customer-facing "Your armor is on the way" email
2. The internal Line of Judah admin notification email

So he can review the design/copy in his own inbox.

## Approach

Add a tiny one-off edge function `preview-order-emails` that:
- Loads the most recent paid order (or an `orderId` passed in the body) plus its items.
- Renders both HTML templates using the existing builders in `send-order-confirmation` (extracted into `_shared/order-email-templates.ts` so we don't duplicate code).
- Sends both emails via Resend to `parker@veepo.ca` only, with subjects prefixed `[REVIEW — Customer Email]` and `[REVIEW — Admin Notification]` so they're obvious in the inbox.
- Returns `{ success, customerEmailId, adminEmailId }`.

Then invoke it once via `supabase--curl_edge_functions` so Parker gets both emails immediately. No client UI, no changes to live order flow.

## Files

- New: `supabase/functions/_shared/order-email-templates.ts` — exports `buildOrderConfirmationHtml`, `buildAdminNotificationHtml`, `formatCurrency`, types.
- Edit: `supabase/functions/send-order-confirmation/index.ts` — import from shared module instead of inlining (no behavior change).
- New: `supabase/functions/preview-order-emails/index.ts` — the review-send endpoint described above.
- Deploy both functions, then trigger once.

## Notes

- Live order data is used so Parker sees realistic rendering. No PII risk — he already receives the admin copy of every order.
- This is a one-shot tool; leaving the function deployed lets you re-trigger anytime by calling it again. No cron, no schedule.
