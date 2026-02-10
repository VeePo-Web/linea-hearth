

# Add Macro-Grain Layer: 35mm Film Depth

## Concept

Real 35mm film has two distinct grain characteristics layered together:
1. **Micro grain** (what we have now): Fine, high-frequency noise at `baseFrequency='0.9'` -- this is the "digital sensor" texture
2. **Macro grain** (what we're adding): Larger, softer clumps at `baseFrequency='0.15-0.25'` -- this is the "silver halide crystal" texture that gives film its organic, breathing quality

Layering both creates the depth separation that makes audiences subconsciously register "this feels like film, not digital." It's the difference between an iPhone photo and a Kodak Portra 400 scan.

## Current State

- `.hero-noise-animated::after` -- single micro-grain layer using `feTurbulence baseFrequency='0.9'`, opacity `0.10`, `mix-blend-mode: overlay`
- Only the `::after` pseudo-element is used; `::before` is available

## The Fix

Add a second grain layer using the `::before` pseudo-element with:
- **Lower frequency** (`baseFrequency='0.15'`) for larger grain clumps
- **Fewer octaves** (`numOctaves='2'` vs `4`) for softer, less sharp texture
- **Lower opacity** (`0.06`) so it sits behind the micro grain as atmosphere
- **Separate flicker cadence** (`0.2s` vs `0.12s`) so the two layers don't sync -- this creates the organic "breathing" quality of real film
- **`mix-blend-mode: soft-light`** instead of `overlay` for a gentler, more filmic blend

## Implementation

### File: `src/index.css`

**A. Add macro-grain flicker keyframes** (after the existing `grain-flicker` keyframes, ~line 624):

```css
@keyframes grain-flicker-macro {
  0%, 100% { opacity: 0.05; }
  33% { opacity: 0.07; }
  66% { opacity: 0.06; }
}
```

Slower, subtler oscillation than the micro layer -- large grain doesn't "sparkle," it breathes.

**B. Add `::before` pseudo-element to `.hero-noise-animated`** (after the existing `::after` rule, ~line 635):

```css
.hero-noise-animated::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='macroNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23macroNoise)'/%3E%3C/svg%3E");
  opacity: 0.06;
  pointer-events: none;
  mix-blend-mode: soft-light;
  animation: grain-flicker-macro 0.2s steps(1) infinite;
}
```

Key differences from micro layer:
- `viewBox='0 0 512 512'` (larger canvas = larger grain pattern)
- `baseFrequency='0.15'` (6x larger clumps than micro's `0.9`)
- `numOctaves='2'` (softer, less detailed)
- `opacity: 0.06` (subtler than micro's `0.10`)
- `soft-light` blend (gentler than `overlay`)
- `0.2s` flicker (slower rhythm, out of sync with micro's `0.12s`)

**C. Add reduced-motion support** (update the existing `prefers-reduced-motion` block, ~line 637):

Add `.hero-noise-animated::before` to the existing reduced-motion rule so both layers respect accessibility:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-noise-animated::after,
  .hero-noise-animated::before {
    animation: none;
  }
}
```

## Why This Works

| Property | Micro Grain (existing) | Macro Grain (new) |
|----------|----------------------|-------------------|
| Frequency | 0.9 (fine dots) | 0.15 (soft clumps) |
| Octaves | 4 (sharp detail) | 2 (soft blobs) |
| Opacity | 0.10 | 0.06 |
| Blend mode | overlay | soft-light |
| Flicker speed | 0.12s | 0.2s |
| Pseudo-element | ::after | ::before |

The two layers at different scales and different flicker rates create a **moire-free depth** that reads as organic film texture rather than a digital filter. The macro layer adds the "body" while the micro layer adds the "sparkle."

## Performance

- Zero new DOM elements (uses existing `::before` pseudo-element)
- Zero new dependencies
- CSS-only, GPU-composited
- SVG noise filter is inline (no network request)
- Reduced-motion compliant

## Summary of Changes

| File | Location | Change |
|------|----------|--------|
| `src/index.css` | After line 624 | Add `@keyframes grain-flicker-macro` |
| `src/index.css` | After line 635 | Add `.hero-noise-animated::before` macro grain rule |
| `src/index.css` | Line 637-641 | Update reduced-motion rule to include `::before` |

Three additions. Zero risk. Maximum cinematic depth.

