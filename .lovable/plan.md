# PDP Image Gallery — Horizontal & Half-Size

Scope: `src/components/product/ProductImageGallery.tsx` only. No layout/grid changes to `ProductDetail.tsx`, no business logic.

## What changes

**Desktop (lg+):**
- Replace the vertical stack of full-column images with a single-row horizontal scroller.
- Each image sits at ~50% of the gallery column width (aspect 3/4 preserved), so two images are visible at once and a third peeks in — inviting horizontal scroll/drag for additional views.
- `overflow-x-auto`, `snap-x snap-mandatory`, scrollbar hidden, soft right-edge fade as scroll affordance.
- First image keeps eager loading + Ken Burns reveal; subsequent images keep the in-view fade-up but applied horizontally.
- Click-to-zoom behavior unchanged.

**Tablet / Mobile (<lg):**
- Already side-to-side. Keep the swipeable slider, AnimatePresence, dots, and "Tap to zoom" hint exactly as-is.
- Apply a subtle size reduction by capping the slider with `max-w-[88%] mx-auto` on mobile and `max-w-[70%]` on sm/md so the frame reads as "half-size" relative to the viewport while staying centered. Aspect 3/4 preserved.

**Reduced-motion branch:**
- Mirror the same horizontal layout on desktop (no animations) and the same mobile cap, so the reduced-motion path matches.

## Preserved
- Sorting, zoom modal, dot indicators, swipe gestures, alt text, loading priorities, accessibility labels.
- No changes to color selector, product info column, or page grid.

## Technical notes
- Add a small `.no-scrollbar` utility inline via `[&::-webkit-scrollbar]:hidden [scrollbar-width:none]` to avoid touching global CSS.
- Each desktop slide: `className="snap-start shrink-0 basis-[calc(50%-0.5rem)] aspect-[3/4]"` inside a `flex gap-4` track.
- Right-edge fade: absolute `bg-gradient-to-l from-background` overlay, `pointer-events-none`, `w-12`, only on lg+.
