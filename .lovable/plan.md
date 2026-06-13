# Garment Style — Stress Test & Audit

I walked the full path: migration → admin CRUD (`StyleManager`) → variant tagging (`VariantManager.style`) → PDP (`ProductInfo` + `StyleSelector` + style-aware `ColorSwatchSelector`) → cart (`useCart`) → server checkout (`create-checkout-session`) → order rows (`order_items.variant_style`) → emails (`send-order-confirmation`) → admin/account order views.

The wiring is end-to-end and consistent. Server price authority correctly adds `style.price_delta`, RLS + GRANTs on `product_styles` are correct, lowercase comparison on the server prevents casing drift, and emails render the Style column only when at least one item has one. **But three real bugs surfaced under stress, one of them critical.**

---

## Critical

### 1. Cart `removeItem` / `updateQuantity` collide across styles of the same product
`useCart.removeItem(id)` filters by `item.id` only — and `productIdToCartId(product.id)` returns the same numeric id for every style of a given product. `addItem` correctly creates a separate line per `(id, size, color, style)`, but removing or changing quantity on one Hoodie line will silently nuke/edit the matching T-Shirt line too.

This bug also existed for color variants but was masked because most products only had one cart variant on screen at a time. With styles, a user can realistically have Hoodie + Tee of the same design in the cart, so it is now reproducible.

Fix: switch `removeItem` / `updateQuantity` from `id` to a composite key (`id + size + color + style`), or assign each cart line a stable `lineKey` on add and key all mutations off that.

---

## High

### 2. Renaming a style in admin orphans variants and breaks live carts
`StyleManager.patchStyle({ name })` updates only the `product_styles` row. `product_variants.style` is a free-text mirror, so:

- Existing variants tagged with the old name vanish from style-aware color/size filtering on the PDP.
- Any cart item already holding the old name will hit checkout, the server will find no matching `product_styles` row, set `styleAdjustment = 0`, and (if the delta was nonzero) reject the whole cart with "Cart prices are out of date."

Fix: when the name changes in `patchStyle`, run a same-product `UPDATE product_variants SET style = newName WHERE style = oldName`.

### 3. Deleting a style strands live carts the same way
`deleteStyle` already clears `product_variants.style`, but it does nothing for users whose `localStorage` cart still references the deleted name. The server returns the same 409 with no clue what to do.

Fix (server side, smallest blast radius): if `item.style` is set and no row matches, fall back to `styleAdjustment = 0` *and* re-validate the client price against `basePrice + variantAdj` before rejecting. Net effect: deleted-style cart lines simply charge the base price instead of bricking checkout.

---

## Medium

### 4. Style-aware availability hides colors but never auto-recovers selection
On PDP, when the user picks a style that doesn't include the currently-selected color, `ColorSwatchSelector` slashes the color out but `selectedColor` stays set. `canAddToBag` still considers a color selected, so the user can press Add to Bag with an invalid combination and `sizes` will silently be empty.

Fix in `ProductInfo.handleStyleChange`: if `selectedColor && colorsForActiveStyle && !colorsForActiveStyle.has(selectedColor.toLowerCase())` → `setSelectedColor(null)`.

### 5. `StyleManager` allows duplicate names with different casing
The dedupe check is case-insensitive but the DB `UNIQUE (product_id, name)` is case-sensitive, so "Hoodie" and "hoodie" both insert and then collide downstream (server lowercases). Either normalize on insert (`name.trim()`) and add a `lower(name)` unique index, or just store lowercased.

---

## Low / polish

### 6. PLP "+N styles" chip
Confirm `ProductGrid` / `Catalogue` queries actually request `product_styles(count)` and that `ProductCard` renders the chip when `count >= 2`. Touch them up if missing.

### 7. Stripe line description still says `(Style / Color / Size)`
The Stripe Checkout line uses `item.name + (style / color / size)`. With a dedicated `variant_style` column, consider keeping the bracketed descriptor (it's the only place the customer sees style at checkout) but the Stripe Product `name` should remain just the product name — which it already is. No change needed; flagged only for confirmation.

---

## Stress matrix walked

| Scenario | Result |
|---|---|
| Product with 0 styles | Selector hidden, server sends no style, base price wins ✓ |
| Product with 1 style | Auto-selected, selector hidden, delta applied ✓ |
| Product with 3 styles, nonzero deltas | PDP price updates, server re-authorizes ✓ |
| Style restricts colors via variant matrix | Slashed swatch ✓ but selection not cleared → bug #4 |
| Add Hoodie + Tee of same product | Two cart lines created ✓ but remove/qty mutate both → bug #1 |
| Admin renames "hoodie" → "Hoodie Heavyweight" with live cart open | Checkout 409 → bug #2 |
| Admin deletes style with live cart open | Checkout 409 → bug #3 |
| Anonymous checkout with style | RLS read passes (public SELECT on product_styles) ✓ |
| Casing drift Hoodie vs hoodie | Server lowercases ✓ but admin can duplicate → bug #5 |
| Bundle + style stacking | Server recomputes both independently ✓ |
| Email "Style" column | Renders only when ≥1 item has style ✓ |
| AccountOrderDetail / AdminOrderDetail | Renders `Style / Color / Size` from `variant_style` ✓ |

---

## Technical execution order (after approval)

1. `useCart.tsx` — refactor `removeItem` / `updateQuantity` to a composite line key (`buildLineKey(item) = ${id}|${size}|${color}|${style}`) and update every caller in `CartDrawer`, `CartItem`, `CartItemRow`, etc.
2. `create-checkout-session/index.ts` — when `item.style` is set and no matching `product_styles` row exists, fall back to `styleAdjustment = 0` *and* accept either `basePrice + variantAdj` or `basePrice + variantAdj + 0` so deleted/renamed styles don't 409. Redeploy.
3. `StyleManager.tsx` — cascade rename to `product_variants.style` on `patchStyle({ name })`. Normalize names to a single canonical casing on insert and update.
4. `ProductInfo.handleStyleChange` — clear `selectedColor` when it falls outside `colorsForActiveStyle`.
5. Verify PLP `+N styles` chip is actually rendering; add if missing.

No new tables, no new RLS, no schema migrations required. All changes are surgical edits in existing files plus one edge-function redeploy.
