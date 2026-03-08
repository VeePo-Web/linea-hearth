

# Navigation Bar: Full Audit Results and Remaining Fixes

## What Was Already Fixed (Previous Diff)
- Community page: StoryFilters bar removed, `immersiveHero` removed -- content now clears header correctly
- Header animation: Spring replaced with editorial tween (0.4s, custom ease)
- Scroll threshold: Increased from 50 to 80 to prevent micro-scroll flickering

## Issue Found: Lookbook Page Regression

The previous change to Lookbook.tsx introduced a bug by switching `marginTop` to `paddingTop`. Here's why:

The Lookbook uses a **custom scroll container** (not `<Layout>`). Its `height` is set to `calc(100dvh - var(--header-height))`. With `marginTop`, the container is positioned below the fixed header and sized correctly. With `paddingTop`, the container starts behind the header and the internal padding eats into the already-reduced height, effectively stealing ~100px from the bottom of the page.

**Fix:** Revert `paddingTop` back to `marginTop` on the Lookbook scroll container. The original `marginTop` was correct -- the scroll container already starts below the header, so no content overlaps.

### File: `src/pages/Lookbook.tsx`
- Line 187: Change `paddingTop: 'var(--header-height)'` back to `marginTop: 'var(--header-height)'`

## Full Audit: All Pages Checked

| Page | Header Approach | Status |
|------|----------------|--------|
| `/` (Landing) | No header, no Layout | OK -- cinematic portal, no nav |
| `/home` (Index) | Layout + `immersiveHero` | OK -- header hidden until scroll-up, hero is full-bleed |
| `/community` | Layout (standard) | OK after previous fix -- `immersiveHero` removed, hero has `pt-20 lg:pt-0` + Layout padding |
| `/lookbook` | Raw `<Header />` + custom scroll | NEEDS FIX -- revert `paddingTop` to `marginTop` |
| `/about/our-story` | Layout (standard) | OK -- `pt-[var(--header-height)]` applied |
| `/category/:slug` | Layout (standard) | OK |
| `/product/:slug` | Layout (standard) | OK |
| `/checkout` | CheckoutHeader (different component) | OK -- separate header system |
| `/contact`, `/faq`, `/returns`, `/shipping` | ServicePageLayout | OK -- has its own header offset |
| `/ambassador` | Layout (standard) | OK |
| `/try-on` | Raw `<Header />` + `pt-[var(--header-height)]` | OK |
| Legal pages | LegalPageLayout | OK -- uses `pt-[calc(var(--header-height)+2rem)]` |

## Header Animation Quality Check

The current tween config is correct:
```
type: "tween"
duration: 0.4
ease: [0.25, 0.46, 0.45, 0.94]
```

This matches the project's `editorialEase` standard documented in animation-standards memory. No further changes needed.

## Summary

Only one fix needed: revert the Lookbook `paddingTop` back to `marginTop`. Everything else is working correctly after the previous changes.

