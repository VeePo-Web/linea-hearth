
# Admin Dashboard and Portal -- Functional Improvements

## Current State

The admin portal has 5 pages: Dashboard, Orders, Products, Product Form, and Categories. All are functional but missing several practical features an operator would need day-to-day.

## What's Missing (Prioritized by Impact)

### 1. Revenue Stats on Dashboard
**Problem:** The dashboard shows product/category counts but zero financial data. An admin's first question is always "how much money did we make?"
**Fix:** Add a revenue card row: Today's Revenue, This Week, This Month, Total Revenue. Calculated from the `orders` table where `payment_status = 'paid'`.

### 2. Unfulfilled Orders Counter
**Problem:** No at-a-glance indicator of orders needing attention.
**Fix:** Add an "Needs Fulfillment" stat card showing count of orders where `payment_status = 'paid'` AND `fulfillment_status = 'unfulfilled'`. Make it clickable -- links to orders page pre-filtered.

### 3. Inline Stock Editing on Variants
**Problem:** To update stock on a variant, the admin must navigate to Products, find the product, click Edit, go to the Pricing tab, and then... there's no inline edit. Stock quantity is read-only in the variant table.
**Fix:** Make the stock quantity field editable inline in the VariantManager. On blur or Enter, save to database.

### 4. Order Fulfillment Status Badge on Dashboard Recent Orders
**Problem:** Recent orders on dashboard show payment status but not fulfillment status, which is the actionable info.
**Fix:** Show fulfillment badge alongside payment badge.

### 5. Refresh / Last Updated Indicator
**Problem:** Dashboard data is fetched once on mount with no way to refresh without a full page reload.
**Fix:** Add a "Refresh" button and a "Last updated X ago" timestamp.

### 6. Newsletter Subscriber Count on Dashboard
**Problem:** No visibility into marketing metrics.
**Fix:** Add subscriber count as a stat card or in a small "Marketing" section.

### 7. Ambassador Application Count
**Problem:** No way to see pending ambassador applications from the dashboard (or any admin page).
**Fix:** Show pending application count on dashboard. Link to a future management page or at minimum show count.

### 8. Empty State Guidance on Dashboard
**Problem:** When the store is new (like now with 2 products, 0 orders), the dashboard is mostly empty cards with "No orders yet" and dashes. Doesn't guide the admin on what to do next.
**Fix:** Show a "Getting Started" checklist when store has < 5 products and 0 orders: "Add your first product", "Set up categories", "Configure Stripe", etc.

### 9. Admin Login -- No "Forgot Password" Link
**Problem:** If the admin forgets their password, there's no recovery path on the login page.
**Fix:** Add a "Forgot password?" link that triggers `supabase.auth.resetPasswordForEmail`.

### 10. Discount Code Management (Missing Page)
**Problem:** Discount codes exist in the database but there's no admin UI to create/edit/view them. Currently requires direct database access.
**Fix:** Add a new admin page at `/ops-portal/discounts` for CRUD on `discount_codes` table.

---

## Implementation Plan

### Phase 1: Dashboard Enhancements (Low Risk, High Impact)

**File: `src/pages/admin/AdminDashboard.tsx`**
- Add revenue calculation queries (sum of `total_cents` from paid orders, grouped by day/week/month)
- Add unfulfilled order count query
- Add newsletter subscriber count query  
- Add ambassador application (pending) count query
- Add fulfillment badge to recent orders list
- Add refresh button with "last updated" timestamp
- Add getting-started checklist (conditional on low product/order counts)

**File: `src/components/admin/AdminLayout.tsx`**
- Add "Discounts" nav item to sidebar (icon: `Percent`)

### Phase 2: Variant Inline Editing (Medium Risk)

**File: `src/components/admin/VariantManager.tsx`**
- Make stock_quantity cells editable (click to edit, blur/Enter to save)
- Add optimistic update with rollback on error
- Debounced save to prevent rapid-fire API calls

### Phase 3: Admin Login Forgot Password

**File: `src/pages/admin/AdminLogin.tsx`**
- Add "Forgot password?" button below the form
- On click: prompt for email, call `supabase.auth.resetPasswordForEmail`
- Show success toast with "Check your email"

### Phase 4: Discount Code Management Page

**New file: `src/pages/admin/AdminDiscounts.tsx`**
- Table listing all discount codes with columns: Code, Name, Type, Value, Usage, Status, Expires
- Create/edit dialog with fields matching the `discount_codes` table schema
- Toggle active/inactive
- Show redemption count from `discount_code_redemptions`

**File: `src/App.tsx`**
- Add route: `/ops-portal/discounts` with ProtectedRoute wrapper

---

## Technical Details

### Revenue Query Approach
```sql
-- Total revenue from paid orders
SELECT COALESCE(SUM(total_cents), 0) as total
FROM orders
WHERE payment_status = 'paid'
```
Filtered by date ranges for today/week/month using `created_at >= date`.

### Getting Started Checklist Logic
Show when `totalProducts < 5` AND `totalOrders === 0`:
- "Add your first product" (link to /ops-portal/products/new)
- "Create product categories" (link to /ops-portal/categories)  
- "Upload product images" (contextual tip)

Dismiss permanently via localStorage key.

### Inline Stock Edit
- Replace static text with an Input on click
- `onBlur` or `onKeyDown Enter` triggers `supabase.from('product_variants').update({ stock_quantity }).eq('id', variantId)`
- Show toast on success/error
- Optimistic: update local state immediately, rollback on error

### No Database Changes Required
All features use existing tables. No migrations needed.

### No New Dependencies
All implementations use existing UI components (Card, Badge, Input, Button, Dialog, Table) and existing libraries (date-fns, lucide-react, supabase client).
