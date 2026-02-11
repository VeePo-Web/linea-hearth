

# Atmospheric Depth Field: Mouse-Hover Parallax for the Landing Page

## Overview

Add a multi-layer mouse-tracking parallax effect to the landing page. Each existing visual layer shifts at a different rate and direction relative to the cursor position, creating the illusion of physical depth -- as if the viewer is looking through a window into a smoky, cinematic space. At rest (no mouse movement), the page looks identical to its current state.

## Layer Response Map

```text
Layer                    Shift     Direction        Effect
----------------------------------------------------------------------
Ken Burns background     8-12px    Follows mouse    Distant backdrop behind glass
Glitch layer             10-14px   Follows mouse    Chromatic separation on movement
Smoke/mist               15-20px   Inverse          Floats independently in mid-air
Vignette                 0px       Static           Anchored "lens" frame
Center glow              4-6px     Follows mouse    Divine illumination tracks gaze
Grain + scanlines        0px       Static           "Film" layer on the camera
Content (text/CTA)       2-3px     Inverse          Text floats between viewer and scene
```

## Technical Architecture

### Mouse Tracking System

A single `onMouseMove` handler on `<main>` calculates normalized coordinates from viewport center:

```text
mouseX normalized = (clientX - windowWidth / 2) / (windowWidth / 2)   // -1 to 1
mouseY normalized = (clientY - windowHeight / 2) / (windowHeight / 2) // -1 to 1
```

These values are stored in a `useRef` (not `useState`) to avoid triggering React re-renders on every mouse event. Transforms are applied via `requestAnimationFrame` to stay synchronized with the browser paint cycle.

### Smoothing / Lerp

Raw mouse position is interpolated using linear interpolation (lerp) at a factor of ~0.08 per frame. This creates the slow, weighted drift that makes it feel like the layers have mass -- not snapping directly to cursor position but easing toward it. This is the key to the "invisible engineering" quality.

```text
currentX += (targetX - currentX) * 0.08
currentY += (targetY - currentY) * 0.08
```

### Layer Refs

Each layer that moves gets a `useRef<HTMLDivElement>` attached. Inside the rAF loop, the ref's `style.transform` is set directly:

```text
backgroundRef.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`
glitchRef.style.transform = `translate3d(${x * 12}px, ${y * 10}px, 0)`
smokeRef.style.transform = `translate3d(${x * -18}px, ${y * -15}px, 0)`
glowRef.style.transform = `translate3d(${x * 5}px, ${y * 4}px, 0)`
contentRef.style.transform = `translate3d(${x * -2}px, ${y * -2}px, 0)`
```

Using `translate3d` forces GPU compositing. No `top`/`left` manipulation, no layout thrashing.

### CSS Support

Each moving layer gets `will-change: transform` added to its CSS class to hint the browser compositor. A `transition: transform 0.15s ease-out` is NOT used (the lerp handles smoothing in JS -- CSS transitions would fight the rAF loop and create double-easing).

### Overflow Handling

Since layers shift by up to 20px, they need slight overscaling to prevent visible edges. The background and glitch layers already have Ken Burns scaling. The smoke layer uses radial gradients that naturally fade to transparent at edges. The glow layer is a centered radial gradient -- shifting it 5px won't expose edges. No visible clipping risk.

## Reduced Motion

If `prefersReducedMotion` is `true`, the `onMouseMove` handler is not attached. All layers remain in their default centered position. The page is visually identical to the current production version.

## Mobile / Touch

Touch devices have no mouse cursor. The `onMouseMove` event simply never fires, so the effect is dormant. No gyroscope/device orientation is used -- keeping it simple and permission-free.

## Exit Transition Integration

When `isExiting` becomes `true` (user clicks to navigate), the rAF loop is cancelled. The layers are already transitioning via Framer Motion exit animations, so the parallax gracefully stops and the cinematic exit takes over.

## File Changes

### `src/pages/LandingPage.tsx`

This is the only file that changes. Additions:

1. **Imports**: Add `useRef`, `useEffect` (already have `useState`, `useCallback`)

2. **Refs**: Create refs for the 5 moving layers:
   - `bgRef` (Ken Burns background wrapper)
   - `glitchRef` (glitch layer wrapper)
   - `smokeRef` (smoke layer)
   - `glowRef` (center glow)
   - `contentRef` (content wrapper div)

3. **Mouse state ref**: `const mouse = useRef({ x: 0, y: 0, currentX: 0, currentY: 0 })`

4. **onMouseMove handler**: Attached to `<main>`, calculates normalized -1 to 1 coordinates, stores in `mouse.current`

5. **useEffect with rAF loop**: Runs the lerp interpolation and applies `translate3d` transforms to each ref. Returns cleanup that cancels the animation frame.

6. **Guard clauses**: The effect skips entirely if `prefersReducedMotion` is true or if `isExiting` is true.

7. **Attach refs**: Add `ref={bgRef}` etc. to the corresponding `<motion.div>` elements. Since these are Framer Motion components, the refs are forwarded automatically.

### Approximate code footprint

- ~15 lines for refs and mouse state
- ~10 lines for the onMouseMove handler  
- ~25 lines for the useEffect rAF loop with lerp + transform application
- ~5 lines for ref attachments on JSX elements

Total: approximately 55 lines of new code. Zero new dependencies. Zero new files.

### No CSS changes needed

All transforms are applied inline via JS. The existing CSS classes remain untouched. `will-change: transform` can optionally be added to the moving layer classes in `src/index.css`, but it is not strictly required since `translate3d` already promotes to a compositor layer.

## Performance Profile

| Metric | Impact |
|--------|--------|
| JS bundle size | +55 lines (~1.2KB unminified, <0.5KB gzipped) |
| Runtime CPU | One rAF loop with 5 style writes per frame -- negligible |
| GPU | 5 compositor layers (already exist from z-index stacking) |
| Memory | One ref object with 4 numbers |
| CLS | Zero -- transforms do not affect layout |
| Mobile battery | No impact -- effect is dormant on touch devices |

## Acceptance Criteria

1. Moving the mouse across the page creates a subtle, weighted depth shift across layers
2. The background and glitch shift in the direction of the mouse (parallax follow)
3. The smoke shifts opposite to the mouse (counter-parallax, creating mid-air float)
4. The center glow tracks gently with the mouse (divine illumination follows gaze)
5. The content text shifts very subtly opposite to the mouse (floating text effect)
6. The vignette, grain, and scanlines do not move (anchored to camera)
7. Movement feels heavy and smooth, not jittery (lerp factor ~0.08)
8. Page at rest (mouse stationary or not on page) looks identical to current design
9. Reduced motion preference: no parallax, static page
10. Mobile: no parallax, static page
11. Exit transition: parallax stops when user clicks, cinematic exit plays normally
12. No visible edge clipping on any layer during maximum mouse displacement

