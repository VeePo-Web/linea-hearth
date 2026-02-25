

# Update CTA Buttons from Warm Platinum to Forest Green

## Problem
Six hardcoded `hsl(30,5%,72%)` warm platinum values remain across 4 files. These power the primary CTA buttons and one large CTA block background. They need to become forest green for full brand cohesion with the new silver + forest green accent system.

## Color Mapping
- `bg-[hsl(30,5%,72%)]` (warm platinum) becomes `bg-forest-500` (`hsl(152, 35%, 30%)`)
- `hover:bg-[hsl(30,5%,78%)]` becomes `hover:bg-forest-400` (`hsl(152, 25%, 55%)`)
- `active:bg-[hsl(30,5%,78%)]` becomes `active:bg-forest-400`
- Text on forest green: `text-white` (high contrast) instead of `text-black`

## Changes by File

### 1. HeroBlock.tsx (line 80)
- **Button**: "Shop the Collection"
- Replace `bg-[hsl(30,5%,72%)] hover:bg-[hsl(30,5%,78%)] text-black` with `bg-forest-500 hover:bg-forest-400 text-white`

### 2. MobileStickyBar.tsx (line 58)
- **Button**: "Shop Bestsellers" (mobile sticky)
- Replace `bg-[hsl(30,5%,72%)] hover:bg-[hsl(30,5%,78%)] active:bg-[hsl(30,5%,78%)] text-black` with `bg-forest-500 hover:bg-forest-400 active:bg-forest-400 text-white`

### 3. EmailOptIn.tsx (line 296)
- **Button**: "ENLIST NOW" (mobile variant)
- Replace `bg-[hsl(30,5%,72%)] hover:bg-[hsl(30,5%,78%)] text-background` with `bg-forest-500 hover:bg-forest-400 text-white`

### 4. WearTheMissionCTA.tsx (2 locations)
- **Line 40** (gradient overlay): Replace `to-[hsl(30,5%,72%)]` with `to-forest-500`
- **Line 49** (CTA block background): Replace `bg-[hsl(30,5%,72%)]` with `bg-forest-500`
- The buttons inside this block (lines 96-116) already use `bg-stone-950` and `border-stone-950` -- these stay unchanged as they contrast well against the new forest green background

## Result
All primary CTA buttons shift from a warm beige/platinum to a rich forest green, creating stronger conversion contrast against the dark stone backgrounds while maintaining the luxury feel. The forest green reads as confident, editorial, and on-brand -- far more premium than warm beige on dark backgrounds.
