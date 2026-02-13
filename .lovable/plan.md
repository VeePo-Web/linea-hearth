
# Fix 4: Product Row Clickability, Variant Delete Confirmation, Dashboard Stat Cards as Links, Unsaved Changes Indicator

Four more targeted fixes to eliminate remaining admin friction. All frontend-only, no database changes.

---

## Fix 4A: Product List Rows Fully Clickable

**File:** `src/pages/admin/AdminProducts.tsx`

**Problem:** Product table rows (line 200) have no `onClick` handler. The only way to edit a product is the small pencil icon (line 229-232). This is inconsistent with the Orders page where entire rows are now clickable.

**Fix:**
- Add `onClick={() => navigate(...)}` to the `<TableRow>` on line 200
- Add `cursor-pointer hover:bg-secondary/50` class (matching orders pattern)
- Import and use `useNavigate`
- The delete button click must stop propagation so it doesn't trigger row navigation

---

## Fix 4B: Variant Delete Confirmation

**File:** `src/components/admin/VariantManager.tsx`

**Problem:** Line 272-279: The variant delete button directly calls `deleteVariant(v.id)` with no confirmation dialog. Accidentally deleting a variant loses its SKU, stock count, and price adjustment -- data that must be re-entered manually. Every other delete action in the admin portal (products, categories, discounts) has an AlertDialog confirmation.

**Fix:**
- Add `deleteConfirmId` state
- Change delete button to `setDeleteConfirmId(v.id)` instead of direct deletion
- Add an AlertDialog at the bottom (copy the pattern from AdminCategories)
- Show the variant details (size/color) in the confirmation message for clarity

---

## Fix 4C: Dashboard Stat Cards Link to Pages

**File:** `src/pages/admin/AdminDashboard.tsx`

**Problem:** The four stat cards (Total Products, Active, Categories, Featured) on lines 224-240 show counts but are not clickable. An admin seeing "3 Categories" should be able to click to go manage categories. The "Needs Fulfillment" card (line 244) is already a Link -- these should match.

**Fix:**
- Wrap each stat card in a `<Link>` to the appropriate admin page:
  - Total Products -> `/ops-portal/products`
  - Active -> `/ops-portal/products` (with active tab hint)
  - Categories -> `/ops-portal/categories`
  - Featured -> `/ops-portal/products` (with featured filter hint)
- Add `cursor-pointer hover:border-primary/50 transition-colors` to match the fulfillment card pattern

---

## Fix 4D: Unsaved Changes Dot on Order Detail

**File:** `src/pages/admin/AdminOrderDetail.tsx`

**Problem:** An admin can change the fulfillment status, add tracking info, or write notes, then accidentally navigate away via the sidebar or back button -- losing all changes silently. There is no visual indicator that changes exist.

**Fix:**
- Track whether any field has been modified from its loaded state using a simple `isDirty` computed boolean
- Compare current form values (fulfillmentStatus, trackingNumber, trackingUrl, notes) against the values loaded from `order`
- Show a small colored dot on the "Save Changes" button when dirty (non-blocking, no modal)
- This is a visual cue only -- no browser `beforeunload` prompt (those are annoying and often blocked)

---

## Summary of Changes

| File | Change | Risk |
|------|--------|------|
| `AdminProducts.tsx` | Add row onClick + navigate, stopPropagation on delete | Low |
| `VariantManager.tsx` | Add AlertDialog for variant delete | Low |
| `AdminDashboard.tsx` | Wrap stat cards in Links | Low |
| `AdminOrderDetail.tsx` | Add isDirty indicator on Save button | Low |

---

## Technical Details

### AdminProducts.tsx
- Import `useNavigate` (already imported via `Link` from react-router-dom, just need the hook)
- Wait -- `useNavigate` is not currently imported. Need to add it.
- Add to TableRow: `className="cursor-pointer hover:bg-secondary/50"` and `onClick={() => navigate(\`/ops-portal/products/${product.id}/edit\`)}`
- On the delete Button (line 234): add `onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}`

### VariantManager.tsx
- Import AlertDialog components from `@/components/ui/alert-dialog`
- Add state: `const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)`
- Change line 276 onClick from `deleteVariant(v.id)` to `setDeleteConfirmId(v.id)`
- Add AlertDialog component at end of return block

### AdminDashboard.tsx
- Update the `statCards` array to include a `href` property for each card
- Wrap each Card in a `<Link>` with hover styling
- Map: Total Products -> `/ops-portal/products`, Active -> `/ops-portal/products`, Categories -> `/ops-portal/categories`, Featured -> `/ops-portal/products`

### AdminOrderDetail.tsx
- Compute `isDirty` by comparing current state vs loaded order values:
  ```
  const isDirty = order && (
    fulfillmentStatus !== (order.fulfillment_status || 'unfulfilled') ||
    trackingNumber !== (order.tracking_number || '') ||
    trackingUrl !== (order.tracking_url || '') ||
    notes !== (order.notes || '')
  );
  ```
- On the Save button, add a small indicator dot when `isDirty` is true
- Change button text to show "Unsaved" state visually
