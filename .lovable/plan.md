

# About Page -- Strategic White Contrast Sections

## Current State

The Our Story page has 8 consecutive dark (`bg-stone-950`) sections with amber dividers between them. While atmospheric, this creates the same "dark fatigue" problem the homepage had before adding white breathers. Every section blends into the next -- the eye has no reset point.

The homepage now uses a 70/30 dark-to-light ratio with 3 white sections (ValueStackBanner, FeaturedCollection, TestimonySpotlight). The About page needs the same editorial rhythm: 1-2 strategic "bright page turns."

---

## Which Sections Stay Dark (No Change)

These are atmospheric/cinematic and must remain dark:

- **StoryHero** (01) -- cinematic full-bleed opener, dark is essential
- **StoryCallingSection** (02) -- giant quotation mark + scripture, needs dark gravity
- **OriginStory** (03) -- lion SVG animation on dark, amber accents need dark canvas
- **ImpactMap** (06) -- map dots + animated counters, dark creates dashboard feel
- **StoryWorldwideTribe** (07) -- grayscale gallery with hover color reveal, needs dark
- **StoryJoinCTA** (08) -- closing CTA with model image, dark for finality

---

## Which Sections Become White (2 Sections)

### 1. FounderLetter (Section 04) -- White Pull-Quote Page

**Why:** This is the emotional center of the page -- a founder's personal confession. In magazines like i-D and DAZED, the most powerful pull quotes always sit on white spreads. The contrast makes the words feel more vulnerable, more real, more intimate. A white page after three dark sections is a "page turn" moment that demands attention.

**Changes:**
- Section background: `bg-stone-950` becomes `bg-white`
- Giant quotation mark: `text-amber-500/15` stays (amber on white reads beautifully)
- Main quote text: `text-white` becomes `text-stone-950`
- Sub-text: `text-white/50` becomes `text-stone-500`
- Italic emphasis: `text-white` becomes `text-stone-950`
- Signature line dividers: `bg-amber-500` stays
- Signature name: `text-white` becomes `text-stone-950`
- Title beneath name: `text-white/40` becomes `text-stone-400`
- Bio text: `text-white/50` becomes `text-stone-500`
- Bio emphasis: `text-white font-medium` becomes `text-stone-950 font-medium`
- Index watermark: `text-white` at 3% opacity becomes `text-stone-950` at 3% opacity

### 2. StoryValuesGrid (Section 05) -- White Manifesto Spread

**Why:** The values/doctrine section is a "text-heavy" spread -- three columns of manifesto content. White backgrounds with dark text maximize readability for dense copy. This is the "editorial text page" pattern from 032c: clean white field, massive index numbers, tight typography. It also creates a two-section white "island" (04 + 05) sandwiched between dark sections -- exactly like a magazine opening to a bright double-page spread.

**Changes:**
- Section background: `bg-stone-950` becomes `bg-white`
- Grid pattern overlay: `rgba(255,255,255,0.1)` becomes `rgba(0,0,0,0.04)` (subtle dark grid on white)
- Section eyebrow: `text-amber-500` stays
- Section heading: `text-white` becomes `text-stone-950`, amber period stays
- Index watermark: `text-white/20` becomes `text-stone-950/10`
- Giant index numbers (01/02/03): `text-white/5` becomes `text-stone-200`, hover `text-amber-500/10` becomes `text-amber-500/20`
- Value titles: `text-white` becomes `text-stone-950`
- Value descriptions: `text-white/50` becomes `text-stone-500`
- Accent lines: `bg-amber-500/30` stays (amber on white reads well)

---

## Resulting About Page Rhythm

```text
[DARK]  StoryHero (01) -- cinematic opener
[DARK]  StoryCallingSection (02) -- giant scripture quote
[DARK]  OriginStory (03) -- lion animation + brand name origin
[WHITE] FounderLetter (04) -- intimate pull-quote, "page turn"
[WHITE] StoryValuesGrid (05) -- manifesto text spread
[DARK]  ImpactMap (06) -- stats dashboard + map
[DARK]  StoryWorldwideTribe (07) -- photo gallery
[DARK]  StoryJoinCTA (08) -- closing call-to-action
```

Three dark, two white, three dark. A clean A-B-A structure.

---

## Divider Updates

The amber dividers between sections 03-04 and 05-06 need background color adjustments since they border white sections:

- Divider between OriginStory (dark) and FounderLetter (white): change `bg-stone-950` to `bg-white` (matches the section it leads into)
- Divider between FounderLetter (white) and StoryValuesGrid (white): keep or change to `bg-white` (both sides are white)
- Divider between StoryValuesGrid (white) and ImpactMap (dark): change `bg-stone-950` stays (matches the section it leads into)

Actually, the simplest approach: remove the dividers between 03-04, 04-05, and 05-06 entirely. The dark-to-white and white-to-dark transitions ARE the dividers. The color shift itself creates the separation. Amber hairlines between same-color sections make sense; between contrasting sections they add unnecessary noise.

---

## Technical Implementation

### File 1: `src/components/about/FounderLetter.tsx`
- Line 12: `bg-stone-950` becomes `bg-white`
- Line 22: watermark `text-white` becomes `text-stone-950`
- Line 44: quote `text-white` becomes `text-stone-950`
- Line 47: sub-text `text-white/50` becomes `text-stone-500`
- Line 50: italic `text-white` becomes `text-stone-950`
- Line 66: signature name `text-white` becomes `text-stone-950`
- Line 70: title `text-white/40` becomes `text-stone-400`
- Line 79: bio `text-white/50` becomes `text-stone-500`
- Line 83: bio emphasis `text-white font-medium` becomes `text-stone-950 font-medium`

### File 2: `src/components/about/StoryValuesGrid.tsx`
- Line 29: `bg-stone-950 text-white` becomes `bg-white text-stone-950`
- Line 35-36: grid pattern `rgba(255,255,255,0.1)` becomes `rgba(0,0,0,0.04)`
- Line 42: watermark `text-white/20` becomes `text-stone-950/10`
- Line 62-63: heading, remove reliance on inherited text-white
- Line 82: giant numbers `text-white/5` becomes `text-stone-200`, hover `text-amber-500/10` becomes `text-amber-500/20`
- Line 88: titles `text-white` becomes `text-stone-950`
- Line 91: descriptions `text-white/50` becomes `text-stone-500`

### File 3: `src/pages/about/OurStory.tsx`
- Remove divider between OriginStory and FounderLetter (line 25)
- Remove divider between FounderLetter and StoryValuesGrid (line 27)
- Remove divider between StoryValuesGrid and ImpactMap (line 29)

### Scope
- 3 files modified
- Class name swaps only (no logic, no structure changes)
- Zero risk to dark sections

