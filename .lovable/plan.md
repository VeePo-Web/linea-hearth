

# Subtle Readability Boost: Exodus 28:2 Verse Text

## Problem

The verse quote ("for glory and for beauty") and the "Exodus 28:2" reference are slightly hard to read at their current size and opacity. The text needs a subtle bump in presence without breaking the atmospheric, archival aesthetic.

## Current Values

| Element | Size | Color/Opacity | Weight |
|---------|------|---------------|--------|
| Core verse (`.verse-core`) | `0.75rem` mobile / `0.85rem` desktop (inline Tailwind) | `hsla(38 25% 75% / 0.55)` via `.verse-archival` | 300 |
| Reference (`.verse-reference-archival`) | `0.5rem` | `hsla(38 20% 65% / 0.4)` | 400 |

Both are too small and too transparent for comfortable reading, especially on lower-contrast displays.

## The Fix

Surgical, subtle adjustments -- no layout changes, no structural changes. Just enough to cross the readability threshold while keeping the quiet, archival mood.

### A. Core Verse Quote -- Bump size and opacity

**File:** `src/pages/LandingPage.tsx` (line 190)

Change inline Tailwind classes from:
```
text-[0.75rem] md:text-[0.85rem]
```
to:
```
text-[0.8rem] md:text-[0.9rem]
```

This is a +0.05rem bump on each breakpoint -- barely perceptible visually but crosses the legibility threshold.

**File:** `src/index.css` (line 1286) -- `.verse-archival` color

Change from:
```css
color: hsla(38 25% 75% / 0.55);
```
to:
```css
color: hsla(38 25% 78% / 0.62);
```

Slightly brighter lightness (75% to 78%) and opacity (0.55 to 0.62). The text gains presence without looking "bright" -- it shifts from ghostly to confidently quiet.

### B. "Exodus 28:2" Reference -- Bump size and opacity

**File:** `src/index.css` (line 1296-1297) -- `.verse-reference-archival`

Change from:
```css
font-size: 0.5rem;
color: hsla(38 20% 65% / 0.4);
```
to:
```css
font-size: 0.55rem;
color: hsla(38 20% 68% / 0.48);
```

+0.05rem size, +3% lightness, +0.08 opacity. The reference becomes legible without competing with the verse quote above it.

## Summary of Changes

| File | Line | What Changes |
|------|------|-------------|
| `src/pages/LandingPage.tsx` | 190 | Tailwind font sizes: `0.75/0.85rem` to `0.8/0.9rem` |
| `src/index.css` | 1286 | `.verse-archival` color: opacity `0.55` to `0.62`, lightness `75%` to `78%` |
| `src/index.css` | 1296-1297 | `.verse-reference-archival` size: `0.5rem` to `0.55rem`, color opacity `0.4` to `0.48` |

Three micro-adjustments. The verse goes from "squint to read" to "reads effortlessly" while staying whisper-quiet and archival.

