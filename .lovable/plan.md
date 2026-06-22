## Goal

1. Add a read-only "Store Currency: CAD" indicator inside the ops portal so it's obvious the store runs in Canadian dollars (no other currency is selectable — matches the strict-CAD project rule).
2. Audit every admin-facing money render and append the `CAD` suffix so amounts read `$1,234.56 CAD` instead of a bare `$1,234.56`.

## What changes

### 1. New "Store Currency" card in admin (CAD-only indicator)

Add a small card to `src/pages/admin/AdminDashboard.tsx` (top of the page, alongside existing metrics) titled **Store Currency**. It shows:
- Big label: `CAD — Canadian Dollar`
- Sub-label: `All prices, checkouts, refunds and payouts are processed in CAD.`
- A disabled `<Select>` containing one option (`CAD`) so it visually reads as a setting but cannot be changed. Tooltip on hover: "Store currency is locked to CAD."

No backend write, no new table, no env var — purely a presentational indicator that codifies the project rule inside the admin UI.

### 2. Centralized admin money formatter

Create `src/lib/adminCurrency.ts`:

```ts
export const formatAdminMoney = (cents: number | null | undefined) => {
  const v = ((cents ?? 0) / 100).toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${v} CAD`;
};
```

### 3. Relabel every admin `$` render

Replace bare `$X.XX` strings with `formatAdminMoney(cents)` in:

- `src/pages/admin/AdminFinancials.tsx`
  - Replace local `fmt` with `formatAdminMoney`.
  - Chart Y-axis tickFormatter → `$${v} CAD` (compact form on small ticks if it overflows: keep `$${v}` on axis ticks, add `CAD` only in tooltips). 
  - Tooltip formatters → use `formatAdminMoney(v * 100)`.
  - Stat sub-line `Refunds: $0.00` → `Refunds: $0.00 CAD`.
- `src/pages/admin/AdminOrders.tsx`
  - Table total cell `${(order.total_cents / 100).toFixed(2)}` → `formatAdminMoney(order.total_cents)`.
- `src/pages/admin/AdminOrderDetail.tsx`
  - Item total, subtotal, discount (with `-` prefix preserved), shipping, tax, grand total → all via `formatAdminMoney`.
- Any other admin file found with bare `$` money output (e.g. `AdminDiscounts.tsx` minimum-order display, `AdminProducts.tsx` price column) → same treatment.

### 4. USD audit confirmation

Full repo grep already shows zero active USD pricing — all `usd` strings are inert lookup keys inside email symbol maps (`{ eur:"€", usd:"US$", cad:"$" }`) that are never selected because every order/checkout/email passes `currency: "cad"`. No code change needed there, but I will add a short code comment in `supabase/functions/preview-order-emails/index.ts`, `test-all-emails/index.ts`, and `send-order-confirmation/index.ts` noting the map keeps non-CAD symbols only as defensive fallbacks; CAD is the only active currency.

### Out of scope (won't touch)

- Stripe currency, checkout, shipping logic, emails, customer-facing prices — already CAD.
- Multi-currency switching (explicitly rejected per project rule).
- DB schema / new tables.
