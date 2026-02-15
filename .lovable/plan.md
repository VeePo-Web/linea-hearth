

# Make "Swipe Right to Add to Cart" Unmistakably Clear

## Problem

The swipe-to-add mechanic works perfectly but users don't know it exists. Current discoverability cues are too subtle:

- The header instruction ("Swipe right to add · Left to skip") is `text-white/40` — nearly invisible
- The first-time hint on SwipeableLookCard only shows once, then hides permanently via localStorage
- Direction indicators only appear mid-drag — users need to already be swiping to see them
- The SwipeActions buttons (Skip / Add) have no text labels, just icons

## Changes (4 Files)

### 1. SwipeCard.tsx — Add persistent directional affordance on the first card

Add a subtle animated arrow + label at the bottom of the top card that pulses gently, showing users they can swipe right. This replaces the invisible-until-drag approach with an always-visible hint on the active card.

**What changes:**
- Add a bottom-center directional indicator below the product info: a right-pointing chevron with "Swipe right to add" text
- Uses a gentle horizontal oscillation animation (like the existing hint in SwipeableLookCard)
- Only shows on the top card (`isTop`) and only on the first card of the session (controlled by a new `isFirstCard` prop)
- Fades out after the user starts dragging (tied to the `x` motion value)
- Respects `prefers-reduced-motion`

### 2. SwipeLookbook.tsx — Make header instruction bolder and more prominent

**What changes:**
- Increase the instruction text from `text-white/40 text-sm` to `text-white/60 text-sm font-medium`
- Add left/right arrow icons flanking the text: `← Skip · Add →` with ShoppingBag icon
- Add a subtle entrance animation so it draws the eye when the drawer opens

### 3. SwipeActions.tsx — Add text labels under the Skip and Add buttons

The Tinder-style buttons currently have no text — just X and ShoppingBag icons. First-time users cannot tell what these buttons do.

**What changes:**
- Add a small `text-[10px] uppercase tracking-wider` label below each button: "SKIP" under the X button, "ADD" under the ShoppingBag button, "UNDO" under the RotateCcw button
- Labels use `text-white/40` to stay subtle but informative

### 4. SwipeableLookCard.tsx — Make the onboarding hint more persistent

The current hint shows once globally across all sessions. For a feature this novel, the hint should show on every new session until the user has successfully swiped at least once.

**What changes:**
- Change localStorage key check: instead of hiding forever after first dismissal, show the hint on every new look until the user has completed at least one swipe action (track via a `hasSwipedBefore` flag that persists after first successful swipe)
- Make the hint text slightly larger and add a right-arrow icon for stronger directional cueing

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/components/lookbook/SwipeCard.tsx` | Add persistent "swipe right" directional hint on first card | Primary discoverability fix |
| `src/components/lookbook/SwipeLookbook.tsx` | Bold up header instruction with arrow icons | Drawer-level clarity |
| `src/components/lookbook/SwipeActions.tsx` | Add text labels under action buttons | Button comprehension |
| `src/components/lookbook/SwipeableLookCard.tsx` | More persistent onboarding hint | Repeat-visit clarity |

## What Does NOT Change

- No new dependencies
- No layout or structural changes
- No data changes
- SwipeProgress, FitGuideSection, ShopTheLook, LookSection — untouched
- All motion respects `prefers-reduced-motion`
- All labels meet WCAG AA contrast requirements

