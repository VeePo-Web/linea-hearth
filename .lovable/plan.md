

# World-Class Community Page -- Editorial Rebuild

## Current State Audit

### What Works (Preserve)
- "THE TRIBE" manifesto hero: massive typography, amber accent, noise texture, counter stats -- all strong 032c/DAZED energy
- Featured story magazine spread layout with 3/5 + 2/5 grid
- SubmitStoryCTA "Got a Testimony?" section -- excellent exclusive language and industrial dividers
- Animation system (stagger, word reveal) is well-built and reusable

### What's Broken (Critical)
1. **Massive dead whitespace** between Featured Story and Story Grid (~200px of nothing) -- kills editorial pacing
2. **Story Grid is visually flat**: all 4 placeholder cards have identical gradient backgrounds with single-letter initials. No visual hierarchy, no bento variation, no editorial tension
3. **Bento grid is not functioning**: `getCardSize()` returns "large" for index 0 but with only 4 items, the layout looks like a uniform 4-column row -- no asymmetry
4. **Social Feed uses identical images**: all 8 posts show `/founders.png` -- looks broken, not curated
5. **No section transitions**: sections just stack with no editorial pacing (quiet-loud-quiet rhythm missing)
6. **Story cards lack depth**: no hover micro-interactions beyond a gradient slide-up that doesn't feel premium
7. **StoryModal missing DialogDescription**: accessibility warning (same issue we fixed on SwipeLookbook)
8. **Mobile story grid**: 2-column grid with 180px rows makes cards too cramped for story text to be readable

---

## Plan: 7 Surgical Upgrades

### 1. Community.tsx -- Add editorial section dividers and tighten pacing

Insert thin horizontal dividers between sections (the 032c industrial line treatment already used in SubmitStoryCTA). Add an "editorial interstitial" stat strip between the Featured Story and Story Grid to break the dead whitespace.

**Changes:**
- Add a section index counter strip between CommunityHero and StoryGrid: a thin full-width bar with `"500+ Stories / 45 Cities / 10K Tribe"` in `text-[10px] uppercase tracking-[0.4em]` -- pulls the stats from the hero into a persistent reminder
- Remove the stats from CommunityHero (they're redundant when the strip exists)
- Add `py-0` or reduced padding on StoryGrid top since the interstitial handles the transition

### 2. CommunityHero.tsx -- Tighten the featured story vertical rhythm

The gap between the hero manifesto section and the featured story section creates a pacing break. The featured story section also has excessive vertical padding.

**Changes:**
- Reduce featured story section padding from `py-20 lg:py-32` to `py-16 lg:py-24`
- Add an industrial divider line (h-px bg-border) between the manifesto and featured story sections
- Move the scroll-down indicator to sit on the divider line for visual connection
- Remove the decorative quote marks (`"`) -- they float disconnected from content and add visual noise

### 3. StoryGrid.tsx -- Fix the bento layout and add visual variety

The grid needs actual asymmetry and better empty-state presentation. With only 4 placeholder cards, the bento logic produces a flat row.

**Changes:**
- Change grid from `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with varying row spans -- fewer columns = more breathing room (luxury principle)
- Make first card span 2 rows AND 2 columns on desktop (true hero card)
- Increase `auto-rows` from `180px` to `240px` on mobile and `280px` on desktop for readability
- Add alternating background treatments: odd cards get `bg-stone-100 dark:bg-stone-900`, even cards get `bg-stone-200 dark:bg-stone-800` -- creates visual rhythm without needing photos
- Add a "story type" label inside each card: "TESTIMONY" or "REVIEW" in `text-[9px] uppercase tracking-[0.2em]` with amber accent for testimonies
- Add the story count text as a left-aligned section header with a decorative index number (like ambassador benefits): `01 — STORIES FROM THE TRIBE`

### 4. StoryCard.tsx -- Elevate card design with editorial depth

Cards currently lack the premium feel of the rest of the site. They need the same 032c treatment as other components.

**Changes:**
- Add type indicator badge: "TESTIMONY" (amber) or "REVIEW" (white/10) in the top-left, replacing the product badge position when no product exists
- For review cards: show star rating always (not just on hover) -- it's the primary content differentiator
- Increase quote text size for "large" cards from `text-sm md:text-base` to `text-base md:text-lg`
- Add a subtle border on cards (`border border-white/5`) for definition in the grid
- Remove the amber gradient hover CTA slide-up ("Read Story -->") -- it covers content and feels cheap. Replace with a simple `cursor-pointer` and the card's existing overlay deepening on hover
- Add `transition-transform duration-500 group-hover:scale-[1.02]` to the card container for a subtle lift effect

### 5. SocialFeed.tsx -- Differentiate the visual treatment

All posts showing the same image makes the section feel broken. Without real UGC images, we need to differentiate posts visually.

**Changes:**
- Apply alternating color overlays to the grayscale images: odd posts get `mix-blend-multiply` with a warm stone tint, even posts get cool blue-stone tint -- creates visual variety from a single source image
- Alternate card sizes: make every 3rd card slightly taller (`aspect-[3/4]` instead of `aspect-square`) for masonry rhythm
- Add the post engagement count on hover: `"{likes} likes"` in `text-[10px]` -- adds social proof
- Replace the horizontal scroll with a CSS grid on desktop (`grid-cols-4 gap-3`) and keep horizontal scroll on mobile only -- horizontal scroll on desktop feels like a carousel, not editorial
- Add a section index number watermark (`05`) like other sections use

### 6. StoryModal.tsx -- Add missing DialogDescription for accessibility

Same pattern as the SwipeLookbook fix.

**Changes:**
- Add `DialogDescription` with `className="sr-only"` containing "Read the full story from {customer_name}"
- This eliminates the accessibility warning

### 7. Mobile-Specific Refinements

**StoryGrid mobile:**
- Switch to `grid-cols-1` on mobile (single column) with `auto-rows-[320px]` -- each card becomes a full-width editorial moment instead of cramped thumbnails
- On tablet (`md:`), use `grid-cols-2`

**SocialFeed mobile:**
- Keep horizontal scroll with `snap-x snap-mandatory`
- Add scroll indicator dots below the gallery

**CommunityHero mobile:**
- The manifesto text is readable but the stats row wraps awkwardly on small screens. Switch from `flex-wrap gap-10` to `grid grid-cols-3 gap-4` with centered text

---

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/pages/Community.tsx` | Add editorial stat strip between hero and grid | Pacing fix |
| `src/components/community/CommunityHero.tsx` | Tighten padding, remove floating quote marks, refine stats layout | Vertical rhythm |
| `src/components/community/StoryGrid.tsx` | Fix bento grid proportions, add section header, increase card heights | Visual hierarchy |
| `src/components/community/StoryCard.tsx` | Add type badges, remove cheap hover CTA, add subtle lift, always show ratings | Card premium feel |
| `src/components/community/SocialFeed.tsx` | Grid on desktop, visual variety via overlays, engagement counts | Section polish |
| `src/components/community/StoryModal.tsx` | Add sr-only DialogDescription | Accessibility |

## What Does NOT Change
- SubmitStoryCTA -- already world-class, untouched
- SubmitStoryModal -- form is clean, untouched
- StoryFilters -- currently unused (removed from page per memory), stays unused
- No new dependencies
- No database changes
- All motion respects prefers-reduced-motion via existing animation system
- Brand colors (amber-500, stone-950) stay locked

