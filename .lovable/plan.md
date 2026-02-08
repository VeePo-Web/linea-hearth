

# Lion Positioning Correction + Shadow Reduction
## Quick Fix: Opposite Direction + Cleaner Glow

---

## Part 1: The Problem

### What Went Wrong

I assumed the lion graphic was in the **upper** portion of the hoodie image, so I used `objectPosition: "center 65%"` to push the image DOWN.

**But the lion is actually in the LOWER portion of the image.**

Using `65%` made it WORSE by pushing the lion even further out of frame (below the viewport).

### The Fix

Change from `center 65%` to `center 35%` or `center 40%` - this will push the image UP, bringing the lion INTO the center of the viewport.

| Value | Effect |
|-------|--------|
| `center 50%` | Default center (no shift) |
| `center 65%` | Push focal point DOWN (shows more top) - **WRONG** |
| `center 35%` | Push focal point UP (shows more bottom) - **CORRECT** |

---

## Part 2: Implementation

### A. Fix Lion Position

**File:** `src/pages/LandingPage.tsx` (line 111)

```tsx
// Before (WRONG - pushing image down)
objectPosition: "center 65%",

// After (CORRECT - pushing image up to show lion)
objectPosition: "center 35%",
```

The `35%` value means the focal point is 35% from the top, which will shift the image UP, revealing more of the bottom where the lion graphic is located.

---

### B. Reduce Text Glow/Shadow

**File:** `src/index.css` (lines 675-680)

The current text glow has 3 layers that may be too heavy:

```css
/* Current - too much shadow */
.text-brand-glow {
  text-shadow: 
    0 0 150px hsla(0 0% 100% / 0.08),
    0 0 80px hsla(0 0% 100% / 0.05),
    0 0 40px hsla(0 0% 100% / 0.03);
}

/* New - cleaner, more subtle */
.text-brand-glow {
  text-shadow: 
    0 0 80px hsla(0 0% 100% / 0.05),
    0 0 30px hsla(0 0% 100% / 0.02);
}
```

**Changes:**
- Remove the largest 150px outer glow entirely
- Reduce the middle glow from 80px/0.05 to 80px/0.05 (keep)
- Reduce the inner glow from 40px/0.03 to 30px/0.02
- Result: Cleaner, less hazy text with subtle emanation

---

## Part 3: Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/pages/LandingPage.tsx` | 111 | `objectPosition: "center 65%"` → `"center 35%"` |
| `src/index.css` | 675-680 | Reduce text-shadow layers, smaller radii, lower opacity |

---

## Part 4: Before/After

| Element | Before | After |
|---------|--------|-------|
| Lion position | Below viewport (wrong direction) | Centered in viewport |
| Text glow | 3 heavy layers (150/80/40px) | 2 subtle layers (80/30px) |
| Overall feel | Lion hidden, text hazy | Lion visible, text crisp |

---

## Part 5: Success Criteria

After this fix:

1. The lion graphic should be **visible and centered** in the viewport
2. The brand text should have a **subtle glow** but not feel hazy or blurry
3. The overall darkness and mystery should remain intact
4. All animations continue working unchanged

