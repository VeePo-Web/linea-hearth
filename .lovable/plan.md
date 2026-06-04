# Remove Crewneck from Catalog Surfaces

## Context

DB check: no `crewneck` products and no `crewnecks` category exist. The only "Heavenly*" products are caps (Heavenly Khaki Low-Profile Baseball Cap, etc.). `SearchOverlay` already lists "Heavenly Cap" — good.

Remaining stale crewneck references are all in frontend marketing/UI strings (and one size-memory list). The 3D try-on `CrewneckGeometry` is internal rendering engine code, not catalog — leaving it alone unless you want it ripped out too.

## Changes

1. **`src/components/category/CollectionHero.tsx`** (lines 90–94) — Remove the `"crewnecks"` entry from the category hero map so no PLP can render a Crewnecks hero.

2. **`src/components/content/FiftyFiftySection.tsx`** (line 44) — Change heading `"Crewnecks & Tees"` → `"Tees & Tops"` (or your preferred label).

3. **`src/hooks/useSizeMemory.ts`** (line 64) — Remove `'crewnecks'` from the tops category list used for size-memory grouping.

4. **Verify** — re-grep `crewneck` across `src/` to confirm only the try-on 3D engine references remain.

## Out of scope

- `src/components/try-on/**` (CrewneckGeometry, uvProjection, GarmentLayer, useGarmentTexture) — internal 3D mesh code, not catalog/imagery. Tell me if you want this purged too.
- No DB migration needed (no crewneck rows exist).
- `REAL_PRODUCT_IMAGES` already has no crewneck keys.
