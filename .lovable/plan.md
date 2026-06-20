## Goal

Make the cart-open scene more cinematic by (1) giving the lion two simple black-dot eyes, and (2) intensifying the page blur behind so the lion + verse pop. Everything else stays exactly as it is now (instant reveal, layout, copy, panel).

## Changes

1. **New asset: `public/lion-mark.png`** — generate via `imagegen--edit_image` from `public/favicon-512.png` with prompt: "Add two small simple solid black circular dot eyes to the lion's face, perfectly symmetrical, minimal, no other changes. Keep transparent background and the exact same silhouette." Saved as a transparent PNG.
   - Fallback path if the edit drifts the silhouette: re-run with a stricter prompt; if still off, composite the dots in code by overlaying two `<span>` dots absolutely positioned over the `<img>`. (Image edit is the preferred path — cleaner one-element render.)

2. **`src/components/cart/CartDrawer.tsx`** — two tiny tweaks:
   - Swap `src="/favicon-512.png"` → `src="/lion-mark.png"`.
   - Strengthen the backdrop blur for more "pop": `bg-black/70 backdrop-blur-2xl` (was `bg-black/60 backdrop-blur-xl`). Keep the same fade timing.

## What does NOT change

- Instant entrance (no stagger).
- Lion size/position, verse copy, hairline, white tint with warm halo.
- Drawer panel, header, items, footer, mobile/tablet behavior.
- No new dependencies, no animation timing changes.

## Verification

- Open cart on desktop → page behind is heavily blurred, lion has two clean black dot eyes, verse readable, layout identical.
- Mobile → still untouched.
