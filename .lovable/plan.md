

# Fix Legacy Gold in FreeShippingBar.tsx

## Problem
Three hardcoded `hsl(45, ...)` gold values remain in `FreeShippingBar.tsx` -- the last remnants of the old tacky yellow palette. These control the progress bar gradient and celebration glow overlay.

## Changes (1 file, 3 locations)

### Location 1: Progress gradient (lines 68-71)
Replace the gold gradient with forest green tones:
- **90%+ tier**: `hsl(45, 40%, 72%)` and `hsl(45, 30%, 52%)` become `hsl(152, 25%, 55%)` and `hsl(152, 35%, 30%)` (light-to-dark forest green)
- **Default tier**: `hsl(45, 20%, 28%)` and `hsl(45, 30%, 52%)` become `hsl(152, 30%, 18%)` and `hsl(152, 35%, 30%)` (deep forest to medium forest)

### Location 2: Celebration glow (line 118)
Replace `hsl(45, 30%, 52%, 0.2)` with `hsl(152, 35%, 30%, 0.2)` -- forest green glow instead of gold glow.

### Location 3: Text colors (lines 147, 149)
Replace `text-champagne-500` and `text-champagne-600` with `text-forest-400` and `text-forest-500` so the "Almost there" messaging uses forest green instead of silver (matching the progress bar's new color).

## Result
The free shipping progress bar transitions through shades of forest green instead of warm gold, creating full palette consistency with the site's new silver + forest green accent system. The unlocked state already uses `--primary` (unchanged). Only the in-progress states needed updating.

