

# Mobile Grayscale Removal -- Show Images in Full Color on Touch Devices

## The Problem

Multiple sections across the site use a grayscale-to-color hover effect. On desktop, this is a polished editorial interaction. On mobile, users cannot hover, so images remain permanently desaturated -- making the site look washed out and reducing product desirability on the device where most traffic comes from.

## Affected Components (7 files, ~10 line changes)

### 1. `src/components/homepage/CategoryTiles.tsx` (line 211)
**Current:** `grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100`
**Fix:** `md:grayscale md:contrast-110 md:group-hover:grayscale-0 md:group-hover:contrast-100`
- Prefix `grayscale` and `contrast-110` with `md:` so they only apply at 768px+
- Keep `group-active:grayscale-0` and `group-active:contrast-100` for desktop tap fallback

### 2. `src/components/about/StoryWorldwideTribe.tsx` (lines 132-133)
**Current:** Conditional class `hoveredIndex === index ? "grayscale-0 scale-105" : "grayscale"`
**Fix:** Change the grayscale branch to only apply on md+. On mobile, always show full color. The simplest approach: use the `isMobile` pattern (component doesn't have it yet, but we can detect via a CSS-only approach using responsive prefixes, or import `useIsMobile`).
- Since this uses JS-driven hover state (not CSS `:hover`), we import `useIsMobile` and skip the grayscale class when `isMobile` is true.

### 3. `src/components/about/MinistryInMotion.tsx` (line 116)
**Current:** `grayscale group-hover:grayscale-0`
**Fix:** `md:grayscale md:group-hover:grayscale-0`

### 4. `src/components/about/BrandFilmHero.tsx` (line 162)
**Current:** `grayscale hover:grayscale-0`
**Fix:** `md:grayscale md:hover:grayscale-0`

### 5. `src/components/community/StoryCard.tsx` (line 72)
**Current:** `grayscale group-hover:grayscale-0`
**Fix:** `md:grayscale md:group-hover:grayscale-0`

### 6. `src/components/community/CommunityHero.tsx` (lines 214, 228)
**Current:** `grayscale group-hover:grayscale-0`
**Fix:** `md:grayscale md:group-hover:grayscale-0`

### 7. `src/components/community/SocialFeed.tsx` (line 181)
**Current:** `grayscale group-hover:grayscale-0`
**Fix:** `md:grayscale md:group-hover:grayscale-0`

## Approach

For 6 of the 7 components, the fix is a pure CSS class prefix swap -- adding `md:` before `grayscale` so it only activates at desktop breakpoint. No JS changes, no layout changes, no design changes.

For `StoryWorldwideTribe.tsx`, which uses JS-driven hover state for the grayscale toggle, we import `useIsMobile` and conditionally skip the grayscale class on mobile -- keeping images full color while preserving the desktop hover interaction.

## What Does NOT Change
- No words, copy, or content
- No layout, spacing, or design
- No desktop behavior (grayscale + hover reveal stays identical)
- No colors, fonts, or animations
- Only the grayscale filter is removed on screens below 768px

