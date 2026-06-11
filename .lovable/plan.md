# Admin Financials Dashboard

A Stripe-style financials view inside the ops portal. Pure read-only aggregation from the existing `orders` table — no Stripe API calls needed (Stripe webhooks already populate `stripe_payment_intent_id`, `stripe_customer_id`, totals breakdown, etc.).

## What we have

`orders` table already stores everything needed: `total_cents`, `subtotal_cents`, `shipping_cents`, `discount_cents`, `tax_cents`, `currency`, `payment_status`, `created_at`, `stripe_payment_intent_id`, `stripe_customer_id`, customer name/email.

## Plan

### 1. New page `src/pages/admin/AdminFinancials.tsx` → route `/ops-portal/financials`

Stripe-dashboard inspired layout, sharp-edged (rounded-none), forest/chrome palette:

**Header row**
- Title: "Financials" + subtitle "Revenue from Stripe-settled orders"
- Time-range tabs: 7D · 30D · 90D · 12M · All (default 30D)
- Export CSV button (filtered transactions)

**KPI grid (4 cards)**
- Gross Volume (sum of `total_cents` for `payment_status = 'paid'`)
- Net Volume (gross − refunds; today refunds aren't tracked yet, so initially same as gross with a "refunds: $0" sub-line)
- Successful Payments (count)
- Average Order Value
- Each card shows current period value + delta vs previous equal period (e.g. "+18.4% vs prior 30 days")

**Revenue trend chart**
- Daily bar/area chart of gross volume across the selected range
- Use existing `recharts` (already in project)
- Hover tooltip: date + gross + count

**Breakdown row (2 cards side-by-side)**
- Revenue composition: stacked bars — Subtotal · Shipping · Tax · Discounts (negative)
- Top customers: top 5 by lifetime spend within range, name + email + total

**Transactions table**
- Columns: Date · Customer · Email · Amount · Status · Stripe PI (truncated, copy button) · View
- "View" links to existing `/ops-portal/orders/:orderId`
- Search by email or Stripe ID
- Status filter chips: All / paid / refunded / unpaid / failed
- Paginated 25/page

### 2. Wire-up
- Add lazy import + route in `src/App.tsx` (same `OpsPortalGate > ProtectedRoute requireAdmin` pattern)
- Add sidebar entry "Financials" with `DollarSign` icon in `src/components/admin/AdminLayout.tsx`
- Add a clickable "Gross Volume (30D)" card on `AdminDashboard.tsx` that links to `/ops-portal/financials`

## Out of scope
- Live Stripe API queries (data already mirrored to orders via webhook)
- Refund tracking UI (no refunds table yet)
- Payout / balance reporting
- Invoice / subscription views (no subscription products)
- No schema changes
