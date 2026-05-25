## Goal
Make the close X buttons on product overlays readable on any background (white product photo OR dark theme) by giving them a clean chrome-glass treatment with a thin dark hairline ring + opaque dark icon stroke.

## What I'm changing

### 1. `QuickViewModal.tsx` close button (line 440-447)
Currently `bg-white/80 hover:bg-white rounded-full` with default-colored X — invisible on white product photography behind it.

**New:** Sharp-edged 36×36 square button with:
- `bg-white border border-black/80` (white fill with thin black hairline ring)
- `text-black` icon at stroke-width 1.75
- `rounded-none` (matches editorial sharp-edge system)
- `hover:bg-black hover:text-white hover:border-black` inversion on hover
- Same z-modal token

Result: black hairline ring keeps it crisp on white backgrounds; white fill + black icon keeps it readable on dark backgrounds.

### 2. `ImageZoom.tsx` close X (line 79)
Same treatment for the full-screen image zoom close button — currently a large floating X on photography.

### 3. `dialog.tsx` shadcn primitive close X (line 45-48)
Same hairline treatment so any modal across the app inherits the readable close button. Adds `border border-foreground/80 bg-background` to the close trigger and removes the rounded corners.

## Files edited
1. `src/components/category/QuickViewModal.tsx` — close button styling
2. `src/components/product/ImageZoom.tsx` — close button styling
3. `src/components/ui/dialog.tsx` — DialogPrimitive.Close styling

## Acceptance
- Close X readable on pure white, pure black, and mixed photography
- Sharp edges (`rounded-none`), matches editorial system
- Thin dark hairline ring (1px black) provides the contrast guarantee
- Hover state: clean color inversion (black fill, white icon)
