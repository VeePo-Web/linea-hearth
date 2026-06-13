# Feature: Garment Style Variants (Same Design, Different Pieces)

Mirror the existing `product_colors` pattern to add a **Style** axis per product. The admin uploads which garment types (Hoodie, T-Shirt, Crewneck, Long Sleeve, etc.) a given design comes in; the customer picks Style + Color + Size on the PDP. The `product_variants` table already has a `style` column — we just need a parent list table, admin UI, and a public selector.

## 1. Database (one migration)

New table `public.product_styles` — exact shape of `product_colors`:

```text
id              uuid pk
product_id      uuid → products(id) on delete cascade
name            text not null          -- "Hoodie", "Long Sleeve Tee"
label           text                   -- short display label (optional)
icon_url        text                   -- optional thumbnail/silhouette
price_delta     numeric default 0      -- e.g. hoodie +$20 over tee base
position        int default 0
created_at / updated_at
unique (product_id, name)
```

Grants + RLS mirror `product_colors` (public SELECT, admin write via `has_role`).
No change to `product_variants` — its existing `style` text column is the link (matched by `name`, same way `color` works today).

## 2. Admin — `VariantManager.tsx` + `AdminProductForm.tsx`

- New **"Styles"** card above the existing "Colors" card on the product form, identical UX:
  - List rows: name, optional label, price delta, optional icon upload (reuses `ImageUploader` → `product-images` bucket, `styles/` prefix), reorder ↑/↓, delete.
  - "Add Style" button → inline row.
- New `useProductStyles(productId)` hook — copy of `useProductColors`.
- **Variant generator** in `VariantManager` extended to a 3-axis matrix: `sizes × colors × styles` (if styles exist; falls back to 2-axis when none, so existing products are untouched).
- Variant table gains a "Style" column (already supported by `product_variants.style`).

## 3. Storefront — PDP

- New `StyleSelector.tsx` (twin of `ColorSwatchSelector`): horizontal pill row, shows icon + name, selected state uses chrome hairline underline.
- `ProductInfo.tsx`:
  - Load styles via `useProductStyles`.
  - Hide selector entirely when 0 or 1 style exists (zero regression for current single-style products).
  - Filter `sizes` / `colors` / stock by the selected style alongside the existing color filter.
  - Apply `price_delta` to the displayed price + the cart line item.
  - Pass `style` through `onAddToBag` → cart line item (new optional `style` field on `CartItem`).

## 4. Cart + Checkout

- `CartItem` gains optional `style?: string`.
- `useCart.addItem` dedupe key extended to `(id, size, color, style)` — different style = different line.
- Cart drawer + `Checkout.tsx` show "Style · Color · Size" instead of "Color · Size" when style is set.
- Edge function `create-checkout-session`: include style in Stripe line-item description and in `order_items.variant_label` (already a free-text field).

## 5. PLP (`ProductCard.tsx`)

Out of scope for v1 — card stays clean. We only surface the style picker on the PDP. (Easy to add a "+2 styles" chip later if requested.)

## 6. Backward compatibility

- Products with no rows in `product_styles` behave exactly as today.
- Existing variants whose `style` is NULL continue to match when no style is selected.
- No data migration / no Stripe re-sync needed.

## Verification checklist

1. Admin: create 3 styles on an existing product, upload an icon, reorder, set a +$20 delta on Hoodie.
2. Admin: generate variants → matrix produces size × color × style rows.
3. PDP: style pills render, switching style filters sizes/colors correctly and updates price.
4. Add to bag with Hoodie / Black / L → cart shows "Hoodie · Black · L"; add Tee / Black / L separately → two distinct lines.
5. Checkout → Stripe line description includes style; order email Tapstitch block lists style per item.
6. Product with no styles configured → PDP renders unchanged.

## Files touched

**New**
- `supabase/migrations/<ts>_product_styles.sql`
- `src/hooks/useProductStyles.ts`
- `src/components/product/StyleSelector.tsx`

**Edited**
- `src/components/admin/VariantManager.tsx` (Styles card + 3-axis generator + Style column)
- `src/pages/admin/AdminProductForm.tsx` (mount Styles card)
- `src/components/product/ProductInfo.tsx` (selector, filtering, price delta, addToBag payload)
- `src/hooks/useCart.tsx` (dedupe key + CartItem type)
- `src/components/cart/*` drawer line rendering (style label)
- `src/pages/Checkout.tsx` (line label)
- `supabase/functions/create-checkout-session/index.ts` (variant label)
- `supabase/functions/send-order-confirmation/index.ts` (Tapstitch block includes style)
