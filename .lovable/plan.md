
# Cart Drawer Design Cleanup: Editorial Polish Pass

## Objective

Make the cart drawer design "super clean" -- a surgical visual polish pass. Zero feature changes. Zero logic changes. Every hook, state machine, and interaction stays identical. Only the visual presentation gets refined to match the site's editorial aesthetic.

## What Changes

### 1. Remove Diamond (Gem) Icon from AffirmationStrip

**File: `src/components/cart/AffirmationStrip.tsx`**

The `Gem` icon from lucide-react is the diamond icon the user wants removed. The affirmation strip currently has a dark background bar with a gold diamond icon and italic text.

**Changes:**
- Remove the `Gem` import and icon element entirely
- Keep the strip and its text -- just cleaner without the decorative icon
- The text "Every piece is crafted with intention and purpose" remains, centered, with the same dark background and styling

### 2. Tighten CartDrawer Header Spacing

**File: `src/components/cart/CartDrawer.tsx`**

Minor spacing refinements for a cleaner look:
- Reduce header padding from `px-6 py-4` to `px-6 py-3` for a tighter, more editorial header
- Ensure the "Your Bag (X)" title and close button feel more intentionally spaced

### 3. Clean Up CartItem Presentation

**File: `src/components/cart/CartItem.tsx`**

- Tighten the "just added" highlight -- change from `animate-pulse bg-emerald-50/50` to a subtler left-border accent (`border-l-2 border-emerald-500`) instead of a pulsing background. More editorial, less "notification."
- This is purely a CSS class change on line 91

### 4. Refine TrustRow Spacing

**File: `src/components/cart/TrustRow.tsx`**

- Reduce vertical padding from `py-3` to `py-2.5` for a slightly tighter trust row
- This keeps the footer compact and clean

### 5. Clean Up FreeShippingBar

**File: `src/components/cart/FreeShippingBar.tsx`**

- Reduce outer padding from `px-6 py-4` to `px-6 py-3` for tighter fit
- Reduce margin below progress bar from `mb-3` to `mb-2`
- This makes the shipping bar feel more integrated rather than being a standalone section

### 6. Clean Up BundleProgress Card

**File: `src/components/cart/BundleProgress.tsx`**

- Change `rounded-lg` to `rounded-none` on the outer container (line 84) to match the site's sharp-edge editorial standard (`rounded-none` is the site-wide radius standard per the UI styling memory)
- Change inner `rounded-lg` on pulse effect (line 96) to `rounded-none` to match
- Change inner `rounded-lg` on celebration flash (line 115) to `rounded-none`

### 7. Clean Up MissingProductCard

**File: `src/components/cart/MissingProductCard.tsx`**

- Change outer container from `rounded-lg` to `rounded-none` (line 192) to match site standard
- Change thumbnail from `rounded` to `rounded-none` (line 195)
- Change size picker dropdown from `rounded-lg` to `rounded-none` and shadow from `shadow-lg` to `shadow-md` (line 311)

### 8. Clean Up ThresholdUpsellCard

**File: `src/components/cart/ThresholdUpsellCard.tsx`**

- Change compact size picker background from `rounded` to `rounded-none` (line 74)

### 9. Clean Up ContinueShopping MiniProductCard

**File: `src/components/cart/ContinueShopping.tsx`**

- Change the quick-add button from `rounded-full` to `rounded-none` (line 73) to match the site's editorial standard

---

## Summary of All Files Changed

| File | Change | Type |
|------|--------|------|
| `AffirmationStrip.tsx` | Remove Gem (diamond) icon | Icon removal |
| `CartDrawer.tsx` | Tighten header padding | Spacing |
| `CartItem.tsx` | Replace pulse highlight with subtle border accent | Visual refinement |
| `FreeShippingBar.tsx` | Tighten padding and margins | Spacing |
| `TrustRow.tsx` | Tighten vertical padding | Spacing |
| `BundleProgress.tsx` | `rounded-lg` to `rounded-none` (3 instances) | Radius consistency |
| `MissingProductCard.tsx` | `rounded-lg` to `rounded-none` (3 instances) | Radius consistency |
| `ThresholdUpsellCard.tsx` | `rounded` to `rounded-none` (1 instance) | Radius consistency |
| `ContinueShopping.tsx` | `rounded-full` to `rounded-none` (1 instance) | Radius consistency |

## What Does NOT Change

- All cart features (add, remove, save for later, bundles, upsells, email capture)
- All animations and micro-interactions
- All state management and hooks
- All accessibility labels and keyboard support
- All Framer Motion variants and transitions
- Free shipping bar milestones and celebrations
- Bundle discount engine and progress tracking
- Saved for Later shelf functionality
- Express checkout placement
- Continue Shopping / Recently Viewed section
- All haptic feedback patterns
