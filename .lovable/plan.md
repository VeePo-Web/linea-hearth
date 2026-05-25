## Goal
Eliminate two trust-breaking visual defects:
1. **Black redaction box** over the model's face on PDP (the "Tap to zoom" hint).
2. **Dead white bars** on every PLP product card (persistent mobile Quick View + Plus pills).

Replace with quiet-luxury overlays in the SSENSE / Aimé Leon Dore vocabulary: dark glass + chrome hairlines, sharp edges, hover-revealed on desktop, minimal on mobile.

---

## Defect 1 — Black box on PDP hero
**File:** `src/components/product/ProductImageGallery.tsx` (lines 267–283)

The "Tap to zoom" hint renders as `bg-background/80 backdrop-blur-sm` pinned at `top-4 left-1/2`. In the dark theme, `bg-background` is near-black, so it lands as a censored-bar over the model's forehead.

**Fix:** Move it to bottom-right corner, shrink it, restyle as chrome-glass:
- Position: `absolute bottom-3 right-3`
- Style: `bg-black/25 backdrop-blur-md border border-white/15 text-white/80`
- Type: `text-[9px] tracking-[0.2em] uppercase` (editorial micro-label)
- Auto-fade after 2.5s, pointer-events-none

---

## Defect 2 — White Quick View / Plus bars on PLP
**File:** `src/components/category/ProductCard.tsx`

Currently `showActions = isMobile || isHovered` forces a permanent `bg-white/95` Quick View pill + `bg-foreground/95` Plus pill across the bottom of every mobile card. Looks like a placeholder slab, eats ~40px of product imagery.

**New pattern (matches Aimé Leon Dore / SSENSE / Fear of God):**

### Mobile (touch)
- **No persistent Quick View bar.** Tapping the card navigates to PDP (primary intent).
- **Single floating `+` button** in bottom-right corner of the image: 40×40, `bg-black/40 backdrop-blur-md border border-white/20 text-white`, sharp edges, 12px inset. Triggers the inline size picker.
- **Heart** stays top-right but restyled: `w-10 h-10 bg-black/30 backdrop-blur-md border border-white/20 text-white`, sharp edges, no white pill.
- **Bottom scrim** gradient `bg-gradient-to-t from-black/40 via-transparent to-transparent` on bottom 30% so the floating chrome reads against any photo.

### Desktop (hover)
- On hover, reveal a single integrated dark-glass strip across the bottom: `bg-black/55 backdrop-blur-md border-t border-white/15`, containing ghost-styled Quick View (left) and Plus (right). Translate-up + fade in 200ms with `editorialEase`.
- Heart top-right uses the same chrome-glass treatment.
- 8px corner inset on the strip so it floats inside the image.

### InlineQuickSizePicker (when open)
- Switch the ProductCard call from `variant="light"` to `variant="dark"` so the picker matches the new chrome-glass language instead of flashing a near-black slab via `bg-background`.

### CartQuantityBadge (`badge` variant)
- Keep top-left position but tighten to chrome-hairline aesthetic: `bg-black/40 backdrop-blur-md border border-white/15 text-white` instead of solid `bg-foreground`.

---

## Files to edit
1. `src/components/product/ProductImageGallery.tsx` — rewrite the "Tap to zoom" hint block (lines 267–283).
2. `src/components/category/ProductCard.tsx` — replace the mobile/desktop action overlay logic (favorite button block, quick actions block, picker variant prop).
3. `src/components/category/CartQuantityBadge.tsx` — restyle `badge` variant container (lines 68–74) to chrome-glass.

## Acceptance criteria
- Zero solid white rectangles visible at rest on mobile PLP cards.
- Zero solid black rectangle over model faces on PDP.
- Product photography fills 100% of the card visually; any chrome floats as glass + hairline.
- Desktop hover still reveals Quick View + Plus, but as one integrated strip.
- Mobile users still get one-tap add via the floating `+` (picker if no remembered size, instant add if remembered).
- Sharp edges (`rounded-none`) preserved throughout — no rounded pills.
- No regressions to favorites, cart badge, success-overlay, NEW/SALE badges.

## Memory
Add `mem://design/plp-pdp/overlay-rules`: "No solid fills over product photography. Overlays must use dark glass (`bg-black/25–55 backdrop-blur-md`) + white chrome hairline (`border-white/15–20`). Mobile PLP has no persistent Quick View bar — single floating `+` bottom-right + tap-card-to-PDP."
