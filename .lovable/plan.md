

# Community Page -- Phase 8: World-Class Polish and Final QA

## Current State

After 7 phases, the Community page delivers editorial-grade quality across all viewports. The immersive hero, featured story magazine spread, sticky filters, bento grid, social feed with CSS transforms, and industrial CTA all work correctly.

## What's Working (Preserve Everything)
- Immersive hero with THE TRIBE manifesto, word-reveal animation, noise texture, stats row
- Featured Story 3/5 + 2/5 magazine spread with grayscale-to-color hover, "01 -- Featured Story" sidebar
- StatStrip industrial divider (500+ Stories / 45 Cities / 10K Tribe)
- Sticky filter bar: desktop editorial tabs + mobile pill navigation with sort pills
- Bento StoryGrid: 3-col desktop, auto-rows-auto mobile, "End of stories" footnote, section index "02"
- Social Feed: 4-col desktop grid, mobile snap-scroll with dots, CSS image transforms for variety, section index "03"
- SubmitStoryCTA: 032c industrial treatment with word-reveal
- StoryModal: 60/40 magazine layout, accessibility (DialogDescription), share + AMA actions
- All animations use viewport once triggers with amount: 0

## Issues Identified

### 1. Bento grid only shows 4 cards but uses lg:grid-cols-3 with hero spanning 2 cols + 2 rows
With 4 placeholder items on a 3-column grid where card 0 spans 2x2, the layout leaves empty cells. Card 0 takes positions (1,1), (1,2), (2,1), (2,2). Card 1 takes (1,3). Card 2 takes (2,3). Card 3 drops to row 3, column 1 -- leaving columns 2 and 3 of row 3 empty. This creates a visible gap on the right side of the grid on desktop.

**Fix:** Add 2 more placeholder stories (total 6) so the grid fills naturally: hero (2x2), 2 cards stacked right, 3 cards on row 3.

### 2. StatStrip is duplicated
`Community.tsx` renders a `StatStrip` component (defined inline) AND `CommunityHero` has its own stats row at the bottom of the manifesto. The user sees stats twice: once at the bottom of the hero (500+ / 45 / 10K+) and again in the StatStrip (500+ Stories / 45 Cities / 10K Tribe). This is redundant.

**Fix:** Remove the inline `StatStrip` from `Community.tsx` since `CommunityHero` already has a built-in stats row with better styling.

### 3. Mobile hero doesn't feel immersive enough
The background image on the right side (`/founders.png`) has `opacity-20` on mobile vs `lg:opacity-30` on desktop. On a 390px screen, the image is barely visible and the hero feels like plain dark text on black. The "NOT FOR EVERYONE" label starts immediately after the header with no breathing room.

**Fix:** Increase mobile background image opacity to `opacity-30` (matching desktop) and add `pt-24` padding to the hero content container for mobile to push the manifesto down and create a cinematic entry space.

### 4. Social feed right-fade gradient uses `from-background/80`
On the mobile horizontal scroll, the right-fade gradient overlay uses `from-background/80`. In dark mode this works, but if the background is the muted section (`bg-muted/30`), the fade doesn't perfectly match. This creates a subtle color mismatch at the scroll edge.

**Fix:** Change to `from-muted/80` to match the section background, or use `from-[hsl(var(--muted))]` for exact match.

### 5. StoryModal close button overlaps content on mobile
The default DialogContent close button sits in the top-right corner. On mobile (single column layout), when the image/placeholder takes `aspect-[4/3]`, the close X sits on top of the image. This is functional but could be more intentional.

**Fix:** No code change needed -- this is standard Dialog behavior and works. Note for awareness only.

### 6. No keyboard focus indicators on story cards
The story cards use `cursor-pointer` and `onClick` but have no visible focus state for keyboard navigation. When tabbing through cards, there's no visual indicator of which card is focused.

**Fix:** Add `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background` to the StoryCard motion.div, and add `tabIndex={0}` and `onKeyDown` handler for Enter/Space to trigger the modal.

---

## Implementation Plan

### File 1: `src/pages/Community.tsx`
- Remove the inline `StatStrip` function and its render in the JSX (eliminates duplicate stats)
- The CommunityHero already has its own stats row

### File 2: `src/components/community/StoryGrid.tsx`
- Add 2 more placeholder stories to bring total to 6, filling the 3-column bento grid without gaps
- New placeholders should follow the same data structure with varied gradients, locations, and content types

### File 3: `src/components/community/CommunityHero.tsx`
- Increase mobile background image opacity from `opacity-20` to `opacity-30` (remove the responsive opacity split, just use `opacity-30` universally)
- Add `pt-20 lg:pt-0` to the content container to create breathing room below the header on mobile

### File 4: `src/components/community/StoryCard.tsx`
- Add keyboard accessibility: `tabIndex={0}`, `role="button"`, `onKeyDown` handler for Enter/Space
- Add `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2` for visible focus state

### File 5: `src/components/community/SocialFeed.tsx`
- Fix mobile scroll fade gradient from `from-background/80` to `from-muted/80` to match section background

---

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/pages/Community.tsx` | Remove duplicate StatStrip | Low -- removes dead code |
| `src/components/community/StoryGrid.tsx` | Add 2 placeholder stories | Low -- additive data |
| `src/components/community/CommunityHero.tsx` | Increase mobile opacity, add mobile top padding | Low -- CSS only |
| `src/components/community/StoryCard.tsx` | Add keyboard accessibility + focus states | Low -- additive |
| `src/components/community/SocialFeed.tsx` | Fix fade gradient color match | Low -- CSS only |

## What Does NOT Change
- StoryFilters.tsx -- mobile sort pills complete, working correctly
- SubmitStoryCTA.tsx -- world-class, untouched
- StoryModal.tsx -- accessibility intact, untouched
- SubmitStoryModal.tsx -- untouched
- No new dependencies
- No database changes
- Brand colors locked (amber-500, stone-950)
- All existing animations preserved

