# Payment Edge Case Audit & Hardening

Following the checkout/confirmation audit, this pass focuses on **money-handling edge cases** — the scenarios where Stripe behaves correctly but our app can still drop, double-charge, mis-credit, or mis-fulfill an order.

## Scope: 18 edge cases, grouped by risk

### A. Duplicate / double-charge risk (HIGH)
1. **Double-click "Pay"** — `create-checkout-session` called twice in <1s → two Stripe sessions, two charges if user completes both tabs.
2. **Browser back → re-submit** — user pays, hits back, resubmits cart.
3. **Webhook + reconcile race** — both flip same order to `paid` concurrently → duplicate confirmation email, duplicate inventory decrement, duplicate Printful submission.
4. **Stripe webhook retries** — Stripe re-delivers `checkout.session.completed` (network blip, 5xx). Without idempotency, email/fulfillment fires N times.
5. **Multiple `payment_intent.succeeded` events** — Stripe sends both `checkout.session.completed` AND `payment_intent.succeeded`; current handler may process both.

### B. Wrong amount / wrong order (HIGH)
6. **Cart mutated between session create and payment** — user opens checkout, changes cart in another tab, pays old amount.
7. **Discount code applied client-side only** — server doesn't re-validate `SUMMER2026` at session creation → user pays discounted, we ship full.
8. **Shipping tier mismatch** — client picks Express ($15), server computes Standard ($10) from cart weight/total.
9. **Free-shipping threshold gaming** — cart at $98, free-ship coupon stacked, edge-function math disagrees with cart math.
10. **Currency drift** — any line item still in USD/EUR after CAD migration.

### C. Payment lifecycle (MED)
11. **`payment_intent.payment_failed`** — card declined after session created. UI polls forever; order should flip to `payment_failed` and user prompted to retry with same session or new session.
12. **3DS / SCA challenge abandoned** — session stays `open`, intent stays `requires_action`. Should expire gracefully.
13. **Stripe session expires (24h)** — `checkout.session.expired` should mark order `cancelled` and release reserved inventory.
14. **Refund issued in Stripe Dashboard** — `charge.refunded` webhook should update order status and trigger refund email.
15. **Dispute / chargeback** — `charge.dispute.created` should flag order, notify ops.

### D. Fulfillment & post-purchase (MED)
16. **Confirmation email send fails** (Resend down) — order marked `paid` but customer never notified; no retry queue.
17. **Guest checkout email typo** — order paid, confirmation bounces, no way for customer to find order.
18. **Inventory oversell** — two buyers race for last unit; both Stripe-paid, only one shippable.

## Investigation deliverables

For each case I will:
- Read the relevant code path (edge function + DB writes).
- Document **current behavior** (what actually happens today).
- Mark **severity** (HIGH / MED / LOW) and **likelihood**.
- Specify the **fix** (code change, DB constraint, or webhook handler).

## Proposed remediation phases (after audit, separate approval)

**Phase 1 — Stop double-charges & duplicate fulfillment (HIGH)**
- Add `processed_webhook_events` table keyed by `stripe_event_id` for idempotency.
- Wrap order state transitions in a single SQL function (`mark_order_paid(session_id, source)`) that uses `UPDATE ... WHERE status != 'paid' RETURNING` so only one writer wins. Email + Printful trigger off the row that actually transitioned.
- Add idempotency key to `create-checkout-session` (hash of `user_id + cart_hash` within 60s window) to dedupe double-clicks.

**Phase 2 — Server-authoritative pricing (HIGH)**
- `create-checkout-session` recomputes: line totals, discount, shipping tier, free-ship threshold from DB product prices + shipping rules. Client-provided totals are ignored.
- Reject session creation if client total ≠ server total (log discrepancy).

**Phase 3 — Full lifecycle handlers (MED)**
- Add webhook handlers: `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`.
- New order statuses: `payment_failed`, `expired`, `refunded`, `disputed`.
- `CheckoutSuccess.tsx` recognizes `payment_failed` → "Card declined, try another" with retry CTA.

**Phase 4 — Post-purchase resilience (MED)**
- Confirmation email queued via DB row (`email_outbox`) + cron retry, not fire-and-forget from webhook.
- Bounce webhook from Resend marks order `email_bounced`, surfaces in ops portal.
- Inventory: reserve on session create (15-min hold), commit on `paid`, release on `expired/failed`.

## Files I'd touch (Phases 1–4)

- `supabase/functions/stripe-webhook/index.ts` (new event types + idempotency)
- `supabase/functions/create-checkout-session/index.ts` (server-authoritative totals, idempotency key)
- `supabase/functions/reconcile-session/index.ts` (call shared `mark_order_paid`)
- `supabase/functions/send-order-confirmation/index.ts` (read from outbox)
- New migration: `processed_webhook_events`, `email_outbox`, `mark_order_paid()` SQL function, new order statuses, inventory reserve columns
- `src/pages/CheckoutSuccess.tsx` (recognize `payment_failed`/`expired`)

## What I need from you

1. **Approve the audit** — I'll run through all 18 cases and report findings (read-only, no code changes).
2. After the report, you pick which phases to implement.

Or, if you want me to skip the formal report and **go straight to Phase 1 + 2** (the HIGH-severity fixes), say "do Phase 1+2 now."