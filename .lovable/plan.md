# Admin Variants — Temu-style Color UX

Scope: visual + interaction refresh of the **Colors panel** inside `src/components/admin/VariantManager.tsx`. No schema changes — `product_colors` / `product_color_images` / `color_id` already exist. No storefront changes.

## What's wrong today
- Colors render as a vertical list — slow to scan once you have 6+ colors.
- Hex picker is only reachable through an "Edit" mode (Pencil → save/cancel).
- Swatch image upload is hidden behind a hover state on the tile (not obvious, no preview thumb).
- Stock/variant rollup is text-only and easy to miss.
- No bulk actions (paste list, recolor, reorder).

## Target UX (Temu / Shein / Zara admin patterns)

```text
COLORS (4)                        [+ Add color] [Paste list]
┌──────────┬──────────┬──────────┬──────────┐
│  ▓▓▓▓▓▓  │  ▓▓▓▓▓▓  │  [img]   │  ▓▓▓▓▓▓  │  ← 80px swatch tile, drag handle top-left
│  Forest  │  Bone    │  Heather │  Onyx    │  ← inline-editable name
│  #1F3A2E │  #EFE7D8 │  upload  │  #0A0A0A │  ← click hex → native color picker opens
│  5 var · │  5 var · │  0 var · │  5 var · │
│  42 stk  │  12 stk  │  — stk   │  88 stk  │
│  [img]🗑│  [img]🗑│  [img]🗑│  [img]🗑│  ← icon row: swap image / delete
└──────────┴──────────┴──────────┴──────────┘
```

### Tile interactions (everything inline, zero modals)
- **Swatch fill**: click → opens `<input type="color">` directly on the tile, live updates DB on `change` (debounced 400ms). No save button.
- **Image upload**: dedicated image icon button + drag-and-drop onto tile. Shows uploaded thumb covering the hex. "Remove image" reverts to hex.
- **Name**: click name → in-place text input, blur or Enter to save.
- **Delete**: trash icon → keeps existing `AlertDialog` confirm.
- **Reorder**: drag handle (grip icon) → updates `position`. Use `@dnd-kit/sortable` (already in deps; fall back to up/down arrows if not).
- **Status chip**: small `0 variants` warning chip on tiles not yet linked to any variant, with a one-click "Generate sizes for this color" button that inserts S–XXL for that color only.

### Add-color row (top)
- Bigger inline form: name input + color picker + "Add" button, all on one line.
- Auto-hex suggestion from `getColorHex(name)` kept.
- **Paste list** button → modal with textarea: one color per line (`Forest #1F3A2E` or just `Forest`). Bulk insert.

### Bulk generate (unchanged logic, new placement)
- Move "Generate Size × Color" button up next to colors header so it's discoverable right after adding colors.
- Add count preview: `Will create 15 new variants (5 sizes × 3 colors)`.

### Variants table polish (minor)
- Show the color swatch dot (12px) + name in the Color column instead of plain text, sourced from `color_id` join.
- Group rows visually by color (subtle row tint matching `hex` at ~6% opacity).

## Technical notes
- Single file: `src/components/admin/VariantManager.tsx` (rewrite the Colors section + Variants color cell). Extract a `ColorTile` subcomponent for clarity.
- Debounced hex updates via `setTimeout` ref pattern (no new deps).
- Drag-and-drop: if `@dnd-kit/core` is not already installed, fall back to ↑/↓ buttons on the tile and skip dnd-kit to avoid new deps.
- Live color update writes to `product_colors.hex`; also bumps `position` on reorder.
- Paste-list parser: `^(.+?)\s+(#[0-9a-fA-F]{6})?$` → name + optional hex; missing hex falls back to `getColorHex(name)`.
- Per-color "Generate sizes" reuses existing `bulkGenerate` logic scoped to one color.
- All UI keeps `rounded-none`, silver/forest tokens, semantic colors only.

## Out of scope
- Storefront swatch rendering (already shipped).
- Per-color image gallery (`product_color_images` table) — current single `swatch_image_url` is enough for admin parity with Temu.
- Migrating legacy free-text `color` strings — separate backfill task.

## Verification
1. Add 3 colors via inline form → tiles render in grid.
2. Click swatch → native picker → hex updates live, persists on reload.
3. Drop a PNG onto a tile → uploads, thumb replaces hex fill.
4. Paste `Navy #0A1F44\nIvory` → both insert, Ivory gets auto-hex.
5. Reorder via drag (or arrows) → order persists.
6. Bulk generate shows correct preview count and creates rows with `color_id` linked.
7. Variants table shows colored dot + name per row.
