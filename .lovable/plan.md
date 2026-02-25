

# Accent Color Enhancement: Add Forest Green as Secondary Accent

## Current State
The champagne palette was already migrated from tacky gold to silver/platinum in the previous update. The `--accent` CSS variable is currently `0 0% 62%` (neutral silver). This silver is working well site-wide.

## What the User Wants
Keep silver as the **primary accent** but introduce **classic forest green** `hsl(152, 35%, 30%)` as a secondary accent for select highlight moments -- adding depth and richness to the palette without losing the chrome luxury feel.

## The Two Colors

**1. Silver Chrome (primary -- already in place)**
- The champagne palette: neutral silver tones
- `--accent: 0 0% 62%`
- Used for: most labels, eyebrow text, star ratings, hover states, borders

**2. Classic Forest Green (new secondary accent)**
- `hsl(152, 35%, 30%)` -- deep, editorial, luxurious
- Used for: hero keyword moments ("FAITH."), select section highlights, period punctuation accents
- This pairs naturally with the silver like a high-end brand palette (think Rolex green + silver)

## Implementation Plan

### Step 1: Add Forest Green to Tailwind Config
Add a `forest` color scale in `tailwind.config.ts` alongside champagne:

```text
forest: {
  50:  hsl(152, 25%, 95%)
  100: hsl(152, 25%, 88%)
  200: hsl(152, 28%, 75%)
  300: hsl(152, 30%, 58%)
  400: hsl(152, 33%, 42%)
  500: hsl(152, 35%, 30%)   <-- primary forest green
  600: hsl(152, 38%, 24%)
  700: hsl(152, 40%, 18%)
  800: hsl(152, 35%, 12%)
  900: hsl(152, 30%, 8%)
}
```

### Step 2: Update CSS `--accent` to Forest Green
Change the `--accent` variable to forest green so that all `text-accent` usage (the hero "FAITH." word, eyebrow labels, hover states) shifts from silver to forest green:

```text
--accent: 152 35% 30%    (was: 0 0% 62%)
--accent-foreground: 0 0% 98%
```

This is the highest-impact single change -- it transforms the "FAITH." word on the hero, section eyebrow text on MissionBlock, hover states on DropGrid links, and star ratings on MarqueeStrip all in one move.

### Step 3: Keep Silver Where It Belongs
The `champagne-*` utility classes (already silver) remain untouched. These are used for:
- Section number labels (`text-champagne-500`)
- Period dot accents (`text-champagne-500`)
- Subtle text treatments, borders, muted accents

Silver stays as the quiet, structural accent. Forest green becomes the bold, editorial accent for words and CTAs that need to pop.

### Step 4: Update the Warm Tan CTA Buttons (Optional)
The 4 button files that currently use `bg-[hsl(30,5%,72%)]` (warm platinum) could optionally shift to forest green for stronger CTA contrast:
- `HeroBlock.tsx` -- "Shop the Collection"
- `EmailOptIn.tsx` -- "ENLIST NOW"
- `MobileStickyBar.tsx` -- Mobile sticky CTA
- `WearTheMissionCTA.tsx` -- Mission CTA block

However, the current warm platinum is working well and the user said "do not change anything else." So these stay as-is unless requested.

## Files Changed

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add `forest` color scale (10 shades) |
| `src/index.css` | `--accent: 0 0% 62%` becomes `--accent: 152 35% 30%` (root + dark) |

**Total: 2 files, ~15 lines changed.**

## Cascade Effect
Changing `--accent` automatically updates these components (no file edits needed):
- **EditorialHero** -- "FAITH." word turns forest green (both mobile + desktop)
- **MissionBlock** -- "Our Mission" eyebrow label turns forest green
- **TestimonySpotlight** -- "From the tribe" label + quote text
- **MarqueeStrip** -- Star ratings fill with forest green
- **DropGrid** -- Product name hover color
- **FeaturedDrop** -- CTA hover color
- Any other component using `text-accent` or `bg-accent`

The silver `champagne-*` classes used across ~97 files remain completely unchanged.

## What Does NOT Change
- No words, copy, or content
- No layout, spacing, or design structure
- No animations or motion
- No component architecture
- The landing page chrome treatment (uses `.text-chrome`, not `text-accent`)
- Silver champagne palette (structural accents stay silver)
- CTA button colors (warm platinum stays)
- Desktop/mobile behavior

## Result
The site gets a two-tone luxury palette: **silver chrome** for structural/quiet accents + **forest green** for bold editorial moments. This reads like a premium brand palette (Rolex, Bottega Veneta) rather than a single-color template theme.
