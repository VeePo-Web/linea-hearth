

# About Page -- Next-Level Polish Pass

## Current State Assessment

The page has excellent editorial bones: 8 sections with a clean 3-2-3 (dark-white-dark) rhythm after the recent white contrast implementation. The foundation is world-class. This pass focuses on the surgical refinements that separate "very good" from "Fantasy.co-level."

---

## Issues Identified

### 1. Scroll Progress Bar Ignores White Sections
The `ScrollProgress` component uses a fixed `bg-white/5` track with `bg-amber-500/60` fill. When scrolling through the white FounderLetter and StoryValuesGrid sections, the white track disappears against white backgrounds. The bar needs to adapt.

### 2. FounderLetter Has No Section Eyebrow
Every other section follows the pattern: `text-[10px] tracking-[0.4em] text-amber-500` eyebrow label (e.g., "THE GENESIS", "OUR STORY", "THE NAME", "THE DOCTRINE"). FounderLetter (section 04) is the only one missing this. This breaks the system consistency.

### 3. StoryValuesGrid Mobile Layout is Cramped
The 3-column grid collapses to single column on mobile but the massive index numbers (80px on mobile) consume excessive vertical space before each value, creating a very long scroll with lots of dead space. The giant numbers need tighter mobile sizing.

### 4. OriginStory-to-FounderLetter Transition Has No Visual Bridge
The transition from dark OriginStory (03) to white FounderLetter (04) is an abrupt hard cut. While we removed the amber dividers (correct decision), the contrast jump needs a subtle gradient bridge -- a "fade to white" at the bottom of OriginStory that eases the eye into the white section.

### 5. StoryValuesGrid-to-ImpactMap Transition Also Needs a Bridge
Same issue: white section 05 cuts hard to dark section 06. A "fade to dark" at the bottom of StoryValuesGrid creates a cinematic transition rather than a jarring cut.

---

## Implementation Plan

### File 1: `src/components/about/ScrollProgress.tsx`
**Change:** Swap the track color from `bg-white/5` to `bg-stone-500/10` -- this reads on both dark and white backgrounds. A neutral mid-gray at low opacity is visible against stone-950 and against white.

- Line 16: Change `bg-white/5` to `bg-stone-500/10`

### File 2: `src/components/about/FounderLetter.tsx`
**Change:** Add the missing eyebrow label "THE LETTER" above the giant quotation mark, matching the exact pattern used in every other section.

- After line 22 (after the watermark), add a motion eyebrow element:
```tsx
<motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
  transition={{ duration: 0.8, delay: 0.3 }}
  className="absolute top-10 left-10 lg:top-12 lg:left-12 text-[10px] tracking-[0.4em] text-amber-500 z-10"
>
  THE LETTER
</motion.p>
```

### File 3: `src/components/about/StoryValuesGrid.tsx`
**Change:** Reduce mobile giant index numbers from `text-[80px]` to `text-[56px]` and reduce the negative margin-top from `-mt-12` to `-mt-6` on mobile. This tightens the vertical rhythm on small screens without losing the editorial impact.

- Line 82: Change `text-[80px]` to `text-[56px]`
- Line 87: Change `-mt-12` to `-mt-6` (keep `lg:-mt-16 xl:-mt-20` unchanged)

### File 4: `src/components/about/OriginStory.tsx`
**Change:** Add a gradient overlay at the bottom of the section that fades from `stone-950` to `white`, creating a smooth visual bridge into the white FounderLetter section.

- After the closing `</div>` of the main content container (before `</section>`), add:
```tsx
<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white z-20 pointer-events-none" />
```

### File 5: `src/components/about/StoryValuesGrid.tsx`
**Change:** Add a gradient overlay at the bottom that fades from `white` to `stone-950`, creating a smooth bridge into the dark ImpactMap section.

- Before the closing `</section>` tag, add:
```tsx
<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-stone-950 pointer-events-none z-20" />
```

---

## Resulting Improvements

- Scroll progress bar visible across all section backgrounds
- Consistent eyebrow labeling system across all 8 sections
- Tighter mobile layout for values section (less dead scroll space)
- Cinematic dark-to-white and white-to-dark transitions instead of hard cuts
- Zero structural changes, zero new dependencies

## Scope
- 4 files modified
- Small, surgical changes only
- No logic changes, no new components

