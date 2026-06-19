## Goal

Eliminate every remaining customer-facing "out of stock" affordance (struck-through size pills, dimmed color swatches, disabled add buttons, "Only X left" copy on non-sale items, etc.) across PLP, PDP, Quick View, search, lookbook, cart upsells. Print-on-demand items must always look fully available. Limited-stock gating stays in the code path but only activates for sale items (`product.is_on_sale === true`), which is the only legitimate scarcity case.

## Approach

Add a single source of truth: extend `useQuickAdd` to expose a derived `enforceStockLimits` boolean = `!!product.is_on_sale`. Pipe that flag (or call sites already know `is_on_sale`) into every UI that currently treats `stock === 0` as disabled. When `enforceStockLimits` is false, all sizes/colors render as selectable and every "out of stock" / "only N left" branch is skipped.

## Files to change

1. **`src/hooks/useQuickAdd.ts`**
   - Return `enforceStockLimits: !!product.is_on_sale`.
   - Keep `isOutOfStock: false` as today.

2. **`src/components/ui/InlineQuickSizePicker.tsx`**
   - Accept new prop `enforceStockLimits?: boolean` (default `false`).
   - Compute `isOutOfStock = enforceStockLimits && stock === 0`. Same for `isLowStock`.
   - Aria-label drops the " - Unavailable" suffix when not enforcing.

3. **`src/components/product/SizeSelector.tsx`**
   - Accept `enforceStockLimits?: boolean` (default `false`).
   - `getSizeState` returns `"available"` unless enforcing.
   - Skip the "Only N left" line (216-220) unless enforcing.

4. **`src/components/category/QuickViewModal.tsx`**
   - Use `quickAdd.enforceStockLimits`.
   - Size buttons (262): `isAvailable = !enforceStockLimits || stockForSize > 0`.
   - Color swatches (302): same treatment.
   - Quantity cap (360-361): drop `currentStock` cap when not enforcing (use a soft cap like 10).
   - Remove the "Only N left in stock" paragraph (369-373) unless enforcing.
   - `canAddToCart` should not require `currentStock > 0` for POD.

5. **`src/pages/ProductDetail.tsx`**
   - Add button (328): drop `quickAdd.isOutOfStock` from disabled (already always false, but remove for clarity). Pass `enforceStockLimits` into child size selector.

6. **`src/components/cart/ThresholdUpsellCard.tsx`** (lines 77-78, 197-198)
   - Treat `isOOS` as `false` for non-sale products. Easiest: read `product.is_on_sale` from the same data already on the card.

7. **`src/components/cart/MissingProductCard.tsx`** (lines 184-186, 315)
   - Same: only treat `stock === 0` as disabled when `product.is_on_sale`.

8. **`src/components/lookbook/SwipeCard.tsx` / `SwipeLookbook.tsx` / `ShopTheLook.tsx` / `LookbookProductCard.tsx` / `ProductCard.tsx`**
   - Pass `enforceStockLimits={product.is_on_sale}` (or `quickAdd.enforceStockLimits`) into the `InlineQuickSizePicker` they render.

## Not changing

- `useQuickAdd.ts` `isOutOfStock` field name (internal).
- `cartUtils.ts` code comment.
- Admin pages (internal stock tooling).
- Schema.org availability on PDP (already pinned to `InStock`).
- Sale-item scarcity copy ("Only N left", strike-through) — kept, but only fires when `is_on_sale === true`.

## Verification

- `rg -ni "out of stock|sold out|unavailable" src/components src/pages` returns no customer-facing copy outside sale-gated branches.
- Spot-check a POD product PDP, PLP card hover (InlineQuickSizePicker), Quick View, search quick add, lookbook swipe — every size pill is clickable, no strike-through, no "Only N left".
- Spot-check a sale product — limited-stock UI still appears as expected.
