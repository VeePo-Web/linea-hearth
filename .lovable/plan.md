## Problem

On every product detail page, the left-hand image column is blank until you scroll. The product info appears on the right (or stacked on mobile), but the hero image only fades in after the first scroll event — leaving the most important asset missing from the first paint.

## Root cause

In `src/components/product/ProductImageGallery.tsx`, the desktop gallery wraps each image in a `<DesktopImage>` that gates its `animate` state on `useInView(ref, { once: true, amount: 0.2 })`. The first image's `hidden` variant is:

```
clipPath: "inset(0% 100% 0% 0%)"
opacity: 0
```

So the hero is fully clipped and transparent until framer-motion's IntersectionObserver fires `isInView = true`. Because the observer runs asynchronously after first paint (and requires 20% visibility), the hero stays invisible until the user scrolls — exactly the bug reported.

The same gating is applied to subsequent images, which is correct for them (they are below the fold), but wrong for index 0 which is always above the fold by design.

## Fix

Single-file change in `src/components/product/ProductImageGallery.tsx`:

1. For `index === 0` in `DesktopImage`, render the image with `animate="visible"` immediately (no `useInView` gate). Keep the Ken Burns scale-in so it still feels cinematic, but the image is on-screen at first paint.
2. Add `loading="eager"` and `fetchPriority="high"` to the first image so the browser prioritizes it. Keep `loading="lazy"` for index > 0.
3. Leave the subsequent-image scroll-reveal behavior untouched.
4. No changes to the mobile slider, reduced-motion branch, or `ProductInfo` sticky layout.

## Verification

- Navigate to `/products/<any-slug>` at desktop and mobile widths; confirm the hero image is visible on first paint, before any scroll.
- Confirm subsequent images still fade up on scroll.
- Confirm reduced-motion users still get the static gallery.

## Scope guardrails

- Frontend/presentation only. No backend, no schema, no copy changes.
- Does not touch product info column, breadcrumb, or sticky behavior.
