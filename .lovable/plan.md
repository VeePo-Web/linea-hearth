

# Fantasy.co "What If" Micro-Interactions: Landing Page Portal Transition

## The Fantasy.co "What If" Principle

Fantasy.co's methodology starts with "What if this moment felt like ___?" -- turning functional interactions into emotional signatures. Applied here: **What if clicking "Enter" didn't just navigate -- it felt like stepping through a threshold into a sacred space?**

The landing page already has world-class atmosphere. But the moment of clicking "Enter" is currently just... a React Router navigation with a generic `PageTransition` opacity fade. That's the gap. The portal moment should be the single most memorable micro-interaction on the entire site.

---

## Current State: What Happens When You Click "Enter"

1. User clicks the `<Link to="/home">` element
2. React Router navigates to `/home`
3. `AnimatePresence mode="wait"` triggers `PageTransition` exit animation (opacity 1 to 0, y: 0 to -10, 200ms)
4. Landing page unmounts
5. Home page mounts with entrance animation (opacity 0 to 1, y: 20 to 0, 400ms)

**The problem:** This is the same generic transition every page uses. The Brand Gate -- the single most atmospheric page on the site -- deserves its own exit choreography.

---

## The "What If" Ideas (Ranked by Impact vs. Complexity)

### Idea 1: "The Veil Parts" -- Vertical Wipe Exit (HIGH IMPACT, LOW COMPLEXITY)

**What if:** Clicking Enter causes the entire landing page to split vertically from center and slide apart like curtains being drawn, revealing the store behind.

**How it works:**
- On click, add a CSS class to the `<main>` element that triggers a `clip-path` animation
- The content fades to white/black as two halves slide apart
- After 800ms, navigate to `/home`
- Uses `useNavigate` with a manual delay instead of `<Link>` for choreographed timing

**Technical approach:**
- Replace `<Link to="/home">` with an `<button>` that calls a `handleEnter()` function
- `handleEnter()` sets a `isExiting` state, waits 800ms, then calls `navigate('/home')`
- When `isExiting` is true, apply exit animation classes/variants to the landing page layers
- Each layer animates differently: background zooms slightly, content fades up, vignette intensifies

### Idea 2: "Divine Illumination Burst" -- Light Bloom Exit (HIGH IMPACT, MEDIUM COMPLEXITY)

**What if:** Clicking Enter causes the center glow to intensify dramatically -- as if the Lion of Judah graphic is emanating divine light -- washing the screen to warm white before the store appears.

**How it works:**
- The existing `landing-glow` layer scales up and increases opacity to 1
- The brand text gets a bloom effect (text-shadow intensifies)
- Grain and scan lines fade out (the "film" burns away)
- Background image opacity increases briefly (the image "develops")
- Everything washes to warm off-white over 1.2s
- Home page fades in from that warm white

**Technical approach:**
- `isExiting` state triggers Framer Motion animate changes on each layer
- The glow layer: `scale: 3, opacity: 0.8` over 1s
- Text: `opacity: 0, y: -20, filter: blur(8px)` over 0.6s
- Background: `opacity: 0.4, scale: 1.05` over 0.8s then `opacity: 0` over 0.4s
- Final 200ms: everything to white/transparent

### Idea 3: "The Text Dissolves" -- Character Scatter (MEDIUM IMPACT, MEDIUM COMPLEXITY)

**What if:** When you click Enter, the "LINE OF JUDAH" letters individually drift apart and fade, as if the name itself is breaking into particles of light -- and the verse below fades last like an afterimage.

**How it works:**
- Split "LINE OF JUDAH" into individual `<span>` characters
- On exit, each character gets a random small offset (x: random(-30, 30), y: random(-20, 20)) and fades to 0
- Staggered by 0.02s per character
- The verse fades 0.3s after the title starts dissolving
- The "Enter" button itself fades first (it served its purpose)

### Idea 4: "Film Reel End" -- The Projector Stops (MEDIUM IMPACT, LOW COMPLEXITY)

**What if:** Clicking Enter makes the page feel like a film projector stopping -- the grain intensifies dramatically, the image stutters/flickers, then cuts to black before the store appears. Like the end of a 35mm reel.

**How it works:**
- Grain opacity ramps from 0.10 to 0.35 over 0.5s
- Scan lines opacity ramps from 0.04 to 0.15
- Background image flickers (opacity oscillates rapidly 3 times)
- Hard cut to black (100ms)
- Home page fades in from black

### Idea 5: "Zoom Through" -- Perspective Portal (HIGH IMPACT, LOW COMPLEXITY)

**What if:** Clicking Enter makes everything zoom toward you as if you're being pulled through the screen -- the vignette closes in, the background image scales up, and you "pass through" into the store.

**How it works:**
- Background: `scale: 1 to 1.8` over 1s with `filter: blur(4px)`
- Vignette: intensifies to near-black
- Content: `scale: 1.5, opacity: 0` (zooms past you)
- After 900ms, navigate to `/home`

---

## Recommended Combination: Ideas 2 + 5 (Hybrid)

The strongest approach fuses "Divine Illumination Burst" with "Zoom Through" -- the glow intensifies as the background pulls toward you, creating the sensation of stepping into light. This is the most on-brand for a faith-based luxury store: you're not just navigating, you're crossing a threshold into something sacred.

### Implementation Plan

#### File: `src/pages/LandingPage.tsx`

**Changes:**

1. Replace `<Link to="/home">` with a `<button>` that triggers a choreographed exit sequence
2. Add `isExiting` state and `handleEnter` function with `useNavigate`
3. Add conditional Framer Motion `animate` props that respond to `isExiting`
4. Each atmospheric layer gets its own exit choreography:

```text
Timeline (1.2s total):

0ms     -- "Enter" button fades out instantly
0ms     -- Glow layer begins scaling (1 -> 2.5) and brightening
0ms     -- Background begins zooming (1 -> 1.3) with slight blur
100ms   -- Brand text begins floating up and blurring out
200ms   -- Verse text fades out
300ms   -- Grain + scan lines fade out (the "film" dissolves)
600ms   -- Vignette intensifies to near-solid
800ms   -- Everything reaches near-white/near-black
1000ms  -- Navigate to /home
1200ms  -- Home page entrance animation begins (standard PageTransition)
```

5. The "Enter" button gets a subtle `scale: 0.97` press feedback on click before the exit begins (tactile confirmation)

#### File: `src/index.css`

**Changes:**

1. Add `.landing-exit-glow` class with transition properties for the illumination burst
2. Add `.landing-exit-zoom` class for the background zoom + blur
3. Add `.landing-exit-text` class for the text float-up + blur dissolution
4. All exit animations use `cubic-bezier(0.4, 0, 0.2, 1)` (smooth deceleration) -- different from the entrance `editorialEase` to feel like "release" rather than "arrival"

#### File: `src/components/motion/PageTransition.tsx`

**No changes needed.** The landing page handles its own exit choreography before navigating. The home page still uses the standard `PageTransition` entrance, which creates a clean handoff.

---

## Technical Details

### State Management

```text
LandingPage component:
  - const [isExiting, setIsExiting] = useState(false)
  - const navigate = useNavigate()
  - handleEnter():
      1. setIsExiting(true)
      2. setTimeout(() => navigate('/home'), 1000)
```

### Layer-by-Layer Exit Choreography

| Layer | Exit Animation | Duration | Delay | Easing |
|-------|---------------|----------|-------|--------|
| Enter button | opacity: 0, scale: 0.95 | 200ms | 0ms | ease-out |
| Center glow | scale: 2.5, opacity: 0.9 | 1000ms | 0ms | ease-in-out |
| Background image | scale: 1.3, opacity: 0.25, filter: blur(3px) | 900ms | 0ms | ease-in |
| Brand text "LINE OF JUDAH" | y: -30, opacity: 0, filter: blur(8px) | 600ms | 100ms | ease-in |
| Chrome underline | scaleX: 0, opacity: 0 | 400ms | 50ms | ease-in |
| Verse block | opacity: 0, y: -15 | 500ms | 200ms | ease-in |
| Grain layers | opacity: 0 | 400ms | 300ms | linear |
| Scan lines | opacity: 0 | 300ms | 300ms | linear |
| Smoke layer | opacity: 0 | 500ms | 200ms | ease-in |
| Vignette | opacity intensifies to 0.95 | 800ms | 200ms | ease-in |
| Glitch layer | opacity: 0 | 200ms | 0ms | linear |

### Accessibility

- Reduced motion users: `isExiting` triggers a simple 300ms opacity fade to 0, then navigates
- The button remains keyboard-focusable and has proper `aria-label`
- The exit sequence does not exceed 3Hz flash threshold (no rapid flickering)
- Navigation still occurs for all users -- the animation is purely decorative enhancement

### Performance

- Zero new dependencies
- All animations use `transform`, `opacity`, and `filter` (GPU-composited properties)
- No layout shifts during exit (everything is absolutely positioned)
- The `setTimeout` for navigation is the only JS overhead -- everything else is Framer Motion variants reacting to state

---

## Summary

| What | How |
|------|-----|
| **Trigger** | Click "Enter" button (replaces `<Link>`) |
| **Duration** | 1.0s choreographed exit, then navigate |
| **Effect** | Divine light bloom + perspective zoom = "stepping through a threshold" |
| **Files changed** | `src/pages/LandingPage.tsx` (state + exit logic + animated props) |
| **CSS changes** | None required -- all Framer Motion inline |
| **New dependencies** | None |
| **Reduced motion** | Simple 300ms fade |
| **Keyboard** | Full support (button with aria-label) |

