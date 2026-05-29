## Goal

The 3-email abandoned-cart recovery flow has all the code in place but nothing actually runs it, nothing sends real emails, and nothing prevents sending to people who already bought, already opted out, or whose cart is too old. This plan closes those three gaps.

## What already works (leave alone)

- `abandoned_carts` table with `email_1/2/3_sent_at`, `recovery_token`, `discount_code`, `status`
- `sync-abandoned-cart` edge function (captures cart from checkout email field)
- `process-abandoned-carts` edge function (3 emails at 1h / 24h / 72h; email 3 mints a 15% `LOJ15-XXXXXX` discount)
- `recover-cart` edge function + `/recover-cart` page that rehydrates the cart and clears existing items
- `useAbandonedCart` hook (sync + markConverted on success)

## What's missing — and the fix

### 1. Real email delivery via Resend

Replace the stubbed `sendEmail()` in `process-abandoned-carts` with a working Resend call. The function already has the fetch scaffold; it just needs `RESEND_API_KEY`. Add the secret request, then:

- Read `RESEND_API_KEY` from env (already wired)
- Set `from: 'Line of Judah <noreply@notify.lineofjudah.com>'` (matches the existing Email System memory's Stone/Amber transactional sender pattern)
- Add `headers: { 'List-Unsubscribe': '<{unsubscribeUrl}>, <mailto:unsubscribe@lineofjudah.com>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }` for Gmail/Yahoo bulk-sender compliance
- Log every send attempt to a new `marketing_email_log` table (see below) so we have an audit trail and can dedupe on retries

### 2. Suppression layer (standard set)

The current function happily emails anyone whose cart is >1h old. Add four checks before each send, in this order:

1. **Cart converted** — already implicit via status filter, keep
2. **Customer has any paid `orders` row created after the cart's `created_at`** — `select 1 from orders where customer_email = $1 and payment_status = 'paid' and created_at > $cart_created_at limit 1`. If a row exists, mark cart `status = 'converted_external'` and skip.
3. **Email on suppression list** — query new `marketing_suppressions` table (`email`, `reason`, `created_at`); if hit, mark cart `status = 'suppressed'` and skip.
4. **Cart older than 30 days** — already enforced inside `recover-cart` for the redemption side; mirror it here: skip + mark `status = 'expired'`.

New migration creates:

```text
public.marketing_suppressions
  email TEXT PRIMARY KEY
  reason TEXT NOT NULL          -- 'unsubscribe' | 'bounce' | 'complaint' | 'manual'
  created_at TIMESTAMPTZ
  -- GRANTs: service_role ALL; authenticated SELECT via has_role admin only
  -- RLS: admins read; service role writes

public.marketing_email_log
  id UUID PK
  cart_id UUID
  email TEXT
  email_number SMALLINT          -- 1, 2, or 3
  provider_message_id TEXT
  status TEXT                    -- 'sent' | 'failed' | 'skipped_suppression' | 'skipped_converted'
  error TEXT
  created_at TIMESTAMPTZ
  -- GRANTs: service_role ALL; authenticated SELECT via admin
```

### 3. Scheduler (pg_cron + pg_net)

No cron job exists. Schedule `process-abandoned-carts` to fire every 15 minutes. This will be inserted (not migrated) because it embeds the project URL and anon key:

```sql
select cron.schedule(
  'process-abandoned-carts-every-15min',
  '*/15 * * * *',
  $$
    select net.http_post(
      url := 'https://harckavibhmimndfvnyo.supabase.co/functions/v1/process-abandoned-carts',
      headers := '{"Content-Type":"application/json","apikey":"<anon>"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

15-min cadence is plenty for a 1h-granularity flow and keeps Resend costs predictable.

### 4. One-click unsubscribe

Add a tiny new `unsubscribe-marketing` edge function (`verify_jwt = false`, no auth) that:

- Accepts `GET /unsubscribe-marketing?token=<hmac>&email=<email>`
- Verifies an HMAC of `email` against `MARKETING_UNSUBSCRIBE_SECRET` (new secret)
- Upserts the email into `marketing_suppressions` with `reason = 'unsubscribe'`
- Returns a clean confirmation HTML page (Silver Chrome / Forest Green, `rounded-none`)

Every recovery email's footer gets:

```text
Don't want recovery reminders? Unsubscribe in one tap.
→ https://{site}/functions/v1/unsubscribe-marketing?token=...&email=...
```

This token is also used in the `List-Unsubscribe` header.

### 5. Stripe webhook hook for "converted externally"

When `stripe-webhook` marks an order paid, also flip any matching `abandoned_carts` rows for that email created within the last 72h to `status = 'converted'`. This stops sequence mid-flight when someone checks out without clicking the recovery link.

### 6. Deep-link rehydration polish

`/recover-cart` already wipes the cart, repopulates from the token, and shows the discount code. Two small additions:

- Persist `recoveryDiscountCode` to localStorage and auto-apply it on Checkout (same path the existing `SUMMER2026` flow uses)
- If status was `recovered` but user re-clicks the link, still allow rehydration (current code returns 400; relax that — return cart items, just don't re-mark)

## Technical Details

**Files touched**
- `supabase/migrations/<new>.sql` — `marketing_suppressions`, `marketing_email_log` tables + GRANTs + RLS
- `supabase/functions/process-abandoned-carts/index.ts` — real Resend send, suppression checks, log inserts, footer unsubscribe link, `from` address
- `supabase/functions/unsubscribe-marketing/index.ts` — NEW
- `supabase/functions/recover-cart/index.ts` — allow re-recover, return discount code unchanged
- `supabase/functions/stripe-webhook/index.ts` — flip matching abandoned_carts to `converted` on paid order
- `supabase/config.toml` — register `unsubscribe-marketing` with `verify_jwt = false`
- `src/pages/RecoverCart.tsx` — write discount code to localStorage
- `src/pages/Checkout.tsx` — read recovery discount from localStorage on mount and auto-apply
- DB insert tool — `cron.schedule` for the 15-min job

**Secrets requested** (via add_secret)
- `RESEND_API_KEY`
- `MARKETING_UNSUBSCRIBE_SECRET` (random 32-byte hex; used to sign unsubscribe tokens)

## Out of Scope

- Switching off Resend / migrating to Lovable Emails
- Editing email copy or template visual design (already approved)
- Bounce + complaint webhooks from Resend (would auto-populate `marketing_suppressions`) — can add later
- SMS recovery, push notifications, A/B testing different cadences
