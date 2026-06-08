## Add Internal BCC to All Customer-Facing Emails

Goal: Every automated email sent from `lineofjudah.clothing` via Resend silently copies both `parker@veepo.ca` AND `1.lineofjudah.1@gmail.com` so the team has a full record of every customer touchpoint.

### Current state
- ✅ `send-order-confirmation` — already sends a separate admin copy to both inboxes
- ❌ `send-refund-confirmation` — customer only
- ❌ `send-retry-payment-email` — customer only
- ❌ `process-abandoned-carts` (3 emails) — customer only
- ❌ `process-review-requests` — customer only
- ❌ `process-worn-in-the-wild-invites` — customer only
- ⚠️ `send-admin-alert` — sends only to parker, still uses unverified `onboarding@resend.dev` From, gmail recipient commented out

### Change: add `bcc` to every Resend call
For each customer-facing send above, add:
```ts
bcc: ['parker@veepo.ca', '1.lineofjudah.1@gmail.com'],
```
to the Resend `body` JSON alongside `from` / `to`. BCC keeps the customer email clean — they never see the internal addresses, but both inboxes get a perfect copy of what the customer received.

### Change: fix `send-admin-alert`
- Flip `ADMIN_FROM` from `onboarding@resend.dev` → `Line of Judah Alerts <alerts@lineofjudah.clothing>` (domain is now verified)
- Uncomment `1.lineofjudah.1@gmail.com` in `ADMIN_RECIPIENTS` so admin alerts go to both
- Remove the stale "re-enable once verified" comments

### Deploy
Redeploy the 6 touched edge functions:
`send-refund-confirmation`, `send-retry-payment-email`, `process-abandoned-carts`, `process-review-requests`, `process-worn-in-the-wild-invites`, `send-admin-alert`.

### Verification
- Grep confirms every Resend `fetch('https://api.resend.com/emails', …)` call in those 6 files now contains a `bcc` array with both addresses.
- Trigger `test-all-emails` after deploy → both inboxes receive copies of every template.
- No customer-visible change; To/From headers and rendered HTML are untouched.

### Out of scope
- Auth emails (Supabase magic links / password reset) — those go through Supabase Auth's own provider, not these Resend functions.
- The contact form (one-off, already routed to parker).
- The 3-recipient setup only applies to outbound automated mail. Customer inbound replies still land at the `reply_to` you already have configured.
