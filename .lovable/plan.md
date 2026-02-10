
# Subtle Micro-Enhancements: FullScreenNav Sensory Polish

## What We're Doing

Adding barely-perceptible refinements to the full-screen editorial navigation overlay that make it feel *luxurious* to inhabit — the kind of details users feel but can't articulate. Think: the difference between a good hotel lobby and a great one. Nothing changes structurally. Everything changes experientially.

---

## Current State

The FullScreenNav is already strong:
- Full-bleed hero backdrop (`/nav-hero-hoodie.png`)
- Staggered link entrance animations with editorial easing
- Dark typography on light/warm backdrop
- Account + Instagram in footer
- Proper accessibility (focus trap, Escape key, scroll lock, ARIA)

What's missing is the atmospheric "I want to linger here" quality.

---

## The Enhancements (7 Subtle Additions)

### 1. Warm Film Grain Overlay

Add the same dual-layer grain system from the landing page hero to the nav overlay backdrop. This creates visual consistency and makes the nav feel cinematic rather than "flat image behind text."

**Implementation:** Add `hero-noise-animated` class to the nav backdrop, plus a subtle scrim adjustment to maintain text legibility over the grain.

**File:** `src/components/header/FullScreenNav.tsx`
- Add a `<div>` with classes `absolute inset-0 hero-noise-animated pointer-events-none` after the existing scrim div (line 176)

---

### 2. Active Route Indicator

When the nav opens, the current page's link should have a subtle visual distinction — a quiet `opacity: 0.4` state or a tiny dot/dash marker. This gives spatial awareness without being loud.

**Implementation:** Use `useLocation()` to compare `location.pathname` against each `NAV_LINKS[].href`. Apply a conditional class for the active link.

**File:** `src/components/header/FullScreenNav.tsx`
- Import `useLocation` from react-router-dom (already available)
- Add route matching logic
- Active link gets a small em-dash prefix and slightly reduced opacity on the label text (indicating "you are here" vs "go here")

---

### 3. Subtle Hover Underline Slide

Currently links just change color on hover. Add a CSS-only underline that slides in from left on hover — a 1px line that grows via `scaleX` transform. This is the 032c/i-D editorial signature.

**Implementation:** Pure CSS via `::after` pseudo-element on each nav link, using `transform: scaleX(0)` to `scaleX(1)` on hover with `transform-origin: left`.

**File:** `src/index.css`
- Add a `.nav-link-editorial` class with the sliding underline
- Respect `prefers-reduced-motion` (instant show, no slide)

**File:** `src/components/header/FullScreenNav.tsx`
- Add `nav-link-editorial` class to each `<Link>`

---

### 4. Soft Vignette on Backdrop Image

Add a radial gradient vignette over the background image — darker at the edges, lighter at center where the links sit. This focuses visual attention on the link stack and adds depth.

**Implementation:** CSS `::before` pseudo on the nav container using `radial-gradient(ellipse at center, transparent 30%, hsla(0 0% 0% / 0.15) 100%)`.

**File:** `src/components/header/FullScreenNav.tsx`
- Add a vignette div after the grain div: `<div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, hsla(30 10% 20% / 0.12) 100%)' }} />`

---

### 5. Entrance Blur-to-Sharp on Backdrop

When the nav opens, the background image starts with a subtle `blur(4px)` and sharpens to `blur(0px)` over 700ms. This creates a "pulling into focus" cinematic effect that makes the entrance feel intentional and premium.

**Implementation:** Add CSS `filter` transition to the background variants.

**File:** `src/components/header/FullScreenNav.tsx`
- Update `backgroundVariants` to include `filter: 'blur(4px)'` in `hidden` and `filter: 'blur(0px)'` in `visible`
- Add `filter: 'blur(2px)'` to `exit` for a soft dismiss
- Reduced-motion variant skips the blur entirely

---

### 6. Breathing Ambient Glow

Add a very subtle warm ambient pulse behind the link stack — a radial glow at ~3% opacity that slowly oscillates. This adds life without being distracting. Like candlelight on a wall.

**Implementation:** CSS keyframe animation on a positioned element behind the nav links.

**File:** `src/index.css`
- Add `@keyframes nav-ambient-breathe` with opacity oscillation between `0.02` and `0.05` over 8 seconds
- Add `.nav-ambient-glow` class

**File:** `src/components/header/FullScreenNav.tsx`
- Add the ambient glow div behind the nav link stack

---

### 7. Footer Separator Line

Add a hairline separator between the nav links and the footer area — a 40% width centered line using a silver gradient (matching the chrome underline system from the landing page). This gives the footer elements visual grounding.

**Implementation:** A `<div>` with the chrome gradient hairline, positioned above the footer.

**File:** `src/components/header/FullScreenNav.tsx`
- Add a styled `<div>` between the `</nav>` and `<motion.footer>` with the silver gradient line

---

## Technical Summary

| Enhancement | File(s) | Type | Performance |
|------------|---------|------|-------------|
| Film grain overlay | FullScreenNav.tsx | Add div with existing CSS class | Zero cost (reuses existing CSS) |
| Active route indicator | FullScreenNav.tsx | Add useLocation + conditional class | Negligible |
| Hover underline slide | index.css + FullScreenNav.tsx | New CSS class + apply to links | CSS-only, GPU composited |
| Soft vignette | FullScreenNav.tsx | Add gradient div | Single gradient, no JS |
| Blur-to-sharp entrance | FullScreenNav.tsx | Update Framer Motion variants | GPU-composited filter |
| Breathing ambient glow | index.css + FullScreenNav.tsx | New keyframe + div | CSS-only animation |
| Footer separator | FullScreenNav.tsx | Add styled div | Static element |

## Accessibility

- All motion effects respect `prefers-reduced-motion` via existing `useReducedMotion` hook
- Active route indicator improves spatial awareness for all users
- Grain/vignette/glow are purely decorative with `pointer-events: none`
- No contrast changes to interactive elements
- No new interactive elements added

## Files Modified

1. `src/components/header/FullScreenNav.tsx` — all 7 enhancements touch this file
2. `src/index.css` — 2 new CSS classes (`.nav-link-editorial`, `.nav-ambient-glow`) + 1 keyframe

Zero new dependencies. Zero new DOM complexity. Seven layers of invisible luxury.
