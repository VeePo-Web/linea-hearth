# Audit: Green/Colored Buttons → White (Chrome)

## Findings

The design token `--primary` is already Silver Chrome white, so `variant="default"` buttons render white correctly. **All remaining green comes from hardcoded classes** (`bg-green-*`, `bg-emerald-*`, `bg-[#4CAF50]`, `text-green-*`) — bypassing the design system.

Grouped by surface so you can opt in/out per group.

### A. Customer-facing buttons (recommend → white/chrome)

1. **`src/components/lookbook/SwipeableLookCard.tsx`** (lines 127, 154, 212) — Green "Added!" toast + swipe overlay + white "View Cart" button with green text. Swap green fills to chrome/dark-glass, change `text-green-700` → `text-primary-foreground`.
2. **`src/components/lookbook/SwipeCard.tsx`** (lines 243, 259) — Green "Add" indicator pills on swipe. Swap to chrome/foreground.
3. **`src/components/lookbook/SwipeActions.tsx`** (line 85) — Green "Add" action button. Swap to chrome.
4. **`src/components/lookbook/SwipeLookbook.tsx`** (line 154) — Green completion icon background. Swap to chrome/muted.
5. **`src/components/lookbook/SwipeProgress.tsx`** (lines 135, 147) — Green dot + label for added items. Swap to chrome.

### B. Status indicators (recommend → keep semantic, restyle to brand)

6. **`src/pages/account/AccountOrders.tsx`** (line 16) — `bg-green-100 text-green-800` order-status pill. Swap to neutral chrome + label-only, or use design tokens.
7. **`src/pages/account/AccountDashboard.tsx`** (line 38) — Same pattern.
8. **`src/pages/account/AccountOrderDetail.tsx`** (line 295) — `text-green-600` for discount row. Swap to `text-foreground` or `text-muted-foreground`.
9. **`src/components/try-on/QuickSizePresets.tsx`** (line 98) — Tiny green status dot. Swap to chrome.
10. **`src/components/try-on/utils/sizeRecommendation.ts`** (line 145) — "Perfect fit" green text. Swap to chrome/foreground.
11. **`src/components/faq/AskUsModal.tsx`** (lines 66–67) — Green success check after submission. Swap to chrome/foreground.

### C. Intentional brand green — LEAVE AS-IS (confirm)

- **`src/pages/WornInTheWildUpload.tsx`** + **`WornInTheWildGallery.tsx`** + **`admin/AdminWornInTheWild.tsx`** — "Worn in the Wild" is a campaign surface that uses `#4CAF50` (Classic Forest Green) as its signature accent per the brand color memory. Touching this rewrites the campaign identity.
- **All `src/pages/admin/**` admin badges** (`bg-green-600` for Active/Paid/Fulfilled) — internal ops portal, not customer-facing. Semantic status colors are useful here.

## Implementation notes

- Replace `bg-green-*` / `bg-emerald-*` / `bg-[#4CAF50]` on customer surfaces with `bg-primary text-primary-foreground` (chrome white) or `bg-foreground text-background` for dark variants.
- Replace `text-green-*` with `text-foreground` (or `text-muted-foreground` for secondary).
- Keep sharp edges (`rounded-none`) per Core memory.
- No new design tokens needed.

## Questions

- Confirm group **C (Worn in the Wild brand green)** stays untouched, or do you want it converted too?
- For group **B**, do you want order-status pills to be pure chrome (loses at-a-glance semantic differentiation), or use neutral grayscale tiers (e.g. dim chrome for pending, full chrome for delivered)?
