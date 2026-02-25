

# About Page -- Full Dark Colorway Conversion

## Objective

Convert the Our Story page to a consistent black background (`bg-stone-950`) with white text throughout all 8 sections. Currently, sections 02 (StoryCallingSection), 04 (FounderLetter), and 07 (StoryWorldwideTribe) use light backgrounds (`bg-stone-50`). These three sections will be converted to dark while maintaining visual hierarchy and separation between sections.

---

## Current State

| Section | Component | Current BG | Status |
|---------|-----------|------------|--------|
| 01 Hero | StoryHero | `bg-stone-950` | Already dark |
| 02 Calling | StoryCallingSection | `bg-stone-50` | Needs conversion |
| 03 Origin | OriginStory | `bg-stone-950` | Already dark |
| 04 Founder Letter | FounderLetter | `bg-stone-50` | Needs conversion |
| 05 Values | StoryValuesGrid | `bg-stone-950` | Already dark |
| 06 Impact | ImpactMap | `bg-stone-950` | Already dark |
| 07 Tribe | StoryWorldwideTribe | `bg-stone-50` | Needs conversion |
| 08 CTA | StoryJoinCTA | `bg-stone-950` | Already dark |

---

## Changes Per Section

### Section 02: StoryCallingSection
- Background: `bg-stone-50` to `bg-stone-950`
- Text colors: `text-stone-950` to `text-white`, `text-stone-700` to `text-white/70`, `text-stone-500` to `text-white/50`
- Watermark: `text-stone-950/10` to `text-white/10`
- Giant quotation mark: `text-amber-500/10` to `text-amber-500/10` (stays)
- Rotated vertical text: `text-stone-950/20` to `text-white/20`
- Accent line remains amber

### Section 04: FounderLetter
- Background: `bg-stone-50` to `bg-stone-950`
- Quote text: `text-stone-950` to `text-white`
- Secondary text: `text-stone-500` to `text-white/50`
- Italic accent: `text-stone-950` to `text-white`
- Watermark: `text-stone-950` to `text-white`
- Signature name: `text-stone-950` to `text-white`
- Signature title: `text-stone-400` to `text-white/40`
- Bio text: `text-stone-500` to `text-white/50`, `text-stone-950` to `text-white`
- Giant quotation mark: `text-amber-500/15` stays (works on dark)

### Section 07: StoryWorldwideTribe
- Background: `bg-stone-50 text-stone-950` to `bg-stone-950 text-white`
- Watermark: `text-stone-950/10` to `text-white/10`
- Subtitle: `text-stone-500` to `text-white/50`
- Border: `border-stone-200` to `border-white/10`
- CTA text: `text-stone-500` to `text-white/50`, `text-stone-950` to `text-white`
- Button: `border-stone-950 text-stone-950 hover:bg-stone-950 hover:text-white` to `border-white text-white hover:bg-white hover:text-stone-950`
- Instagram badge already dark-compatible

### Section Separation Strategy
With all sections now dark, visual separation comes from:
- Existing amber separator lines (already in OurStory.tsx between 05 and 06)
- Add similar thin amber separators between sections 01-02, 02-03, 03-04, 04-05, 06-07, 07-08
- Each section's unique visual density (massive type vs grid vs image) provides natural rhythm
- Varying padding and content styles already create distinct "spreads"

### OurStory.tsx
- Add thin amber line separators between each section transition for visual breathing
- These are subtle 1px amber lines (`w-24 h-px bg-amber-500/40`) centered between sections

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/about/StoryCallingSection.tsx` | Dark colorway conversion |
| `src/components/about/FounderLetter.tsx` | Dark colorway conversion |
| `src/components/about/StoryWorldwideTribe.tsx` | Dark colorway conversion |
| `src/pages/about/OurStory.tsx` | Add amber separators between all sections |

---

## Visual Result

The entire About page becomes a single continuous dark editorial scroll -- like a DAZED or 032c magazine spread printed on black stock. The amber accent color and white typography create the contrast. Section separation is handled by content density changes, padding variation, and subtle amber hairline dividers rather than background color flips. This is the more premium, editorial-correct approach -- luxury fashion magazines rarely flip between black and white backgrounds mid-feature.

