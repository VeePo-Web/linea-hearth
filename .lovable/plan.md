# Audit results

## ✅ Working

- **Heavenly Hat price**: confirmed `$1.00` in DB on product `39912e5b…`. Storefront will reflect immediately. Revert snapshot saved at `.lovable/heavenly-hat-original-price.md`.
- **Webhook alert wiring**: `stripe-webhook/index.ts` correctly calls `alertPaymentFailed` on both `payment_intent.payment_failed` and `checkout.session.async_payment_failed`, `alertRefund` on `charge.refunded`, and `alertDispute` on `charge.dispute.created`. Idempotency keyed off Stripe event id. Webhook dedupe table also gates retries.
- **Config**: `send-admin-alert` has `verify_jwt = false` and is gated internally by a SERVICE_ROLE_KEY check, so it can't be invoked anonymously.
- **Helper**: `sendAdminAlert` is fire-and-forget — it can't break the webhook handler if Resend is down.

## 🔴 Two bugs that will prevent delivery

### Bug 1 — Wrong Resend transport
`send-admin-alert/index.ts` posts to `https://connector-gateway.lovable.dev/resend` with `LOVABLE_API_KEY` + `X-Connection-Api-Key`. But this project has **no Resend connector linked** — every other function (`send-order-confirmation`, `process-abandoned-carts`, etc.) hits `https://api.resend.com/emails` directly with `RESEND_API_KEY` as Bearer. The gateway call will 401/404.

**Fix:** rewrite the Resend POST in `send-admin-alert` to match the rest of the codebase:
```
fetch("https://api.resend.com/emails", {
  headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  body: { from, to, reply_to, subject, html },
})
```

### Bug 2 — `onboarding@resend.dev` can only send to the account owner
Resend restricts the shared `onboarding@resend.dev` sender to the email address that owns the Resend account. Sending to **both** `parker@veepo.ca` and `1.lineofjudah.1@gmail.com` from this sender will be rejected by Resend with `403 You can only send testing emails to your own email address` for whichever recipient isn't the account owner.

This is the same root cause as the `process-abandoned-carts` log we already see:
```
Resend API error: lineofjudah.com domain is not verified
```

**Two ways to fix — pick one:**

- **(A) Domain verification (proper fix)** — verify `lineofjudah.clothing` (or a subdomain like `mail.lineofjudah.clothing`) in Resend, then switch `ADMIN_FROM` to `alerts@lineofjudah.clothing`. Unblocks customer confirmations too.
- **(B) Single-recipient fallback (immediate)** — temporarily set `ADMIN_RECIPIENTS = ["<resend-account-owner-email>"]` only, until domain verifies. Loses the dual-inbox guarantee but starts working today.

## 🧪 Validation plan after fixes

1. Curl `send-admin-alert` directly with a synthetic payload (service-role auth) and confirm a 200 + an email lands.
2. Use Stripe CLI / Dashboard to fire a test `payment_intent.payment_failed` against the live webhook (`?env=live`) and confirm an alert lands in both inboxes (if domain verified) or the owner inbox (if fallback).
3. Tail `supabase functions logs send-admin-alert` to confirm `email_send_log` rows go `pending → sent`.

## Questions before I proceed

1. **Resend transport fix** — go ahead and rewrite to direct `api.resend.com` (matches rest of codebase). Yes/no.
2. **Sender domain** — should I (A) walk you through verifying `lineofjudah.clothing` in Resend now, or (B) ship the single-recipient fallback first and verify later? Which email owns your Resend account?
3. After fixes, want me to actually fire the test alert (curl the function) so you see a real email land?

## Out of scope
- Customer-facing confirmation email path (still blocked on same domain verification — separate task).
- Re-registering the Stripe webhook endpoint.
