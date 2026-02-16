

# Community Page -- Next-Level Editorial Polish Pass

## Current State Assessment

The Community page received a strong foundation rebuild (stat strip, bento grid, card badges, social feed grid, accessibility fixes). What remains are **finishing touches** that separate "very good" from "world-class editorial":

### What's Working Well (Preserve)
- THE TRIBE manifesto hero with massive type, noise texture, amber accent
- StatStrip between hero and grid -- great editorial pacing
- Featured story 3/5 + 2/5 magazine spread
- SubmitStoryCTA industrial treatment
- StoryModal with DialogDescription (accessibility fixed)
- Social feed with tint overlays and desktop grid

### What Still Needs Elevation

1. **Story grid hero card overlaps**: The "large" card (Sarah M.) spans `row-span-2 md:col-span-2` but with only 4 items in a 3-column grid, the layout creates an awkward empty cell below the two right-side cards. The hero card's `aspect-[3/4]` aspect ratio fights the `auto-rows-[280px]` height -- producing visual tension rather than editorial intent.

2. **Placeholder card backgrounds are still uniform**: All 4 cards without photos show the same `from-stone-200 to-stone-300` gradient with a single large letter. No visual variety between them despite different story types.

3. **SocialFeed section index says "05" but it's actually the 4th section** on the page (Hero, Featured, Grid, Social). Minor detail but breaks editorial indexing integrity.

4. **CommunityHero featured story section** still has the `useEffect` import but doesn't use it (dead import from previous version).

5. **Story grid "Load More" button** has `mt-16` creating dead space after only 4 cards. With placeholder data, it never shows, but when real data arrives the spacing will feel excessive for an editorial layout.

6. **Mobile viewport**: The `auto-rows-[320px]` on mobile creates very tall cards for short testimonies -- the content sits at the bottom with large empty gradient above, wasting screen real estate.

7. **SocialFeed mobile scroll** has no visual indicator that more content exists to the right beyond a faint gradient fade edge.

---

## Plan: 6 Precision Fixes

### 1. StoryGrid.tsx -- Fix grid math for 4-item layouts

The bento logic works for 12+ items but with 4 placeholder items, the hero card creates dead space. Add a "small collection" layout mode.

**Changes:**
- When `displayStories.length <= 6`: use `lg:grid-cols-2` instead of `lg:grid-cols-3` -- the hero card spans full width of left column while right column gets 2 stacked regular cards. Remaining items fill naturally.
- When `displayStories.length > 6`: keep current `lg:grid-cols-3` bento.
- Adjust `auto-rows` to `auto-rows-[280px] md:auto-rows-[240px] lg:auto-rows-[260px]` -- slightly reduce mobile card height so content fills better.
- Reduce "Load More" margin from `mt-16` to `mt-10` for tighter editorial feel.

### 2. StoryCard.tsx -- Add visual variety to placeholder backgrounds

Cards without photos all look identical. Differentiate them based on index and type.

**Changes:**
- Create an array of 4 alternating gradient treatments:
  - Index 0 (large/story): `from-stone-900 to-stone-800` (dark, editorial)
  - Index 1 (review): `from-amber-950/80 to-stone-900` (warm dark)
  - Index 2 (story): `from-stone-800 to-stone-700` (medium)
  - Index 3 (review): `from-stone-950 to-amber-950/40` (accent dark)
- Reduce the initial letter from `text-[80px]` to `text-[60px]` and shift it to the top-right corner (`absolute top-6 right-6`) -- transforms it from a centered placeholder feel to an intentional editorial watermark.
- Add a subtle diagonal line pattern overlay (`bg-[repeating-linear-gradient(...)]`) at 2% opacity on even-indexed cards for textural variety.

### 3. SocialFeed.tsx -- Fix section index + add mobile scroll hint

**Changes:**
- Change section index from "05" to "03" (it's the 3rd content section after Hero and Grid).
- Add scroll indicator dots below mobile horizontal scroll: a row of 8 small circles, with filled circles for visible items based on scroll position. Use a simple `useRef` + `onScroll` to track which items are visible.
- Add `scroll-pl-4` to the mobile scroll container so the first card aligns with the container padding.

### 4. CommunityHero.tsx -- Clean dead import

**Changes:**
- Remove `useEffect` from the import statement (unused).

### 5. StoryModal.tsx -- Improve mobile layout

The modal's `grid md:grid-cols-5` layout works on desktop but on mobile the `aspect-[3/4]` image area consumes most of the viewport, pushing story content off-screen.

**Changes:**
- Change mobile image aspect from `aspect-[3/4]` to `aspect-[4/3]` (landscape on mobile, portrait on desktop via the md:aspect-auto). This shows the customer avatar area without dominating the viewport.
- Add `scroll-mt-4` to the content section so it's immediately visible on mobile when the modal opens.

### 6. Community.tsx -- Add section dividers between grid and social feed

The transition from StoryGrid (white bg) to SocialFeed (`bg-muted/30`) is abrupt. Add a thin editorial divider between them consistent with the StatStrip treatment.

**Changes:**
- Add a `<div className="h-px bg-border" />` between `<StoryGrid />` and `<SocialFeed />`.
- Add another between `<SocialFeed />` and `<SubmitStoryCTA />`.

---

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/components/community/StoryGrid.tsx` | Small-collection grid mode, adjusted auto-rows | Low -- layout only |
| `src/components/community/StoryCard.tsx` | Varied placeholder gradients, repositioned initial letter | Low -- visual only |
| `src/components/community/SocialFeed.tsx` | Fix section index, add mobile scroll dots | Low |
| `src/components/community/CommunityHero.tsx` | Remove dead useEffect import | Zero risk |
| `src/components/community/StoryModal.tsx` | Mobile image aspect ratio fix | Low |
| `src/pages/Community.tsx` | Add section dividers | Zero risk |

## What Does NOT Change
- SubmitStoryCTA -- untouched (already world-class)
- SubmitStoryModal -- untouched
- No new dependencies
- No database changes
- Brand colors locked (amber-500, stone-950)
- All existing animations preserved

