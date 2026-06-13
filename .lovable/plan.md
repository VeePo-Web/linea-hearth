# Garment Style — Deferred Items Cleanup Plan

The critical and polish fixes from the audit are already shipped. This plan closes the four flagged "intentionally deferred" items so the feature is fully production-grade.

---

## 1. Style-aware color filtering on PDP

**Problem:** `ColorSwatchSelector` shows every admin-configured color, even when the current style has no variant in that color (e.g. Tee in Red but no Hoodie/Red).

**Fix:** In `src/components/product/ProductInfo.tsx`, derive a `colorsForActiveStyle` set from `product_variants` filtered by the selected `style`. Pass it to `ColorSwatchSelector` as a new optional `availableColorNames?: Set<string>` prop. The selector renders disabled (line-through + 40% opacity, sharp-edge consistent) swatches for colors not in the set, mirroring how out-of-stock sizes are handled.

Same treatment for sizes: filter `availableSizes` by `(style, color)` intersection. Already partially in place — make it consistent.

If `product_variants` for a product has no `style` values at all (legacy product), skip filtering entirely — backward compatible.

---

## 2. PLP "+N styles" chip on product cards

**Problem:** Style availability is invisible until the user opens the PDP.

**Fix:**
- Extend the product list query in `src/pages/Category.tsx` / wherever `ProductCard` data is fetched to include a `style_count` aggregate (single extra select via `product_styles(count)`).
- In `src/components/category/ProductCard.tsx`, when `style_count >= 2`, render a small chrome-hairline chip near the color dots: `+{n} styles` (uppercase, tracking-wider, matches existing editorial chip styling — no rounded corners, no color fill).
- Same chip in `QuickViewModal` header.

No new tables, no migrations.

---

## 3. Dedicated `order_items.variant_style` column

**Problem:** Style is currently appended to `product_name` ("Stay Holy — Hoodie"). Works for emails, but admin reporting/exports can't group by style.

**Fix (migration):**
- Add nullable `variant_style TEXT` to `public.order_items`.
- Backfill: leave existing rows null (historical orders pre-dated the feature).
- Update `supabase/functions/create-checkout-session/index.ts` order_items insert to write `variant_style` explicitly **and** stop concatenating style into `product_name` (revert to clean product name).
- Update `send-order-confirmation` Tapstitch block + admin order email to render a "Style" column alongside Color/Size when any item has `variant_style`.
- Update `src/pages/admin/AdminOrderDetail.tsx` and `src/pages/account/AccountOrderDetail.tsx` to show Style row when present.

No grant changes needed — column inherits table grants.

---

## 4. Remove `as never` casts

**Problem:** `useProductStyles.ts` and `StyleManager.tsx` use `as never` because `product_styles` wasn't yet in the regenerated `types.ts` when the feature shipped.

**Fix:** After the migration in item 3 is approved (which triggers a types regeneration), strip every `as never` cast from:
- `src/hooks/useProductStyles.ts` (4 occurrences)
- `src/components/admin/StyleManager.tsx` (5 occurrences)

Replace with proper typed table access: `supabase.from('product_styles')` will work natively.

---

## Execution order

1. Item 3 migration first (adds `variant_style`, triggers types refresh).
2. Items 1, 2, 4 in parallel after types are regenerated.

## Files touched

**Migration:** 1 new file (`order_items.variant_style`).

**Edge functions:** `create-checkout-session/index.ts`, `send-order-confirmation/index.ts`.

**Frontend:**
- `src/components/product/ProductInfo.tsx` (color/size filtering)
- `src/components/product/ColorSwatchSelector.tsx` (accept `availableColorNames` prop)
- `src/components/category/ProductCard.tsx` (+ styles chip)
- `src/components/category/QuickViewModal.tsx` (chip)
- `src/pages/Category.tsx` / product list query (style_count)
- `src/pages/admin/AdminOrderDetail.tsx`, `src/pages/account/AccountOrderDetail.tsx` (Style row)
- `src/hooks/useProductStyles.ts`, `src/components/admin/StyleManager.tsx` (drop `as never`)

## Out of scope

- Variant-matrix-driven style availability in cart (already enforced by stock checks).
- Style filtering in the global PLP filter sidebar (would require new filter UI — separate request).
