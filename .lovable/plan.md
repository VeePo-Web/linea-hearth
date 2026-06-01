# Review Request Email — 9 Days Post-Delivery

Automated single email asking customers to leave a review, sent exactly 9 days after `orders.delivered_at`.

## Trigger logic

A new edge function `process-review-requests` runs every 6 hours via pg_cron. It selects orders where:
- `delivered_at IS NOT NULL`
- `delivered_at <= now() - interval '9 days'`
- `delivered_at >= now() - interval '30 days'` (don't backfill ancient orders)
- No prior review-request row exists in `marketing_email_log` for that order
- Customer email not in `marketing_suppressions`
- `status != 'cancelled' / 'refunded'`

For each match: send via Resend, log to `marketing_email_log`.

## Database

Migration adds:
- `review_request_sent_at TIMESTAMPTZ` on `orders` (idempotency + admin visibility)
- Index on `(delivered_at, review_request_sent_at)` for efficient cron scans
- Extend `marketing_email_log` usage: new `email_number = 4` convention reserved for review requests (no schema change needed — column is smallint)

## Edge function: `process-review-requests`

- Service-role Supabase client
- Query eligible orders + join `order_items` for product thumbnails (top 3)
- Render editorial email: Silver Chrome + Forest Green tokens, "How did your armor serve you?" headline, Exodus 28:2 footer line, single CTA → `/account/orders/{id}/review` (existing review flow or product page deep-link)
- Include `List-Unsubscribe` headers + HMAC unsubscribe token (reuses `MARKETING_UNSUBSCRIBE_SECRET`)
- Standard suppression check before send
- On success: `UPDATE orders SET review_request_sent_at = now()` + insert `marketing_email_log` row

## Cron

`pg_cron` job `process-review-requests-every-6h` invoking the edge function with anon key. Registered via `supabase--insert` (user-specific URL).

## Frontend

No new pages required — CTA links to existing product page with `?review=1` query param to auto-open the review modal on PDP. Small addition to `ProductDetail.tsx` to read the param and open the existing review composer.

## Files

- new migration: `orders.review_request_sent_at` + index
- new `supabase/functions/process-review-requests/index.ts`
- `supabase/config.toml`: register function (`verify_jwt = false`)
- `src/pages/ProductDetail.tsx`: auto-open review modal on `?review=1`
- pg_cron schedule via insert tool

## Out of scope

- Second reminder email (only 1 send per order, per request)
- SMS/push
- Review incentives / discount codes
- Changing existing review submission flow
