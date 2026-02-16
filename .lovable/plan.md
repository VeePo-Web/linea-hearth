

# Community Page -- Phase 6: Grid Layout Fix and Mobile Polish

## Current State

After 5 phases of upgrades, the Community page is nearly world-class. The hero, featured story, sticky filters, social feed, and CTA sections all deliver editorial-grade quality. However, two layout issues remain that break the premium illusion:

## Remaining Issues

### 1. Bento grid card overlap on desktop (critical)
On the 3-column desktop grid, the hero card (Sarah M.) uses `md:col-span-2 md:row-span-2` with `aspect-[3/4]`. The aspect ratio calculates height from the card's width (2/3 of grid = ~580px wide, so height = ~773px). But `auto-rows-[260px]` limits rows to 260px each, so 2 rows = 520px. The aspect ratio wants 773px but only gets 520px, causing the card content to compress or overflow. Meanwhile, the regular cards beside it have `aspect-[4/5]` in 260px rows, which also fights the constraint.

**Fix:** Remove the aspect ratio classes from StoryCard when inside the grid. The grid's `auto-rows` should control height, and cards should fill their grid cell using `h-full` instead of aspect ratios. The aspect classes only make sense in free-flow layouts.

### 2. Mobile cards are still too tall
On mobile, `auto-rows-auto` with `min-h-[240px]` means short testimonies (2-3 lines) still get 240px minimum height. The `aspect-[3/4]` on the hero card (index 0) creates a very tall card on mobile since it's full-width (~370px wide, so height = ~493px). For single-column mobile, all cards should have a consistent, content-driven height with a reasonable min-height of ~200px.

### 3. Memory note conflict
The memory says "removed the sticky filter bar to reduce UI complexity" but Phase 4 re-added it. The filters are working and valuable -- this is correct behavior. No action needed, but noting for context.

---

## Implementation Plan

### File 1: `src/components/community/StoryCard.tsx`
- Remove aspect ratio classes (`aspect-[3/4]`, `aspect-[4/5]`, `aspect-[16/9]`) from the card container
- Instead, use `h-full` so the card fills whatever grid cell it's assigned to
- Keep `min-h-[240px]` for mobile to prevent cards from being too short
- The grid's `auto-rows` on desktop and `auto-rows-auto` on mobile will control the actual heights
- This eliminates the aspect-ratio vs auto-rows conflict entirely

### File 2: `src/components/community/StoryGrid.tsx`  
- Adjust the grid to use `auto-rows-[280px]` on tablet and `auto-rows-[300px]` on desktop (slightly taller to accommodate content)
- On mobile, keep `auto-rows-auto` with cards sizing naturally
- The hero card's `md:row-span-2` will give it 560-600px on desktop -- enough for the large card treatment without aspect ratio conflicts

### No other files change
All other components (SocialFeed, CommunityHero, SubmitStoryCTA, StoryFilters, StoryModal) are working correctly and remain untouched.

---

## Technical Details

| File | Change | Risk |
|------|--------|------|
| `src/components/community/StoryCard.tsx` | Replace aspect ratio classes with `h-full`, keep min-h | Low -- CSS only |
| `src/components/community/StoryGrid.tsx` | Adjust auto-rows values for better content fit | Low -- CSS only |

## What Does NOT Change
- All 5 previous phases of work preserved
- No new dependencies
- No database changes  
- Brand colors, animations, accessibility all preserved
- SubmitStoryCTA, StoryModal, StoryFilters, SocialFeed, CommunityHero untouched

