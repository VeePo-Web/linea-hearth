

# Community Page -- Phase 4: Final Polish and Filter Integration

## Current State

After 3 rounds of upgrades, the Community page has all major sections rendering correctly:
1. THE TRIBE manifesto hero (min-h-screen, full-bleed dark)
2. Featured Story (3/5 + 2/5 editorial split)
3. StatStrip (industrial divider with stats)
4. Stories From The Tribe (bento grid with 4 placeholder cards)
5. Social Feed (#LineOfJudah grid with 8 posts)
6. Got a Testimony? CTA (032c industrial)

The page structure is strong. What remains are **interaction and filtering capabilities** plus **final visual polish** items that were identified in the approved Phase 3 plan but not yet fully implemented.

---

## Remaining Issues

### 1. StoryFilters component is not wired up
The `StoryFilters` component exists and is fully functional (editorial tabs, product select, sort, mobile pills) but Community.tsx still hardcodes `selectedProduct="all"` etc. There is no interactive filtering. The memory note says filters were "removed to reduce UI complexity" -- but the approved Phase 3 plan explicitly calls for integrating them.

### 2. Hero card `row-span-2` still breaks on mobile
`StoryCard.tsx` line 41 applies `row-span-2` unconditionally for "large" cards. On mobile (single column), this doubles the card height to ~560px, creating a tall empty gradient with content pushed to the bottom. The Phase 3 plan called for making this `md:row-span-2` only.

### 3. Story card aspect ratios are uniform
All regular cards use `aspect-[4/5]` and all large cards use `aspect-[3/4]`. The plan called for mixed aspect ratios (landscape for wide cards, alternating portrait/square for regular) to create editorial rhythm.

### 4. SocialFeed padding is still loose
`py-20 lg:py-28` is generous. Phase 3 plan called for tightening to `py-16 lg:py-24` and reducing header margin from `mb-12` to `mb-8`.

### 5. CommunityHero featured story bottom padding
Still `py-16 lg:py-24` (symmetric). Plan called for asymmetric: `pt-16 lg:pt-24 pb-10 lg:pb-16` to tighten transition to StatStrip.

### 6. Mobile scroll gradient in SocialFeed is too subtle
The fade edge is `w-16` -- plan called for `w-24` with stronger opacity.

---

## Implementation Plan

### File 1: `src/pages/Community.tsx`
- Import `StoryFilters` component and `useState` from React
- Add state for `selectedProduct`, `selectedType`, `selectedGender`, `sortBy` (all defaulting to `"all"` / `"recent"`)
- Place `<StoryFilters>` between `<StatStrip />` and `<StoryGrid />`
- Pass state to both components

### File 2: `src/components/community/StoryCard.tsx`
- Change `spanClass` for "large" from `"row-span-2 md:col-span-2"` to `"md:row-span-2 md:col-span-2"` -- removes mobile row-span doubling
- Change `spanClass` for "wide" from `"md:col-span-2"` to `"md:col-span-2"` (no change needed here)

### File 3: `src/components/community/SocialFeed.tsx`
- Reduce section padding from `py-20 lg:py-28` to `py-16 lg:py-24`
- Reduce header margin from `mb-12` to `mb-8`
- Increase mobile gradient fade width from `w-16` to `w-24`

### File 4: `src/components/community/CommunityHero.tsx`
- Change featured story section padding from `py-16 lg:py-24` to `pt-16 lg:pt-24 pb-10 lg:pb-16`

---

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `src/pages/Community.tsx` | Wire up StoryFilters with state | Low |
| `src/components/community/StoryCard.tsx` | Fix mobile row-span | Low -- CSS only |
| `src/components/community/SocialFeed.tsx` | Tighten spacing, improve mobile gradient | Low -- CSS only |
| `src/components/community/CommunityHero.tsx` | Asymmetric featured story padding | Zero risk |

## What Does NOT Change
- StoryGrid.tsx -- already has adaptive columns logic working
- SubmitStoryCTA -- untouched (world-class)
- StoryModal -- untouched (accessibility fixed)
- No new dependencies
- No database changes
- Brand colors locked (amber-500, stone-950)

