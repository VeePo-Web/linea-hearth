

# Fix 3: Dashboard Low Stock Links, Category Product Counts, Shipping Address Fallbacks, Discount Dollar Input

Four targeted fixes for the remaining admin friction points. All frontend-only, no database changes.

---

## Fix 3A: Low Stock Items Link to Product Edit

**File:** `src/pages/admin/AdminDashboard.tsx`

**Problem:** Low stock variants show product name and stock count but are not clickable. Admin sees "Heavenly Crewneck - M / 2 left" but can't navigate to restock it.

**Fix:**
- Update the `LowStockVariant` interface to include `product_id` via the joined product relation (change `product: { name: string } | null` to `product: { name: string; id: string } | null`)
- Update the query on line 79 to select `product:products(name, id)` instead of `product:products(name)`
- Wrap each low stock item (lines 331-341) in a `Link` to `/ops-portal/products/${v.product?.id}/edit`
- Add hover styling to match the recent orders pattern

---

## Fix 3B: Category Product Counts

**File:** `src/pages/admin/AdminCategories.tsx`

**Problem:** Admin can't see how many products belong to each category, making it risky to delete a category that may have products assigned.

**Fix:**
- Update the `Category` interface to include `products: { id: string }[]`
- Change the fetch query from `.select('*')` to `.select('*, products(id)')` -- this joins the products table and returns an array of product IDs per category
- Add a "Products" column to the table header (between Slug and Description)
- Display the count: `{category.products?.length || 0}` in that column
- Update `colSpan` values for loading/empty states from 4 to 5

---

## Fix 3C: Shipping Address Field Fallbacks

**File:** `src/pages/admin/AdminOrderDetail.tsx`

**Problem:** The shipping address display (lines 254-258) only checks `shipping.line1`, `shipping.line2`, etc. But depending on whether the order came from the checkout form or Stripe webhook, the field names may differ (`address_line_1` vs `line1`, `zip` vs `postal_code`).

**Fix:**
- Create a helper that checks multiple field name variants:
  ```
  const addr = (obj, ...keys) => keys.map(k => obj[k]).find(v => v);
  ```
- Replace hardcoded field access with fallback lookups:
  - `line1` -> also check `address_line_1`
  - `line2` -> also check `address_line_2`
  - `postal_code` -> also check `zip`, `zipcode`
  - `state` -> also check `province`, `region`
- This ensures addresses display correctly regardless of which system stored them

---

## Fix 3D: Discount Fixed Amount -- Dollars Instead of Cents

**File:** `src/pages/admin/AdminDiscounts.tsx`

**Problem:** When creating a fixed-amount discount, the label says "Value (cents)" (line 294). Admin must mentally convert dollars to cents (e.g., type "500" for a $5 discount). This is confusing and error-prone.

**Fix:**
- Change the label from "Value (cents)" to "Value ($)" when type is "fixed"
- On save: multiply the entered dollar value by 100 to store as cents in the database
- On edit/load: divide the stored cents value by 100 to display as dollars in the form
- Same pattern for "Min Order" and "Max Discount" fields -- change labels to dollars and convert on save/load
- The `formatValue` display function (line 172) already divides by 100 for display, so the table view is already correct

**Implementation detail:**
- In `openEdit`: when loading a fixed discount, convert cents fields to dollars for form display
- In `handleSave`: when saving, convert dollar fields back to cents for database storage
- For percentage discounts: no conversion needed (values stay as-is)

---

## Risk Assessment

- **Low risk**: All changes are UI/display logic only
- **No database changes**: Just query adjustments and field mapping
- **No new dependencies**: Uses existing components and patterns
- **Backward compatible**: Address fallbacks handle both old and new field formats

## Files Changed

1. `src/pages/admin/AdminDashboard.tsx` -- low stock links + product_id in query
2. `src/pages/admin/AdminCategories.tsx` -- product count column
3. `src/pages/admin/AdminOrderDetail.tsx` -- shipping address field fallbacks
4. `src/pages/admin/AdminDiscounts.tsx` -- dollar input for fixed amounts

