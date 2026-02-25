

# Accent Color Migration: Champagne/Yellow to Silver Chrome + Warm Tan Glow

## The Problem
The current yellow-toned `champagne` accent color (hue 45, warm gold) reads as tacky rather than luxurious. The landing page already established the correct brand palette: **silver/chrome metallic** for "LINE OF JUDAH" and a **soft warm tan glow** (`hsla(45 55% 82%)`) for the "glory" and "beauty" words. The rest of the site needs to match.

## The Two Target Colors

**1. Silver Chrome (primary accent)** -- from `.text-chrome` on the landing page:
- Pure silver/platinum tones with zero or near-zero saturation
- Used for: eyebrow text, accent words, highlighted labels, borders, dividers, star ratings, active indicators

**2. Warm Tan Glow (secondary, used sparingly)** -- from `.glory-word` / `.beauty-word`:
- `hsla(45 55% 82% / 0.95)` -- a very light, refined warm champagne
- Used for: special highlight moments, button backgrounds where a warm CTA is needed (since pure silver buttons can feel cold)

## The Approach: Redefine the Champagne Palette

Instead of hunting through 97 files and changing individual class names, we **redefine the `champagne` color scale** in `tailwind.config.ts` to silver/platinum tones. This cascades the change across the entire site in one move.

We also update the CSS `--accent` variable in `src/index.css` to match.

### New `champagne` palette (silver/platinum):

```text
Current (warm gold)              -->  New (silver/platinum)
50:  hsl(45, 40%, 96%)           -->  hsl(0, 0%, 96%)
100: hsl(45, 40%, 90%)           -->  hsl(0, 0%, 91%)
200: hsl(45, 45%, 82%)           -->  hsl(220, 3%, 82%)
300: hsl(45, 40%, 72%)           -->  hsl(220, 3%, 72%)
400: hsl(45, 35%, 62%)           -->  hsl(220, 2%, 68%)
500: hsl(45, 30%, 52%)           -->  hsl(0, 0%, 62%)
600: hsl(45, 30%, 42%)           -->  hsl(0, 0%, 50%)
700: hsl(45, 25%, 35%)           -->  hsl(0, 0%, 40%)
800: hsl(45, 20%, 28%)           -->  hsl(0, 0%, 30%)
900: hsl(45, 15%, 15%)           -->  hsl(0, 0%, 16%)
```

The slight hue 220 at 2-3% saturation on the mid-tones gives a barely perceptible cool steel quality (like real silver) without looking blue. The 500 level at 62% lightness provides good contrast on dark backgrounds.

### CSS `--accent` variable update:

```text
Current: --accent: 45 30% 52%
New:     --accent: 0 0% 62%
```

And `--sidebar-ring` which also references champagne:
```text
Current: --sidebar-ring: 45 30% 52%
New:     --sidebar-ring: 0 0% 62%
```

## Special Cases: Warm CTA Buttons

A few components use champagne as a **button background** color (e.g., "Shop the Collection" CTA, mobile sticky bar, email opt-in submit). Pure silver as a button background can feel passive. For these ~4 button instances, we switch to the warm tan glow color family -- a refined, lighter tone that maintains CTA energy without the tacky gold:

- `bg-champagne-500` on buttons --> change to a warm silver: `bg-[hsl(30,5%,72%)]` with hover `bg-[hsl(30,5%,78%)]`
- This gives buttons a subtle warmth that reads as "platinum with warmth" rather than "cold gray"

### Files needing button-specific overrides (4 files):
1. **`src/components/homepage/HeroBlock.tsx`** (line 80) -- "Shop the Collection" CTA
2. **`src/components/homepage/EmailOptIn.tsx`** (line 296) -- "ENLIST NOW" button
3. **`src/components/homepage/MobileStickyBar.tsx`** (line 58) -- Mobile sticky CTA
4. **`src/components/about/WearTheMissionCTA.tsx`** (lines 49, 99, 111) -- Mission CTA block background and buttons

For these buttons, we replace `bg-champagne-500 hover:bg-champagne-400` with `bg-[hsl(30,5%,72%)] hover:bg-[hsl(30,5%,78%)]` (or define a new utility if preferred).

## Implementation Steps

### Step 1: `tailwind.config.ts` -- Redefine champagne palette to silver
- Change all 10 color stops from warm gold to silver/platinum tones
- This one change cascades to ~97 files automatically

### Step 2: `src/index.css` -- Update CSS variables
- Line 41: `--accent: 45 30% 52%` --> `--accent: 0 0% 62%`
- Line 72: `--sidebar-ring: 45 30% 52%` --> `--sidebar-ring: 0 0% 62%`
- Line 96: same for `.dark` block `--accent`

### Step 3: Button overrides (4 files)
- Replace champagne button backgrounds with warm platinum tone so CTAs still pop
- These are surgical, 1-2 line changes per file

## What Does NOT Change
- No words, copy, or content
- No layout, spacing, or design structure
- No animations or motion
- No component architecture
- The landing page (it already uses `.text-chrome` and glory/beauty colors -- untouched)
- Desktop/mobile behavior

## Result
Every accent that was warm gold/yellow becomes silver/platinum -- matching the chrome luxury aesthetic established on the landing page. CTA buttons get a subtle warm platinum that maintains conversion energy. The entire site reads as cohesive, royal, and luxurious.
