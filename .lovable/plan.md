## Goal

Three small polish passes on the cart-open scene:
1. Lion shows its eyes again (currently invisible — the white-tint filter erased the black dots).
2. Verse pops against the blurred backdrop with a warm luminous tone.
3. Drawer **close** feels a touch more polished, while **open** stays exactly as fast as it is now.

## Changes

### 1. Lion eyes — regenerate the asset, drop the destructive filter

The current `public/lion-mark.png` has black dot eyes, but `CartDrawer.tsx` applies `filter: brightness(0) invert(1)` which forces every pixel to pure white, erasing the eyes.

- **Regenerate `public/lion-mark.png`** via `imagegen--edit_image` from `public/favicon-512.png`: a **white lion silhouette on transparent background** with **two small dark charcoal eye dots baked in** (so eyes survive without CSS tricks). Prompt locks silhouette/mane shape and only changes color + adds eyes.
- **`CartDrawer.tsx`** (line 180-183): remove `brightness(0) invert(1)` from the filter. Keep the warm halo `drop-shadow(0 0 32px rgba(201,169,97,0.18))` so the lion still glows.

### 2. Verse tone — warm champagne-chrome (in-palette)

Project memory forbids yellow/gold. Default to **champagne-chrome** `#D9CFB8` at 85% opacity with a soft white text-shadow for the verse line — reads luminous-warm against the dark blur, still Silver Chrome family, no gold.

- **`CartDrawer.tsx`** (line 189-191): swap `text-white/65` for an inline `style={{ color: "rgba(217, 207, 184, 0.92)", textShadow: "0 0 24px rgba(217, 207, 184, 0.25)" }}` and bump font weight from `font-light` to `font-normal` for a hair more presence. Also brighten the "EXODUS 28:2" eyebrow from `text-white/55` to the same champagne tone at lower opacity.
- **Override option**: if you'd rather break the no-gold rule for this single touchpoint, say "true gold" in your reply and I'll swap to `#C9A961` (the warm halo color already in the lion drop-shadow) and update the brand-voice memory to note the exception.

### 3. Polished close transition (open unchanged)

Only the `exit` variants are touched — `visible` (open) values stay identical, so open speed is unchanged.

- **`backdropVariants.exit`** (line 31): drop the `delay: 0.1`, lengthen to `duration: 0.35`, ease `[0.4, 0, 0.2, 1]`. Backdrop and panel now fade in sync instead of the backdrop lingering.
- **`drawerVariants.exit`** (lines 47-54): lengthen from `0.3s` to `0.4s`, switch ease to `editorialEase` (matches open), and add a subtle `opacity: 0.85` at the end so the panel softens as it slides — currently it slides at full opacity which feels abrupt.

## What does NOT change

- Open timing (backdrop fade-in, drawer slide-in, item stagger) — untouched.
- Lion size/position, verse copy, hairline divider, layout, mobile behavior.
- Drawer panel structure, header, items, footer, hooks, scroll lock.
- No new dependencies.

## Verification

- Open cart → identical speed and feel as today, but lion now has two visible dark eyes and the verse glows warm-champagne.
- Close cart (X, Esc, or backdrop click) → backdrop and panel fade out together over ~0.4s with the editorial easing, no abrupt cutoff.
- Mobile/tablet → unchanged.
