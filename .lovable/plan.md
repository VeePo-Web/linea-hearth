

# Landing Page Refinement: Lion-Centered Light + Balanced Atmosphere
## Less Dramatic, More Inviting, Lion as Focal Point

---

## Part 1: Current Issues Identified

| Problem | Current State | Impact |
|---------|---------------|--------|
| **Too dark** | Background opacity at 8%, brightness filter at 0.85 | Page feels bland and oppressive |
| **Vignette too harsh** | 60% black at 55% radius, 95% at edges | Creates tunnel vision, loses atmosphere |
| **Lion position** | `objectPosition: center 35%` | May still not be ideal - try 40% |
| **Glow misaligned** | Center glow at 50%/50% (dead center) | Should emanate FROM the lion, not generic center |
| **Overall bland** | Heavy processing flattens the image | Loses the hoodie's visual interest |

---

## Part 2: The Vision - Lion as Light Source

The lion on the hoodie should feel like it's **emanating divine light**. Instead of a generic center glow, the light source should appear to come FROM the lion graphic itself.

```text
Current:
┌─────────────────────────────────────┐
│                                     │
│         [Generic Glow]              │
│              ●                      │
│                                     │
│         [Lion somewhere]            │
│                                     │
└─────────────────────────────────────┘

After:
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         [Lion + Glow = One]         │
│              🦁✨                   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Part 3: Implementation Plan

### A. Fix Lion Position (Fine-tune)

**File:** `src/pages/LandingPage.tsx` (line 111)

```tsx
// Current
objectPosition: "center 35%",

// New - slight adjustment for better centering
objectPosition: "center 40%",
```

The `40%` value should place the lion more precisely in the viewport center.

---

### B. Brighten the Background (Less Bland)

**File:** `src/pages/LandingPage.tsx` (line 16)

```tsx
// Current - too dark
animate: {
  opacity: 0.08,
  ...
}

// New - more visible, less bland
animate: {
  opacity: 0.15,
  ...
}
```

Also update reduced motion fallback (line 71):
```tsx
// Current
opacity: 0.1

// New
opacity: 0.18
```

---

### C. Adjust Image Filter (Less Processed)

**File:** `src/pages/LandingPage.tsx` (line 110)

```tsx
// Current - too dark, too processed
filter: "grayscale(85%) contrast(1.25) brightness(0.85)",

// New - lighter, warmer, more inviting
filter: "grayscale(70%) contrast(1.15) brightness(1.0)",
```

**Changes:**
- Grayscale: 85% → 70% (allow more color through)
- Contrast: 1.25 → 1.15 (less harsh)
- Brightness: 0.85 → 1.0 (no darkening)

---

### D. Soften the Vignette (Less Dramatic)

**File:** `src/index.css` (lines 594-605)

```css
/* Current - too aggressive */
.landing-extreme-vignette::before {
  background: radial-gradient(
    ellipse 55% 55% at center,
    transparent 15%,
    hsla(0 0% 0% / 0.6) 55%,
    hsla(0 0% 0% / 0.95) 100%
  );
}

/* New - softer edges, more breathing room */
.landing-extreme-vignette::before {
  background: radial-gradient(
    ellipse 65% 65% at center,
    transparent 25%,
    hsla(0 0% 0% / 0.4) 60%,
    hsla(0 0% 0% / 0.85) 100%
  );
}
```

**Changes:**
- Ellipse size: 55% → 65% (larger clear area)
- Transparent zone: 15% → 25% (more visible center)
- Mid darkness: 0.6 → 0.4 (softer transition)
- Edge darkness: 0.95 → 0.85 (not full black)

---

### E. Reposition Glow to Lion Area

**File:** `src/index.css` (lines 565-581)

The center glow should be positioned LOWER to align with the lion on the hoodie (which is in the chest/upper-body area of the model).

```css
/* Current - dead center */
.landing-glow::before {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 80vh;
  background: radial-gradient(
    ellipse at center,
    hsla(0 0% 100% / 0.025) 0%,
    hsla(0 0% 100% / 0.01) 30%,
    transparent 60%
  );
}

/* New - positioned at lion area (lower center) */
.landing-glow::before {
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70vw;
  height: 60vh;
  background: radial-gradient(
    ellipse at center,
    hsla(45 20% 100% / 0.04) 0%,
    hsla(45 10% 100% / 0.02) 35%,
    transparent 65%
  );
}
```

**Changes:**
- Top position: 50% → 55% (shifted down toward lion)
- Size: 80vw×80vh → 70vw×60vh (more focused, less diffuse)
- Core glow: 0.025 → 0.04 (brighter center)
- Added warm tint: `hsla(45...)` (subtle gold for biblical/royal feel)

---

### F. Enhance Text Glow (Subtle Warmth)

**File:** `src/index.css` (lines 674-679)

```css
/* Current - cold white */
.text-brand-glow {
  text-shadow: 
    0 0 80px hsla(0 0% 100% / 0.05),
    0 0 30px hsla(0 0% 100% / 0.02);
}

/* New - subtle warm emanation */
.text-brand-glow {
  text-shadow: 
    0 0 60px hsla(40 30% 100% / 0.06),
    0 0 25px hsla(40 20% 100% / 0.03);
}
```

---

## Part 4: Complete Changes Summary

| File | Line(s) | Change | Effect |
|------|---------|--------|--------|
| `LandingPage.tsx` | 16 | Opacity 0.08 → 0.15 | Brighter background |
| `LandingPage.tsx` | 71 | Reduced motion opacity 0.1 → 0.18 | Consistent fallback |
| `LandingPage.tsx` | 110 | Filter: less grayscale, more brightness | Less processed look |
| `LandingPage.tsx` | 111 | objectPosition: 35% → 40% | Fine-tune lion position |
| `index.css` | 594-605 | Vignette: larger clear zone, softer edges | Less dramatic |
| `index.css` | 565-581 | Glow: shifted down 5%, warm tint, focused | Lion as light source |
| `index.css` | 674-679 | Text glow: warm tint, adjusted radius | Cohesive warmth |

---

## Part 5: Before/After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Mood** | Too dark, oppressive, bland | Mysterious but inviting |
| **Lion visibility** | Barely visible | Clear focal point |
| **Light source** | Generic center glow | Emanates from lion |
| **Vignette** | Tunnel vision | Soft natural frame |
| **Background** | 8% opacity, heavy processing | 15% opacity, natural |
| **Color temperature** | Cold white | Subtle warm gold |
| **Overall drama** | Too intense | Balanced editorial |

---

## Part 6: Color Philosophy

The addition of subtle warm tints (hue 40-45, gold/amber) connects to:

- **Biblical royalty** - The lion of Judah is a royal symbol
- **Priestly garments** - Exodus 28:2 mentions gold
- **Premium perception** - Gold undertones = luxury
- **Reduced harshness** - Warm light feels more welcoming than cold white

---

## Part 7: Success Criteria

After implementation:

1. The lion graphic is **clearly visible and centered** in the viewport
2. The page feels **mysterious but not oppressive**
3. Light appears to **emanate from the lion** area
4. The vignette **frames without choking** the composition
5. Overall atmosphere is **premium and inviting**, not bland
6. Text remains **readable with subtle warmth**
7. All animations **continue working** as before
8. Reduced motion fallback **remains functional**

---

## Part 8: Files to Modify

| File | Sections |
|------|----------|
| `src/pages/LandingPage.tsx` | Background variants, image filter, objectPosition |
| `src/index.css` | `.landing-extreme-vignette`, `.landing-glow`, `.text-brand-glow` |

