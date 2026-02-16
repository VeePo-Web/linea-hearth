

# Community Page -- Phase 5: World-Class Final Pass

## Current State Assessment

After 4 rounds of upgrades, the Community page is strong: manifesto hero with word-reveal animation, featured story magazine spread, integrated sticky filters, varied-gradient bento grid, social feed with tint overlays and scroll dots, and the "Got a Testimony?" CTA. All sections flow with editorial pacing and industrial dividers.

### What's Working (Preserve)
- THE TRIBE manifesto hero -- massive type, noise texture, amber accent, word-by-word reveal
- Sticky filter bar with editorial tabs (All / Reviews / Testimonies / Transformations) + product/sort selects
- StatStrip industrial divider between hero and grid
- Featured story 3/5 + 2/5 magazine spread with grayscale-to-color hover
- Story cards with varied gradient backgrounds, type badges, star ratings, editorial watermark letters
- Social feed with alternating tint overlays, desktop grid, mobile snap-scroll with dots
- SubmitStoryCTA -- world-class 032c industrial treatment
- Section dividers (`h-px bg-border`) between all sections
- Accessibility: DialogDescription on StoryModal, proper ARIA labels

### What Still Needs Elevation

1. **Story grid auto-rows fight card content**: With `auto-rows-[280px]` on mobile, cards have fixed height regardless of content length. Short testimonies have a large empty gradient above the text. The cards should size to content on mobile (single column) while maintaining fixed rows on desktop grid for alignment.

2. **The "large" hero card no longer spans 2 rows on mobile** (fixed), but on desktop `lg:grid-cols-2` with `md:row-span-2 md:col-span-2` means the hero card tries to span 2 columns in a 2-column grid -- taking the full width with no card beside it. This defeats the bento purpose. With 4 items, the layout should be: hero card left (spanning 2 rows), 2 regular cards stacked on the right, 4th card below.

3. **Social feed section index "03"** is correct for the section numbering, but the story grid section uses "01" while there is no "02" section visible (the featured story in CommunityHero has no numbered index). This creates a gap in the editorial numbering.

4. **Mobile filter bar**: The "FILTERS" button doesn't open anything -- it's a dead button. It should either open a filter drawer or be removed to avoid confusion.

5. **Story cards on hover**: The `scale-[1.02]` lift works but there's no cursor feedback beyond `cursor-pointer`. Adding a subtle overlay opacity shift on hover would reinforce interactivity.

6. **Social feed cards all show the same image** (`/founders.png`). While the tint overlays add variety, the identical faces are immediately noticeable. We should apply CSS transforms (mirror, slight zoom, crop variations) to create more visual differentiation from the same source image.

7. **"Load More" button** never appears with placeholder data (4 items, ITEMS_PER_PAGE is 12). The empty space at the bottom of the grid before the section divider feels abrupt. A subtle "end of stories" marker or editorial footnote would close the section more gracefully.

---

## Plan: 7 Precision Upgrades

### 1. StoryGrid.tsx -- Fix bento grid math for small collections

The current logic uses `lg:grid-cols-2` when items are 6 or fewer, but the hero card spans `md:col-span-2` which takes the full width of a 2-column grid. Fix by using `lg:grid-cols-3` always (hero card spans 2 of 3 columns, leaving room for a card beside it on desktop), or by removing the `col-span-2` for small collections.

**Changes:**
- Always use `lg:grid-cols-3` regardless of item count -- the bento grid needs 3 columns for the hero card to work properly
- On mobile: switch `auto-rows-[280px]` to `auto-rows-auto` with `min-h-[240px]` so cards size to content
- On tablet/desktop: keep `md:auto-rows-[260px]` for grid alignment discipline
- Add a subtle editorial footnote after the grid when there are no more items: a thin line with "End of stories" in `text-[9px] uppercase tracking-[0.3em] text-muted-foreground` centered on it

### 2. StoryCard.tsx -- Improve hover depth and content sizing

**Changes:**
- Add `group-hover:opacity-90` to the gradient overlay (currently `opacity-70 group-hover:opacity-85`) -- increase the contrast shift on hover for more depth
- On the content overlay, add a subtle `transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500` to the customer info block -- a micro-reveal on hover
- For cards without photos: add CSS `scale` and `rotate` micro-variations to the watermark letter on hover: `group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700`

### 3. StoryFilters.tsx -- Remove dead "Filters" button on mobile

The "FILTERS" button on mobile doesn't connect to any drawer or functionality. It takes up space and creates a dead-end interaction.

**Changes:**
- Remove the "FILTERS" button from the mobile horizontal scroll
- Instead, show the sort select inline after the type pills on mobile (as a small dropdown)
- This keeps the mobile filter bar functional and eliminates the dead interaction

### 4. SocialFeed.tsx -- Add CSS transforms for image variety

All 8 social posts use `/founders.png`. The tint overlays help but the identical composition is obvious.

**Changes:**
- Apply alternating CSS transforms to the images within the social cards:
  - Even cards: `scale-x-[-1]` (horizontal mirror)
  - Cards at index 2, 5: `scale-[1.3]` with `object-position: top` (tight crop)
  - Cards at index 3, 6: `object-position: bottom-right` (different crop area)
- These are pure CSS, zero performance cost, and create visual differentiation from a single source

### 5. StoryGrid.tsx -- Add section numbering continuity

The grid shows "01" but the social feed shows "03". The missing "02" creates a numbering gap.

**Changes:**
- Change the story grid section index from "01" to "02" (Featured Story in the hero is conceptually section 01)
- This creates proper editorial numbering: Hero (unnumbered manifesto), Featured Story (01 -- labeled in CommunityHero sidebar), Story Grid (02), Social Feed (03), CTA (unnumbered closing)

### 6. CommunityHero.tsx -- Minor polish

**Changes:**
- The "Featured Story" rotated sidebar label on desktop reads well. Add the section index "01" before it: "01 — Featured Story" to establish the numbering system from the start
- This anchors the editorial indexing that flows through the rest of the page

### 7. Mobile-specific refinements

**StoryGrid mobile:**
- The `auto-rows-[280px]` creates cards that are too tall for short content on mobile. Switch to `auto-rows-[auto]` on mobile with `min-h-[200px]` so cards size to their quote length naturally. Keep fixed rows on desktop for grid discipline.

**SocialFeed mobile:**
- The scroll dots are working. Add `scroll-pl-4` to align the first card with the container padding (if not already present).

---

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/components/community/StoryGrid.tsx` | Fix grid to always use 3 cols on desktop, auto-rows on mobile, add end-of-stories footnote, fix section index to "02" | Low |
| `src/components/community/StoryCard.tsx` | Enhanced hover micro-interactions on gradient and customer info | Low -- CSS only |
| `src/components/community/StoryFilters.tsx` | Remove dead Filters button on mobile, add inline sort | Low |
| `src/components/community/SocialFeed.tsx` | CSS transforms for image variety | Low -- CSS only |
| `src/components/community/CommunityHero.tsx` | Add "01" to Featured Story sidebar label | Zero risk |

## What Does NOT Change
- SubmitStoryCTA -- untouched (world-class)
- SubmitStoryModal -- untouched
- StoryModal -- untouched (accessibility already fixed)
- Community.tsx -- untouched (filter wiring complete)
- No new dependencies
- No database changes
- Brand colors locked (amber-500, stone-950)
- All existing animations preserved

