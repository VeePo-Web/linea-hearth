

# Hero Text Rendering Fix - Comprehensive Plan

## Problem Diagnosis

Based on my analysis, the text appearing "messed up and behind itself" on your Mac screen is caused by a combination of three interacting issues:

### Root Cause #1: 3D Transform Without Perspective Context
The `CharacterReveal` component uses `rotateX: -60` (a 3D rotation) but lacks a `perspective` property on the parent container. On Mac Retina displays, WebKit (Safari) and Chrome render 3D transforms differently when perspective is undefined—characters can literally appear to rotate "behind" each other.

### Root Cause #2: Aggressive Typography + Transform Collision
The hero text uses:
- `tracking-[-0.04em]` (negative letter spacing)
- `leading-[0.85]` (tight line height)
- Each character wrapped in `display: inline-block` with individual transforms

When characters are mid-animation with different delays, some are at `y: 40` and `rotateX: -60` while others are at `y: 0` and `rotateX: 0`. Combined with negative letter spacing, they visually overlap and appear "behind themselves."

### Root Cause #3: Missing Transform Style Declaration
The animated character spans don't declare `transform-style: preserve-3d`, causing Safari/Mac to flatten the 3D space and stack characters incorrectly during animation.

### Console Warning Clue
The Framer Motion warning about "non-static position" on containers confirms the scroll-linked animations are measuring incorrectly, which can compound rendering issues.

---

## The Fix Strategy

**Swedish Design Principle Applied**: Restraint over decoration—simplify the 3D effect while preserving the editorial drama.

**032c/DAZED Reference**: These magazines use bold type reveals but keep them 2D on screen; the "drama" comes from timing, not geometry.

### Fix Overview

| Issue | Fix | Impact |
|-------|-----|--------|
| Missing perspective | Add `perspective: 1000px` to parent | Characters render in proper 3D space |
| Missing transform-style | Add `transform-style: preserve-3d` | 3D hierarchy maintained during animation |
| Aggressive rotateX | Reduce from -60 to -15 degrees | Less dramatic, but stable across browsers |
| Character stacking | Add `will-change: transform` | GPU layer hint for smoother rendering |
| No backface control | Add `backface-visibility: hidden` | Prevents "seeing through" flipped characters |

---

## Implementation Details

### File 1: `src/components/motion/CharacterReveal.tsx`

**Current Code (problematic):**
```tsx
<motion.span
  style={{
    display: "inline-block",
    whiteSpace: char === " " ? "pre" : "normal",
  }}
  variants={{
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -60,  // ← Too aggressive
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      // ...
    },
  }}
>
```

**Fixed Code:**
1. Add `perspective: 1000px` and `transformStyle: "preserve-3d"` to the parent wrapper
2. Reduce `rotateX` from `-60` to `-15` (still dramatic, but browser-stable)
3. Add `willChange: "transform, opacity"` for GPU optimization
4. Add `backfaceVisibility: "hidden"` to prevent character "bleed-through"

**Specific Changes:**

```tsx
// Line 34-38: Add perspective to parent wrapper
<motion.span
  ref={ref}
  style={{ 
    display: "inline-block",
    perspective: "1000px",  // NEW: 3D rendering context
    transformStyle: "preserve-3d",  // NEW: maintain 3D hierarchy
  }}
  initial="hidden"
  animate={isInView ? "visible" : "hidden"}
>

// Line 41-67: Update character span styles and variants
{characters.map((char, index) => (
  <motion.span
    key={index}
    style={{
      display: "inline-block",
      whiteSpace: char === " " ? "pre" : "normal",
      willChange: "transform, opacity",  // NEW: GPU hint
      backfaceVisibility: "hidden",  // NEW: prevent bleed-through
    }}
    variants={{
      hidden: {
        opacity: 0,
        y: 30,        // REDUCED from 40
        rotateX: -15, // REDUCED from -60 (major fix)
      },
      visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 120,  // Slightly increased for snappier feel
          damping: 14,     // Slightly increased for less bounce
          delay: delay + index * staggerDelay,
        },
      },
    }}
  >
    {char}
  </motion.span>
))}
```

---

### File 2: `src/components/homepage/EditorialHero.tsx`

**Issue**: The content container uses `useTransform` for opacity but the parent section doesn't have `position: relative` explicitly set (Tailwind's `relative` is there, but the Framer warning suggests measurement issues).

**Fix**: Add explicit positioning context for scroll measurement.

```tsx
// Line 25-28: Ensure container has position for scroll calculation
<section 
  ref={containerRef}
  className="relative w-full min-h-screen bg-foreground overflow-hidden hero-noise group"
  style={{ position: "relative" }}  // Explicit fallback for Framer scroll tracking
>
```

---

### File 3: `src/index.css`

**Typography Breathing Room Adjustment**

The `text-hero-massive` class is currently:
```css
.text-hero-massive {
  @apply text-[18vw] md:text-[14vw] lg:text-[12vw] font-extralight tracking-[-0.04em] leading-[0.85];
}
```

**Adjustment for Mac rendering stability:**
```css
.text-hero-massive {
  @apply text-[18vw] md:text-[14vw] lg:text-[12vw] font-extralight tracking-[-0.02em] leading-[0.88];
  /* Slightly looser letter-spacing (-0.02 vs -0.04) and line-height (0.88 vs 0.85) */
  /* Still tight and editorial, but gives characters room during animation */
  transform-style: preserve-3d;  /* CSS fallback for 3D context */
  -webkit-font-smoothing: antialiased;  /* Consistent Mac text rendering */
}

.text-hero-massive-mobile {
  @apply text-[22vw] font-extralight tracking-[-0.02em] leading-[0.85];
  transform-style: preserve-3d;
  -webkit-font-smoothing: antialiased;
}
```

---

## Visual Comparison: Before vs After

```text
BEFORE (problematic):
┌────────────────────────────────────────────────┐
│   W E A R                                      │
│  ▒▒▒A▒R▒                   ← Characters        │
│   (characters "behind" each other)             │
│                                                │
│   Y O U R                                      │
│  ▒O▒U▒R▒                   ← Text "ghosting"   │
│                                                │
│   F A I T H .                                  │
└────────────────────────────────────────────────┘

AFTER (fixed):
┌────────────────────────────────────────────────┐
│   W E A R                                      │
│                            ← Clean reveal      │
│                                                │
│           Y O U R                              │
│                            ← Offset intact     │
│                                                │
│   F A I T H .              ← Accent color      │
└────────────────────────────────────────────────┘
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/components/motion/CharacterReveal.tsx` | Add perspective, reduce rotateX, add will-change, add backface-visibility |
| `src/components/homepage/EditorialHero.tsx` | Add explicit position style for scroll measurement |
| `src/index.css` | Loosen letter-spacing slightly, add transform-style and font-smoothing |

---

## Acceptance Criteria

- [ ] Hero text "WEAR YOUR FAITH." renders cleanly on Mac Safari
- [ ] Hero text "WEAR YOUR FAITH." renders cleanly on Mac Chrome
- [ ] Character reveal animation still has editorial drama
- [ ] No visual regression on Windows/PC browsers
- [ ] Console warning about "non-static position" is resolved
- [ ] Animation respects `prefers-reduced-motion` (already implemented)

---

## Performance Impact

- **Zero new dependencies**
- **Reduced paint complexity** (less aggressive 3D transforms)
- **GPU optimization** via `will-change` hint
- **Lighthouse score**: Expected improvement due to less layout thrashing during animation

---

## Fallback Safety

If any rendering issues persist after these changes, the `useReducedMotion` hook already provides a graceful fallback that renders static text without any transforms—ensuring the hero is always readable.

