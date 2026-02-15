

# Lookbook Final Polish Pass -- Design System Consistency + Remaining Violations

## Audit Summary

The Lookbook has gone through two major refinement passes and is structurally solid. The hero, layout variants, mobile content simplification, and scroll-fighting fixes are all in place. What remains are **design system violations** scattered across 4 files that break the sharp-edged editorial aesthetic, plus a few modal/drawer styling inconsistencies.

## Remaining Issues (Ranked by Impact)

### 1. SwipeCard.tsx -- 5 `rounded-full` violations + 1 `rounded-3xl`

The swipe card itself uses `rounded-3xl md:rounded-2xl` which is completely inconsistent with the zero-radius system. The position badge, size badge, skip indicator, and add indicator all use `rounded-full`.

**Changes:**
- Line 177: `rounded-3xl md:rounded-2xl` to `rounded-none`
- Line 205: Position badge `rounded-full` to sharp (remove rounded-full)
- Line 212: Size badge `rounded-full` to sharp (remove rounded-full)
- Line 222: Skip indicator `rounded-full` to sharp (remove rounded-full)
- Line 231: Add indicator `rounded-full` to sharp (remove rounded-full)

### 2. SwipeableLookCard.tsx -- 2 violations

- Line 211: Bundle discount badge `rounded-full` to sharp
- Line 264: Size picker buttons `rounded-lg` to `rounded-none` (these are grid buttons, not circular dots)

### 3. FitGuideModal.tsx -- 5 violations

- Line 71: Mobile drawer `rounded-t-3xl` to `rounded-t-none` or remove
- Line 76: Mobile close button `rounded-full` to `rounded-none`
- Line 98: Mobile size badge `rounded-full` to sharp
- Line 123: Size worn box `rounded-lg` to `rounded-none`
- Line 191: Desktop modal `rounded-xl` to `rounded-none`
- Line 200: Desktop close button `rounded-full` to `rounded-none`
- Line 238: Desktop size badge `rounded-full` to sharp
- Line 276: Desktop size worn box `rounded-lg` to `rounded-none`

### 4. SwipeProgress.tsx -- 1 violation

- Line 95: Bundle discount badge `rounded-full` to sharp

### 5. SwipeActions.tsx -- Intentional Exception (NO CHANGE)

The three circular action buttons (Undo, Skip, Add) use `rounded-full` -- these are intentional Tinder-style circular action buttons that serve an ergonomic purpose. The same reasoning applies to navigation dots. These stay `rounded-full`.

## What Does NOT Change

- SwipeActions.tsx circular buttons (ergonomic exception)
- LookNavigationMobile.tsx pill container + dots (ergonomic exception)
- LookNavigation.tsx dots (dots are inherently round)
- SwipeProgress.tsx progress dots (inherently round)
- LookSection.tsx (already polished)
- LookbookHero.tsx (already polished)
- ShopTheLook.tsx (already polished)
- FitGuideSection.tsx (already polished)
- No new dependencies, no layout changes, no data changes

## Files Modified

| File | Changes |
|------|--------|
| `src/components/lookbook/SwipeCard.tsx` | Remove all `rounded-full` from badges/indicators, change card from `rounded-3xl` to `rounded-none` |
| `src/components/lookbook/SwipeableLookCard.tsx` | Remove `rounded-full` from bundle badge, `rounded-lg` from size buttons |
| `src/components/lookbook/FitGuideModal.tsx` | Remove `rounded-xl`, `rounded-t-3xl`, `rounded-full`, `rounded-lg` from modal, drawer, badges, close buttons, and size boxes |
| `src/components/lookbook/SwipeProgress.tsx` | Remove `rounded-full` from bundle discount badge |

## Technical Details

All changes are CSS class replacements only. No logic, state, or structural changes. Every `rounded-*` violation gets replaced with either no radius class (defaults to `rounded-none` from the site's base styles) or explicitly set to `rounded-none` where clarity is needed.

