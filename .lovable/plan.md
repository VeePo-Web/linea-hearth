## Remove all "Out of Stock" copy

Brand is print-on-demand (Printful) — stock is never zero. `useQuickAdd` already hardcodes `isOutOfStock: false`. Remove every user-facing "Out of stock" string so it can never appear in the UI.

### Files / changes

1. **`src/components/category/QuickViewModal.tsx`**
   - Lines 375–377: delete the `currentStock === 0` red "Out of stock" paragraph.
   - Lines 388–394: simplify the button label branches — drop the `currentStock === 0 ? "Out of Stock"` branch; fall back to `"Select Options"`.

2. **`src/components/ui/InlineQuickSizePicker.tsx`**
   - Line 106: change aria-label fragment `' - Out of stock'` → `' - Unavailable'`.

3. **`src/components/product/SizeSelector.tsx`**
   - Line 187: change aria-label fragment `" - Out of stock"` → `" - Unavailable"`.

4. **`src/pages/ProductDetail.tsx`**
   - Line 148: force schema.org availability to `https://schema.org/InStock` (POD never OOS), removing the `OutOfStock` branch.

### Untouched (intentional)
- `src/lib/cartUtils.ts` line 33: code comment only, not rendered.
- `src/hooks/useQuickAdd.ts`: variable name `isOutOfStock`, value always `false`.
- Admin pages (`AdminDashboard`, `VariantManager`): internal low-stock tooling, not customer-facing.

### Verification
Re-run `rg -ni "out of stock|out-of-stock|sold out"` across `src/components/` and `src/pages/` — should return zero customer-facing matches (only `useQuickAdd.ts` variable + `cartUtils.ts` comment may remain).