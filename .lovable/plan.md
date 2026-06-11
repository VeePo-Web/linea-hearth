# Verify Resend Is Actually Sending

`RESEND_API_KEY` is already configured as a secret, and you've verified `lineofjudah.clothing` in Resend. Nothing to add to the code — what's needed now is a live verification that emails are actually leaving and landing in both inboxes.

## Steps

1. **Find the most recent paid order** in the database to use as a test payload (read-only query, no data change).
2. **Invoke `send-order-confirmation`** against that order with `notifyAdminOnly: true`. This sends only the ops/Tapstitch email to `1.lineofjudah.1@gmail.com` and `parker@veepo.ca` — the customer is not re-emailed.
3. **Read the Edge Function logs** for `send-order-confirmation` and confirm we see an `admin ok order=… id=…` line (Resend message ID returned).
4. **Report results** back to you:
   - ✅ If logs show a Resend message ID → working. Check both inboxes (and spam) for the test email.
   - ❌ If logs show `admin FAILED` with a 4xx/5xx from Resend → I'll surface the exact error (most likely a remaining domain/DNS issue) and recommend the fix.
5. If there are no paid orders yet, I'll instead send a one-off test email directly through Resend from a temporary verification call to confirm the key+domain pair works end-to-end.

## Out of scope
- No code changes — the pipeline was already wired up last turn.
- No new secrets — `RESEND_API_KEY` is present.
- No customer-facing emails will be triggered (admin-only).
