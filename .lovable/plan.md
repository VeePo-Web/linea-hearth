

# Community Page -- Phase 7: Visual QA and Rendering Stability

## Current State Assessment

After 6 phases, the Community page has all sections implemented and structurally correct:
- THE TRIBE manifesto hero (min-h-screen, word-reveal animation)
- Featured Story (3/5 + 2/5 magazine spread)
- StatStrip (industrial divider)
- StoryFilters (sticky editorial tabs, desktop + mobile pills)
- StoryGrid (3-col bento with placeholder fallback, "End of stories" footnote)
- SocialFeed (4-col desktop grid, mobile snap-scroll with dots, CSS image transforms)
- SubmitStoryCTA (032c industrial treatment)

Phase 6 successfully removed aspect-ratio classes from StoryCard and adjusted grid auto-rows to 280px/300px.

### Confirmed Working
- All database queries return successfully (empty arrays trigger placeholder data)
- All sections exist in the DOM
- StoryFilters state is wired to StoryGrid
- SocialFeed image variety transforms applied
- StoryModal accessibility (DialogDescription) intact
- "End of stories" editorial footnote renders

### Issues Identified in QA

**1. StoryGrid cards may render at 0 visible height on initial load**
The `motion.div` wrapper on each StoryCard starts at `opacity: 0, y: 30` with `whileInView`. Combined with `auto-rows-auto` on mobile, cards that haven't been "seen" by the viewport remain invisible. The grid section `py-12 lg:py-16` renders, but the cards inside start hidden and may not trigger `whileInView` if the browser scrolls past them quickly or if they're below the fold in a tight layout.

**Fix:** Add `initial={{ opacity: 1, y: 0 }}` as a fallback or use `viewport={{ once: true, amount: 0 }}` to trigger animation as soon as any pixel enters the viewport. Alternatively, stagger the first 4 cards with `animate` instead of `whileInView` since they're always visible placeholder data.

**2. SocialFeed section is `lg:hidden` for mobile scroll + `hidden lg:block` for desktop grid**
This is correct but on tablet (md breakpoint), neither the mobile scroll nor the desktop grid shows. The mobile scroll has `lg:hidden` (shows on sm/md) and desktop grid has `hidden lg:block` (shows on lg+). This works correctly -- the mobile horizontal scroll covers sm and md, desktop grid covers lg+. No fix needed.

**3. StoryFilters mobile pills lack sort control**
Phase 5 plan called for removing the dead "FILTERS" button and adding inline sort on mobile. The FILTERS button was removed, but the sort dropdown was not added to mobile. Mobile users can only filter by type (All/Reviews/Testimonies/Transformations) but cannot change sort order.

**Fix:** Add a small sort toggle after the type pills on mobile.

**4. The "End of stories" footnote spacing**
Currently `mt-12` which creates a large gap between the last card and the footnote. With `auto-rows-auto` on mobile, this is fine, but on desktop with `auto-rows-[300px]`, the footnote sits 48px below the last row, which is appropriate. No fix needed.

**5. Community page does not pass `immersiveHero` to Layout**
The CommunityHero uses `min-h-screen` for the manifesto section, but the Layout component adds `pt-[var(--header-height)]` to the main element. This means the hero starts below the header, not behind it. For a true immersive hero (like a full-bleed dark section), it should pass `immersiveHero={true}` to Layout so the hero sits under the transparent header.

**Fix:** Add `immersiveHero` prop to Layout in Community.tsx to allow the dark hero to extend behind the header for a more cinematic entry.

---

## Implementation Plan

### File 1: `src/pages/Community.tsx`
- Pass `immersiveHero` prop to Layout for cinematic hero treatment
- Change: `<Layout>` to `<Layout immersiveHero>`

### File 2: `src/components/community/StoryCard.tsx`
- Change `whileInView` viewport config to `{ once: true, amount: 0 }` so cards trigger animation immediately when any pixel enters viewport
- This prevents cards from staying invisible if the user scrolls quickly past them

### File 3: `src/components/community/StoryFilters.tsx`
- Add a sort dropdown to the mobile pill bar (after the type pills)
- Use a minimal Select component matching the existing pill aesthetic
- This completes the Phase 5 plan item that was not implemented

---

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/pages/Community.tsx` | Add `immersiveHero` prop to Layout | Low -- single prop |
| `src/components/community/StoryCard.tsx` | Fix viewport trigger amount to 0 | Low -- animation config |
| `src/components/community/StoryFilters.tsx` | Add mobile sort dropdown | Low -- additive UI |

## What Does NOT Change
- StoryGrid.tsx -- grid layout from Phase 6 is correct
- SocialFeed.tsx -- working correctly with image transforms
- CommunityHero.tsx -- no changes needed
- SubmitStoryCTA.tsx -- world-class, untouched
- StoryModal.tsx -- accessibility intact
- No new dependencies
- No database changes
- Brand colors locked (amber-500, stone-950)

