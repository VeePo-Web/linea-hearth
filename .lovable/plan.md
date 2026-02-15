

# Mobile Swipe UX -- "Get Out of the Way" Refinement Pass

## Current State

The swipe-to-add system is fully functional with all discoverability cues in place:
- Animated "Swipe right to add" hint on the look card image (SwipeableLookCard)
- "Skip / Add" header instruction with arrow icons in the swipe drawer (SwipeLookbook)
- Text labels under action buttons: SKIP, ADD, UNDO (SwipeActions)
- Animated "SWIPE RIGHT TO ADD" hint on the first product card (SwipeCard)
- Direction indicators appear mid-drag (both SwipeCard and SwipeableLookCard)

## Problem: Too Many Hints Stacking

The discoverability improvements are now layered so heavily that they compete with each other and clutter the experience. A world-class mobile UX teaches the gesture once, then gets out of the way. Right now a first-time user sees:

1. "Swipe right to add" on the **look image itself** (SwipeableLookCard hint)
2. Opens drawer -> "Skip / Add" header instruction (SwipeLookbook)
3. "SWIPE RIGHT TO ADD >" animated overlay on the product card (SwipeCard isFirstCard)
4. SKIP / ADD / UNDO labels under buttons (SwipeActions)

That's **four separate instructional elements** visible simultaneously in some states. The drawer alone has three of them at the same time (items 2, 3, and 4).

## Design Principle

032c / DAZED editorial confidence: **teach once, trust the user, then disappear**. The action buttons with labels are always present (they're functional controls, not hints). The header instruction is always visible (it's compact and structural). The animated card overlay and the look-card hint are redundant -- the card overlay alone is sufficient inside the drawer.

---

## Changes (3 Files)

### 1. SwipeCard.tsx -- Refine the first-card hint to auto-dismiss faster

The "SWIPE RIGHT TO ADD >" hint on the first card is the strongest teaching moment since it's directly on the product being swiped. Keep it, but make it:
- Auto-dismiss after 3 seconds (currently infinite loop animation)
- Use a single pulse animation instead of infinite oscillation -- one deliberate rightward sweep, then fade out
- This way it teaches the gesture once and disappears, letting the product image breathe

**Changes:**
- Wrap the hint in its own `AnimatePresence` with a `useState` timer that hides it after 3 seconds
- Change the `animate` from `repeat: Infinity` to `repeat: 1` (plays twice total then stops)
- Add `exit={{ opacity: 0 }}` for a clean fade-out
- The hint also fades when dragging starts (existing `hintOpacity` transform), which is correct

### 2. SwipeableLookCard.tsx -- Remove the look-image hint entirely

The "Swipe right to add" hint on the **look image** (in LookSection) is the weakest teaching cue because:
- It competes with the "SHOP THIS LOOK" button directly below it
- Users who tap "Shop This Look" will see the drawer hints, which are more contextually accurate
- Users who do swipe the look image will get the success overlay feedback
- Having a hint on the look AND inside the drawer is redundant

The `useLookSwipe` hook already tracks `showHint` via localStorage. The hint logic stays in the hook -- we just stop rendering it in the component. The direction indicators (Add Look / Skip) that appear mid-drag remain, since those are contextual feedback during the gesture.

**Changes:**
- Remove the `AnimatePresence` block for `showHint` (lines 144-168)
- Keep the `dismissHint` call inside `handleSwipeComplete` in `useLookSwipe.ts` so the localStorage flag still gets set when users swipe -- no hook changes needed

### 3. SwipeLookbook.tsx -- Simplify the header instruction

The "Skip / Add" text with arrow icons is functional, but the arrows create visual noise when the labeled buttons below already have arrows implied. Simplify to a single-line whisper that reads more like a tooltip than an instruction manual.

**Changes:**
- Simplify from `<ArrowLeft /> Skip · Add <ArrowRight />` to just `Swipe or tap below`
- Change from `text-white/60 text-sm font-medium` to `text-white/30 text-xs` -- it should be the quietest element, not competing with the product card
- Remove the `motion` wrapper (no entrance animation needed for such subtle text)
- This keeps structural context without visual noise

---

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/components/lookbook/SwipeCard.tsx` | Auto-dismiss first-card hint after 3s, limit animation to 2 cycles | Card image breathes sooner |
| `src/components/lookbook/SwipeableLookCard.tsx` | Remove look-image swipe hint overlay | Cleaner photography, no redundant instruction |
| `src/components/lookbook/SwipeLookbook.tsx` | Simplify header instruction to whisper-quiet text | Reduces visual noise in drawer |

## What Does NOT Change

- SwipeActions.tsx -- SKIP/ADD/UNDO labels stay (they're functional controls, not hints)
- SwipeProgress.tsx -- untouched
- LookSection.tsx -- untouched
- useLookSwipe.ts -- untouched (localStorage logic stays for future use)
- useSwipeSession.ts -- untouched
- No layout changes, no data changes, no new dependencies
- Direction indicators mid-drag (both SwipeCard and SwipeableLookCard) remain -- they're contextual feedback, not onboarding hints
- All motion continues to respect `prefers-reduced-motion`

