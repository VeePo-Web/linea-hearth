

# Phase 10: Tablet Grid Polish + Mobile Filter Removal

## Changes

### 1. Remove mobile filter bar (StoryFilters)
The horizontal pill bar ("All / Reviews / Testimonies / Transformations / Most Recent / Featured") on mobile feels cluttered and unnecessary. Remove the entire mobile section from `StoryFilters.tsx` (the `md:hidden` block, lines 162-198). The desktop/tablet editorial tabs remain untouched.

### 2. Last card spans full width on tablet
On a 2-column tablet grid (768px), when there's an odd number of non-hero cards, the last card sits alone in column 1. Fix: detect when the last card would be orphaned on tablet and make it span both columns for an editorial full-bleed finish.

**Grid math (6 items, 2-col tablet):**
- Card 0 (hero): `md:col-span-2 md:row-span-2` -- fills rows 1-2
- Cards 1-2: row 3
- Cards 3-4: row 4
- Card 5: row 5, col 1 alone -- needs `md:col-span-2`

But this span must NOT apply on desktop (3-col), so the class needs to be `md:col-span-2 lg:col-span-1`.

**Implementation:** Add a new size value `"tablet-wide"` or pass an `isLastOdd` prop to StoryCard. The simplest approach: compute in `getCardSize` whether the last item would be orphaned on the tablet 2-col grid, and return a new size. Then in StoryCard, map that size to `md:col-span-2 lg:col-span-1`.

---

## File Changes

### `src/components/community/StoryFilters.tsx`
- Remove the mobile section (lines 162-198): the `md:hidden` div containing type pills and sort pills
- Keep the desktop `hidden md:flex` section intact

### `src/components/community/StoryGrid.tsx`
- Update `getCardSize` to detect the last orphan on a 2-col grid:
  - After the hero card (index 0, spans 2 cols), there are `N-1` remaining cards on a 2-col grid
  - If `(N-1)` is odd, the last card is orphaned
  - Return `"tablet-wide"` for that last card
- Logic: `if (index === displayStories.length - 1 && (displayStories.length - 1) % 2 !== 0) return "tablet-wide"`

### `src/components/community/StoryCard.tsx`
- Add `"tablet-wide"` to the size type
- Map it to `md:col-span-2 lg:col-span-1` in `spanClass`

| File | Change | Risk |
|------|--------|------|
| StoryFilters.tsx | Remove mobile `md:hidden` block | Low |
| StoryGrid.tsx | Add last-orphan detection | Low |
| StoryCard.tsx | Add `tablet-wide` size mapping | Low |

