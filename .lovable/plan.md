

# Clean Hero Entry: Header Hidden Until Scroll-Up

## The Problem

When you click "Enter" on the Brand Gate and arrive at `/home`, the header (StatusBar + Navigation) and the SecondaryCTAStrip are immediately visible at the top. This breaks the immersive editorial flow -- you just experienced a cinematic portal transition, and then you land with a standard e-commerce chrome bar sitting on top of the hero.

The hero section (`EditorialHero`) is a full-viewport cinematic spread with massive "WEAR YOUR FAITH." typography, brave-cropped model imagery, and parallax depth. It deserves to breathe without UI chrome competing for attention.

## The Fix

**Start the header off-screen when arriving at `/home`, then reveal it only when the user scrolls up** -- exactly like luxury fashion sites (Fear of God, Rick Owens, Acne Studios) where the hero is full-bleed and the nav slides in once you start browsing.

### How It Works

The `Header` component already has scroll-direction logic via `useScrollDirection` -- it hides on scroll-down and shows on scroll-up. We just need to add one behavior: **start hidden when the page is at the top** (i.e., on initial load), then reveal on the first scroll-up.

### Architecture

```text
Current behavior:
  Page loads -> Header visible at y:0 -> Hides on scroll down -> Shows on scroll up

New behavior:  
  Page loads -> Header starts at y:-100 (off-screen) -> User scrolls down (stays hidden) -> User scrolls up -> Header slides in -> Normal behavior resumes
```

The SecondaryCTAStrip already only shows after 600px scroll, so it naturally stays out of the way. No changes needed there.

---

## Implementation

### File 1: `src/components/header/Header.tsx`

**What changes:**

1. Detect if the user is on the `/home` route using `useLocation()`
2. Track whether the header has been "revealed" yet with a `hasRevealed` state
3. On `/home`: start with `y: -100` (hidden), only set `hasRevealed = true` when `direction === "up"` and `isScrolled`
4. On all other routes: behave exactly as today (always start visible)

**Logic:**

```text
const isHomePage = location.pathname === '/home'
const [hasRevealed, setHasRevealed] = useState(!isHomePage)

// When direction is "up" and we've scrolled, reveal
useEffect: if (direction === 'up' && isScrolled) -> setHasRevealed(true)

// Reset when navigating to /home
useEffect: if (isHomePage) -> setHasRevealed(false)

// Determine visibility:
if (!hasRevealed) -> y: -100 (hidden)
else if (shouldHide) -> y: -100 (existing scroll-down hide)  
else -> y: 0 (visible)
```

This preserves ALL existing scroll-hide behavior. The only addition is the initial hidden state on `/home`.

### File 2: `src/components/layout/Layout.tsx`

**What changes:**

On the `/home` route, the `main` element currently has `pt-[var(--header-height)]` which reserves space for the fixed header. Since the header starts hidden on `/home`, we need the hero to go full-bleed (no top padding) initially, then add the padding back once the header reveals.

Two options:
- **Option A (simpler):** Remove the top padding on `/home` entirely. The `EditorialHero` is already a `min-h-dvh` full-viewport section, so it fills the screen regardless. The header overlays on top when it slides in. This is the luxury fashion standard -- the nav overlays the hero, it doesn't push it down.
- **Option B:** Conditionally apply padding based on header reveal state.

**Recommended: Option A.** The hero is full-bleed by design. The header should overlay, not push content. We pass a prop like `immersiveHero` to Layout that removes the top padding.

### File 3: `src/pages/Index.tsx`

**What changes:**

Pass `immersiveHero={true}` (or similar prop) to `<Layout>` so it knows to skip the header top-padding on this page.

```text
<Layout immersiveHero>
  <EditorialHero />
  ...
</Layout>
```

---

## Technical Details

### Header Reveal Logic (Header.tsx)

| State | `hasRevealed` | Scroll Direction | Result |
|-------|--------------|-----------------|--------|
| Initial load on `/home` | `false` | n/a | Header at `y: -100` (hidden) |
| User scrolls down | `false` | down | Header stays at `y: -100` |
| User scrolls up | `true` (set now) | up | Header slides to `y: 0` |
| Continues browsing | `true` | down | Header hides (existing behavior) |
| Continues browsing | `true` | up | Header shows (existing behavior) |
| Navigate to another page | `true` | n/a | Header visible normally |
| Navigate back to `/home` | reset to `false` | n/a | Header hidden again |

### Layout padding (Layout.tsx)

| Prop | `pt-[var(--header-height)]` applied? |
|------|--------------------------------------|
| `immersiveHero={false}` (default) | Yes -- normal pages |
| `immersiveHero={true}` | No -- hero goes full-bleed, header overlays |

### Header transparency on hero

When the header reveals over the full-bleed hero, the Navigation component already has `backgroundColor: 'rgba(255, 255, 255, 0.97)'` and `backdropFilter: 'blur(12px)'`. This will look clean overlaying the dark hero. No changes needed.

---

## Summary of Changes

| File | Change | Risk |
|------|--------|------|
| `src/components/header/Header.tsx` | Add `hasRevealed` state, start hidden on `/home`, reveal on first scroll-up | Low -- additive logic, existing behavior preserved |
| `src/components/layout/Layout.tsx` | Add `immersiveHero` prop, conditionally remove `pt-[var(--header-height)]` | Low -- only affects pages that opt in |
| `src/pages/Index.tsx` | Pass `immersiveHero` to Layout | Trivial |

Three files. Zero new dependencies. The hero breathes. The header earns its entrance.

