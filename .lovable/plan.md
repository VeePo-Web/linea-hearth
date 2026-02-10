

# Elevate Landing Page: Enhanced Glitch + Grain Atmosphere

## What the User Wants

The landing page is "looking good" but they want the glitch effect and grain to feel more impactful -- "make it sick." The current effects are too subtle to register as intentional design elements. They need to feel cinematic and deliberate, like a Travis Scott / Kanye concert visual or a DAZED editorial spread.

---

## Current State Analysis

### Glitch Layer (desktop only)
- Opacity: `0.15` with `mix-blend-mode: screen` -- barely perceptible
- Static `translateX(1px)` offset -- no animation, just a faint ghost
- Mask feathers it out at 40-55% -- subtle but invisible to most viewers

### Film Grain
- `hero-noise-animated` uses grain-flicker keyframes at `0.05-0.07` opacity -- nearly invisible
- Mix-blend-mode: overlay -- correct but too quiet at current opacity
- Flicker rate: `0.12s steps(1)` -- good cadence, just too faint

### Smoke Layer
- Radial gradient with `multiply` blend -- adds atmosphere but is muted

### Scan Lines
- 2px repeating gradient at `0.015` opacity -- imperceptible on most screens

---

## The Upgrade Plan

### 1. Glitch Layer: Add Actual Glitch Animation

**Current:** Static 1px offset. Boring.

**Upgrade:** Add a subtle intermittent glitch animation that fires every 8-12 seconds -- a brief RGB-split/offset jitter that lasts ~200ms. This creates that Travis Scott "screen malfunction" energy without being distracting.

**CSS changes in `src/index.css`:**

- Add a `@keyframes glitch-shift` animation with long pauses (mostly idle) and brief offset bursts
- Apply to `.glitch-layer` on desktop
- Add a subtle color-channel separation using `filter: hue-rotate()` during the glitch burst
- Increase base opacity from `0.15` to `0.2` so the effect registers
- Add a second pseudo-layer with opposing offset for RGB-split depth

### 2. Film Grain: Increase Intensity + Add Texture Scale

**Current:** Opacity `0.05-0.07` -- invisible on most displays.

**Upgrade:**
- Increase grain opacity from `0.06` to `0.10-0.12`
- Increase flicker range from `0.05-0.07` to `0.08-0.13`
- Add a second, larger-scale noise layer at lower opacity for depth (macro grain + micro grain)
- Keep `mix-blend-mode: overlay` for natural blending

### 3. Scan Lines: Make Them Visible

**Current:** `0.015` opacity -- might as well not exist.

**Upgrade:**
- Increase opacity to `0.04-0.05` -- visible but not distracting
- Increase line spacing slightly for more "CRT monitor" feel (4px lines instead of 2px)

### 4. Smoke Layer: Slight Intensity Boost

**Current:** Subtle atmospheric gradient.

**Upgrade:**
- Slightly increase the outer opacity values for more dramatic edge darkening
- This enhances the "emerging from darkness" mood

---

## Technical Implementation Details

### File: `src/index.css`

**A. New glitch animation keyframes** (add near line 1208):

```css
@keyframes glitch-shift {
  0%, 92%, 100% {
    transform: translateX(1px);
    filter: none;
    opacity: 0.2;
  }
  93% {
    transform: translateX(-3px) skewX(-0.5deg);
    filter: hue-rotate(15deg);
    opacity: 0.35;
  }
  94% {
    transform: translateX(4px) skewX(0.3deg);
    filter: hue-rotate(-10deg);
    opacity: 0.25;
  }
  95% {
    transform: translateX(-2px);
    filter: hue-rotate(5deg);
    opacity: 0.3;
  }
  96% {
    transform: translateX(1px);
    filter: none;
    opacity: 0.2;
  }
}
```

This creates a glitch burst that fires for ~4% of a 12-second cycle (~480ms of distortion every 12 seconds).

**B. Update `.glitch-layer` desktop rule** (line 1214-1224):

```css
@media (min-width: 1024px) {
  .glitch-layer {
    display: block;
    position: absolute;
    inset: 0;
    mask-image: linear-gradient(to bottom, black 0%, black 40%, transparent 55%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black 40%, transparent 55%);
    transform: translateX(1px);
    opacity: 0.2;
    mix-blend-mode: screen;
    pointer-events: none;
    animation: glitch-shift 12s ease-in-out infinite;
  }
}
```

**C. Update grain flicker keyframes** (line 619-624):

```css
@keyframes grain-flicker {
  0%, 100% { opacity: 0.08; }
  25% { opacity: 0.12; }
  50% { opacity: 0.10; }
  75% { opacity: 0.09; }
}
```

**D. Update `.hero-noise-animated::after`** (line 626-635):

```css
.hero-noise-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* same SVG */
  opacity: 0.10;
  pointer-events: none;
  mix-blend-mode: overlay;
  animation: grain-flicker 0.12s steps(1) infinite;
}
```

**E. Update `.scan-lines::before`** (line 644-656):

```css
.scan-lines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    hsla(0 0% 0% / 0.04) 3px,
    hsla(0 0% 0% / 0.04) 6px
  );
  pointer-events: none;
}
```

**F. Boost smoke layer** (line 1009-1021) -- slight opacity increase:

```css
.smoke-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 130% 90% at 50% 55%,
    transparent 20%,
    hsla(35 25% 8% / 0.30) 50%,
    hsla(25 30% 5% / 0.55) 100%
  );
  animation: smoke-drift 25s ease-in-out infinite;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

---

## What This Achieves

| Layer | Before | After |
|-------|--------|-------|
| **Glitch** | Static 1px ghost, 15% opacity | Animated RGB-split bursts every ~12s, 20% base |
| **Grain** | 5-7% opacity flicker -- invisible | 8-12% opacity flicker -- visible film texture |
| **Scan lines** | 1.5% opacity, 2px -- invisible | 4% opacity, 3px -- subtle CRT energy |
| **Smoke** | Light atmospheric gradient | Slightly deeper edge darkness |

## Accessibility

- All effects respect `prefers-reduced-motion: reduce` (glitch layer hidden entirely, grain static, smoke static)
- No flashing above 3Hz threshold (glitch burst is ~0.08Hz -- once every 12 seconds)
- Scan lines at 4% opacity pass contrast requirements for overlaid text

## Performance

- Zero new DOM elements
- Zero new dependencies
- All CSS-only changes (no JS)
- Glitch animation uses `transform` + `filter` (GPU-composited)
- No layout shifts

