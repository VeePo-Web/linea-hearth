# One-click Quick Add for hats

## Problem
The `+` quick-add button on hat cards opens the size picker instead of adding straight to cart. Hats (and any other one-size item) shouldn't ask for a size — one tap should drop them in the bag.

Root cause in `src/hooks/useQuickAdd.ts`:
- All hat variants in the DB have `size = NULL`, so `availableSizes` falls back to the default `['S','M','L','XL']` list.
- With 4 "sizes" and no remembered size, `handleQuickAdd` opens the inline picker instead of adding.
- `addToCart` also bails to the picker if there's no size string.

## Fix (frontend only, scoped to `useQuickAdd`)

1. Introduce a `SIZELESS_CATEGORIES` constant: `['hats', 'accessories', 'headwear']`.
2. Derive `isSizeless = SIZELESS_CATEGORIES.includes(categorySlug)` (also true when every variant has `size === null` AND the category is not a known apparel category — belt-and-suspenders).
3. When `isSizeless` is true:
   - Override `availableSizes` to `[]` so size UI never renders.
   - In `addToCart`, skip the "no size → open picker" guard and add the item with `size: undefined`.
   - In `handleQuickAdd`, short-circuit straight to `addToCart({})` (no size, no picker, no size-quiz prompt).
   - Report `canOneTap: true` so the button label stays clean ("Add" / check on success).
4. Leave tees, hoodies, sweaters, long-sleeves untouched — they still get the picker/size-memory flow.

## Verification
- Open `/` and hit `+` on a hat card in Recently Viewed / featured → item should land in cart immediately, toast appears, no picker.
- Hit `+` on a tee/hoodie card → picker still appears (unchanged behavior).
- Confirm cart line shows the hat with no size label and correct image/price.

## Files touched
- `src/hooks/useQuickAdd.ts` (only)
