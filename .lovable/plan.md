

# Community Page -- Phase 9: Bento Grid Gap Fix

## Issue Identified

On desktop (1920px), the 3-column bento grid with 6 cards has a layout gap. The `getCardSize` function marks index 5 as "wide" (`col-span-2`) because `5 % 5 === 0`. On a 3-column grid:

- Row 1-2: Card 0 (large, 2x2) + Card 1 (1x1) + Card 2 (1x1) -- fills perfectly
- Row 3: Card 3 (1x1) + Card 4 (1x1) + Card 5 (wide, needs 2 cols) -- Card 5 cannot fit in the remaining 1 column, so it wraps to Row 4, leaving a gap in Row 3 column 3

The fix is to make the `getCardSize` logic only apply spanning for larger datasets. With 6 or fewer items, only the hero card (index 0) should span. All others should be "regular" so the 3-column grid fills cleanly: hero (2x2) + 2 stacked right + 3 across the bottom row.

## What's Working (No Changes)

- Hero section with immersive header, `pt-20` mobile padding, `opacity-30` background -- verified on both desktop and mobile
- Featured Story magazine spread
- Sticky filter bar with mobile sort pills
- Social feed with corrected gradient
- StoryCard keyboard accessibility (`tabIndex`, `role`, `onKeyDown`, focus rings)
- SubmitStoryCTA industrial treatment
- StatStrip deduplication (removed from Community.tsx)
- 6 placeholder stories present

## Implementation

### File: `src/components/community/StoryGrid.tsx`

Change the `getCardSize` function to only apply `wide` and secondary `large` spans when there are enough items to fill the grid without gaps. For 6 or fewer items on a 3-column grid, only index 0 gets "large":

```typescript
const getCardSize = (index: number): "regular" | "large" | "wide" => {
  if (index === 0) return "large";
  // Only apply spanning for larger datasets where grid can absorb it
  if (displayStories.length > 9) {
    if (index % 7 === 0) return "large";
    if (index % 5 === 0) return "wide";
  }
  return "regular";
};
```

This ensures:
- With 6 placeholders: hero (2x2) + 5 regular cards -- fills 3-col grid perfectly (2 rows for hero section + 1 full row of 3)
- With 12+ real stories from the database: the bento variety kicks in with wide and large cards
- No empty cells on desktop

## Technical Details

| File | Change | Risk |
|------|--------|------|
| `src/components/community/StoryGrid.tsx` | Guard spanning logic for small datasets | Low -- logic only |

## No Other Changes

All Phase 8 work is verified and correct. This is a single surgical fix.

