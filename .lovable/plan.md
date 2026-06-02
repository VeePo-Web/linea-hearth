
# World-Class Color System

Today's gap: colors are stored only as a free-text string on each variant. Hex is hardcoded in 5+ files (`ProductInfo`, `ProductCard`, `cartUtils.getColorHex`, `FilterSortBar`, etc.). The admin "Colors" panel state is lost on reload, and the PDP can't swap images per color. Best-in-class shops (TEMU, Zara, Uniqlo) treat color as a first-class object with **name + hex + image set + per-variant stock rollup**.

## What we'll build

### 1. Schema — one source of truth
New table `product_colors`:
- `id`, `product_id`, `name`, `hex`, `swatch_image_url` (nullable), `position`, `created_at`
- Unique `(product_id, lower(name))`
- RLS: public SELECT, admin write

Add `color_id uuid` (nullable, FK → `product_colors.id`) to `product_variants`. Keep existing `color` text for backward compatibility; new code reads from the joined `product_colors` row.

Optional `product_color_images` table (`color_id`, `image_url`, `position`) so each color shows its own gallery on the PDP — Zara/TEMU pattern.

GRANTs + RLS in same migration (per project standard).

### 2. Admin — Colors as a first-class panel
Rewrite `VariantManager` Colors section + add a sibling `ColorManager`:

- **Persistent colors panel** above variants: name + native `<input type="color">` swatch + optional thumbnail upload (reuses `ImageUploader` → `product-images` bucket, `colors/` prefix).
- Each color row shows: drag handle (reorder), swatch chip, name, hex, image count, **stock rollup** ("S 4 · M 0 · L 2"), edit/delete.
- Delete guards against in-use variants (confirm + cascade option).
- **Bulk Generate Size × Color** now writes `color_id` on each variant (and keeps `color` text in sync for legacy clients).
- Per-color "Add images" opens a mini uploader that writes to `product_color_images`.
- Auto-suggest hex when typing a known color name (Black, Navy, Olive, etc. from current `getColorHex` map) so admin doesn't have to pick every time.

### 3. Storefront — TEMU/Zara polish

**PLP `ProductCard`:**
- Replace inline hex ternary with a `<ColorDots>` component reading `product_colors`.
- Hover a dot → swap the card image to that color's first `product_color_images` entry (if present), with a 200ms crossfade.
- "+3" overflow chip when >4 colors.
- Show color name on dot hover (small chip tooltip).

**PDP `ProductInfo` + new `ColorSwatchSelector` v2:**
- Reads `product_colors` instead of deriving from variant text. Each swatch shows hex; if `swatch_image_url` is set, render it inside the circle (TEMU pattern for prints/heathers).
- Selecting a color: swaps the product gallery to that color's images, updates URL (`?color=black`), and resets size to first in-stock for that color.
- OOS color = diagonal slash + greyscale (we already have this style); show "Notify me" CTA on click.
- Display "**3 Colors**" count and selected color name with hex chip.

**Filters (`FilterSortBar`):**
- Replace hardcoded list with distinct colors loaded from `product_colors` (scoped to current category). Render as actual swatches, not text checkboxes.

### 4. Shared helpers
- New `src/lib/colors.ts`: `getColorHex(name, fallback?)` — checks DB-loaded colors first, falls back to current static map, then to the name string. All 5 hardcoded hex maps deleted and replaced with this helper.
- New hook `useProductColors(productId)` for admin + PDP.

## Out of scope
- Migrating historical free-text colors into `product_colors` rows — we'll add a one-shot "Backfill colors" button in admin that scans variants and creates rows (admin clicks when ready).
- Per-color pricing (already supported via variant `price_adjustment`).

## Verification
1. Admin `/ops-portal/products/:id/edit` → add 3 colors with hex + one swatch image → reload → all 3 persist.
2. Generate Size × Color → variants table shows linked color name + hex chip.
3. PLP card hover on a color dot → image crossfades to that color's photo.
4. PDP `?color=navy` deep link → navy preselected, gallery shows navy images, sizes filtered to navy stock.
5. Category filter shows real product colors as swatches, multi-select narrows grid.
6. Deleting a color in admin warns about N variants using it.

## Technical notes
- Migration order per project rule: CREATE TABLE → GRANT (anon SELECT, authenticated all, service_role all) → ENABLE RLS → POLICY.
- Reuse `ImageUploader` + existing `product-images` bucket, no new bucket.
- Realtime not needed for colors.
- All UI stays `rounded-none` per design memory; swatches stay circular (the one exception, matching current PDP).
