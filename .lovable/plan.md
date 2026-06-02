## Add Colors to Admin Product Form

Add a Colors manager inside the existing Variants section (Pricing tab) so admins can define a color list (name + hex swatch) and then bulk-generate variant rows for every Size × Color combination.

### Changes

**`src/components/admin/VariantManager.tsx`** (only file edited)

1. Add local "Colors" panel above the variants table:
   - Inputs: color name (e.g. "Black") + hex picker (`<input type="color">`) + Add button.
   - List of added color chips, each with the swatch, name, and a remove (×) button.
   - Colors live in component state (no new DB table). They're derived from existing variants on load (unique colors already present) so the panel stays in sync when editing.

2. Replace `bulkGenerateSizes` with smarter `bulkGenerate`:
   - If colors list is empty → behaves as today (generates S–XXL with `color: null`).
   - If colors list has entries → generates the cross-product of `STANDARD_SIZES × colors`, skipping any (size, color) pair that already exists. SKU uses existing `generateSku(size, color)` helper.
   - Button label adapts: "Generate S–XXL" vs "Generate Size × Color".

3. Upgrade the inline "Color" cell in the add-variant row to a `<Select>` populated from the colors list (with a free-text fallback option), so colors stay consistent.

### Technical notes

- No schema/migration changes. `product_variants.color` is already a `text` column and color hex isn't stored — the swatch is purely an admin convenience for picking consistent names. PDP swatch rendering already maps known color names to hex via `getColorHex()` in `src/lib/cartUtils.ts`.
- If the user later wants persistent hex per color, we'd add a `color_hex` column — out of scope here.
- Keeps the editorial aesthetic: `rounded-none` inputs/buttons, chrome hairline borders, no new colors introduced.

### Verification

- Open `/ops-portal/products/:id/edit` → Pricing tab → Variants.
- Add two colors (Black #1a1a1a, Forest #4CAF50), click Generate → 10 rows appear (5 sizes × 2 colors), each with correct SKU. Click again → no duplicates created.
- Edit an existing product that already has color variants → the colors panel pre-populates from existing variant colors.
