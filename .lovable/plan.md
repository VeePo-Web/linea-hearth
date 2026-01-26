

# Saved Items Badge Implementation

## Overview

Add a secondary badge to the cart icon in the header that displays "+X saved" when items exist in the Save For Later shelf. This creates a visual reminder and urgency signal that drives users back to complete their purchase.

---

## Current State

The cart button in `Navigation.tsx` (lines 231-259) currently:
- Shows a small count number centered inside the shopping bag icon
- Uses `itemCount` from `useCart` hook
- Has spring animations for the badge appearance

---

## Implementation Strategy

### Approach: Dual Badge System

Display the cart count centered in the bag (existing) plus a new secondary indicator for saved items positioned at the top-right corner—similar to how the favorites badge works.

**Visual Design (preserving locked aesthetic):**
```
    ┌─────────┐
    │   [2]   │  ← Cart count centered in bag
    │  ┌─┐    │
    │  │+3│◄──┼── Saved badge (amber, top-right)
    └──┴─┴────┘
```

The saved badge will:
- Only appear when `savedCount > 0`
- Use amber color (matching the "Your size" badges) to differentiate from cart
- Show "+X" format (e.g., "+3")
- Animate in/out with spring physics like the favorites badge

---

## File Changes

### Modified: `src/components/header/Navigation.tsx`

**Changes Required:**

1. **Import the hook** (line ~8):
```typescript
import { useSavedForLater } from '@/hooks/useSavedForLater';
```

2. **Destructure savedCount** (around line 28):
```typescript
const { savedCount } = useSavedForLater();
```

3. **Add secondary badge** inside the Cart button (after line 257):
```tsx
{/* Saved items indicator */}
<AnimatePresence>
  {savedCount > 0 && (
    <motion.span 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      exit={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }} 
      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[0.5rem] font-semibold rounded-full flex items-center justify-center pointer-events-none z-20"
    >
      +{savedCount > 9 ? '9+' : savedCount}
    </motion.span>
  )}
</AnimatePresence>
```

---

## Technical Details

### Badge Styling
- **Position**: `absolute -top-0.5 -right-0.5` (same as favorites badge)
- **Size**: `w-4 h-4` (16x16px, matching existing badges)
- **Color**: `bg-amber-500 text-white` (distinct from primary cart, signals "waiting")
- **Font**: `text-[0.5rem] font-semibold` (10px, same as cart count)
- **Shape**: `rounded-full` (circular pill)
- **Z-index**: `z-20` (above other elements)

### Animation
- Same spring animation as favorites badge for consistency
- `stiffness: 500, damping: 15` for snappy appearance
- Uses `AnimatePresence` for exit animation

### Format
- Shows "+3" format to indicate additive nature (items waiting to be added)
- Caps at "+9+" for double-digit counts to keep badge compact

---

## Interaction Flow

```text
┌─────────────────────────────────────────────────────────┐
│                  BADGE VISIBILITY                       │
├─────────────────────────────────────────────────────────┤
│ savedCount = 0:  No amber badge shown                   │
│ savedCount = 1:  Badge shows "+1"                       │
│ savedCount = 5:  Badge shows "+5"                       │
│ savedCount = 10: Badge shows "+9+"                      │
├─────────────────────────────────────────────────────────┤
│ When user clicks cart → drawer opens                    │
│ → SavedForLaterShelf visible at bottom                  │
│ → User can one-tap move items back to cart              │
│ → savedCount decreases → badge updates/disappears       │
└─────────────────────────────────────────────────────────┘
```

---

## Accessibility

- Badge is `pointer-events-none` (not clickable, just informational)
- Screen readers will announce cart count via existing aria-label
- The cart drawer itself provides full saved items context

---

## Performance

- `useSavedForLater` hook is already optimized with:
  - React Query caching for authenticated users
  - Memoized localStorage reads for guests
  - No additional API calls triggered by this badge

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/header/Navigation.tsx` | Import useSavedForLater, add amber badge next to cart icon |

---

## Acceptance Criteria

- [ ] Amber badge appears when savedCount > 0
- [ ] Badge shows "+X" format (e.g., "+3")
- [ ] Badge caps at "+9+" for 10+ items
- [ ] Badge animates in with spring physics
- [ ] Badge animates out when savedCount reaches 0
- [ ] Badge positioned top-right of cart icon
- [ ] No layout shift on badge appearance/disappearance
- [ ] Works for both guests (localStorage) and authenticated (database)

