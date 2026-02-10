

# Fix: Diagonal Shadow Line in Bottom Third of Landing Page

## The Problem

A faint, slightly diagonal line is visible cutting across the bottom third of the landing page viewport. This is caused by the **Glitch/Split Layer** (``.glitch-layer``).

## Root Cause

In ``src/index.css`` (line 1218), the glitch layer uses a ``clip-path`` with a diagonal edge:

```css
clip-path: polygon(0 0, 100% 0, 100% 48%, 0 52%);
```

This creates a trapezoid shape where the bottom edge runs from **48% on the right** to **52% on the left** — a slight diagonal. Combined with ``mix-blend-mode: screen`` and ``opacity: 0.15``, the edge of this clip-path becomes visible as a faint diagonal shadow/line across the viewport.

## The Fix

Two options depending on the desired outcome:

### Option A: Remove the diagonal (make the edge perfectly horizontal)

Change the clip-path to use a straight horizontal cut:

```css
clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
```

This keeps the glitch-layer effect (subtle screen-blend duplication of the top half) but eliminates the visible diagonal line. The edge becomes perfectly horizontal and much harder to perceive since both sides meet at the same point.

### Option B: Soften the edge so the line disappears entirely

Replace the hard ``clip-path`` edge with a CSS mask that feathers the bottom edge, creating a gradual fade instead of a sharp cut:

```css
.glitch-layer {
  display: block;
  position: absolute;
  inset: 0;
  /* Remove clip-path entirely */
  /* clip-path: polygon(...); */
  mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 40%,
    transparent 55%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 40%,
    transparent 55%
  );
  transform: translateX(1px);
  opacity: 0.15;
  mix-blend-mode: screen;
  pointer-events: none;
}
```

This feathers the bottom edge over a 15% gradient (40% to 55%), making the transition completely invisible while preserving the glitch-layer's atmospheric contribution to the top portion of the page.

## Recommendation

**Option B** (mask feathering) is the world-class choice. Hard clip-path edges are inherently visible at any angle; a gradient mask makes the layer truly invisible while keeping its atmospheric contribution. This is what Fantasy.co would ship.

## File Changes

| File | Line | Change |
|------|------|--------|
| ``src/index.css`` | 1213-1224 | Replace ``clip-path`` with ``mask-image`` gradient on ``.glitch-layer`` desktop rule |

## Success Criteria

1. No visible diagonal line anywhere on the landing page
2. Glitch-layer atmospheric effect still contributes to the top half
3. Transition is imperceptible across all viewport sizes (mobile through 4K)
4. Reduced motion users unaffected (glitch-layer already hidden for them)

