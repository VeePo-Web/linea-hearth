
# Fix: Main "Add to Bag" Button Not Working on PDP

## The Problem
The primary "Add to Bag" button on the Product Detail Page (PDP) does not add items to the cart. Clicking it does nothing. This is because the button in `ProductInfo.tsx` has no click handler connected to the cart system.

The mobile sticky "Add to Bag" button works correctly because it uses the `useQuickAdd` hook, but the main desktop/mobile button is disconnected.

## Root Cause
In `src/components/product/ProductInfo.tsx` (lines 451-465), the button renders with `disabled={!canAddToBag}` but has **no `onClick` handler**. The component never imports or calls `useCart().addItem()`.

## Fix Plan

### 1. Update `ProductInfo.tsx` to accept an `onAddToBag` callback

Add a new prop `onAddToBag` to `ProductInfoProps`:
```typescript
interface ProductInfoProps {
  // ...existing props
  onAddToBag?: (details: { size: string | null; color: string | null; quantity: number }) => void;
}
```

### 2. Wire the "Add to Bag" button's `onClick`

Both the reduced-motion and animated versions of the button (lines 258 and 451-464) need an `onClick` that calls `onAddToBag` with the selected size, color, and quantity.

### 3. Update `ProductDetail.tsx` to pass the handler

In `ProductDetail.tsx`, use the existing `useQuickAdd` hook (already instantiated on line 80) to create a handler that:
- Takes the size/color/quantity from ProductInfo
- Calls `quickAdd.addToCart({ size, color, quantity })`

This reuses the existing cart integration, size memory, toast notifications, and haptic feedback -- no duplicate logic.

### Files Changed
1. **`src/components/product/ProductInfo.tsx`** -- Add `onAddToBag` prop, wire onClick on both button instances
2. **`src/pages/ProductDetail.tsx`** -- Pass `onAddToBag` callback using `quickAdd.addToCart`

### What This Fixes
- Main "Add to Bag" button will add items to cart
- Cart drawer will auto-open after adding
- Size memory will be saved
- Toast notification will appear
- Haptic feedback on mobile
- All consistent with the existing quick-add system used everywhere else
