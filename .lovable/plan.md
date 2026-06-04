# Catalogue Quick Actions + Category Cleanup

## 1. Add hover Quick View / Quick Add to `/catalogue`

`src/pages/Catalogue.tsx` currently renders its own bare product tiles. Replace the inline tile markup inside the grid with the existing `ProductCard` component used by `/category/*` pages — that component already ships the hover dark-glass strip with **Quick View** + **Plus** add-to-bag, mobile floating +, size picker, favorite, badges, and color swatches.

Wiring:
- Update the `useQuery` select to include `product_variants(size, color, stock_quantity)` so `ProductCard`'s size/stock logic works.
- Add the same `QuickViewModal` + `AuthModal` state Catalogue is missing, mirroring `ProductGrid.tsx`.
- Pass `onQuickView` and `onAuthRequired` props; render the modals after the grid.
- Keep Catalogue's existing toolbar, category pills, sort, and mobile filter drawer.

## 2. Fix miscategorized products

Current DB state (active only):
- `Tops` (parent) has **1 product** — "Blessed be his name" Mineral Wash Boxy Tee → actually a tee, move to `tees` (or `short-sleeve`).
- `Hoodies` (parent) has **1 product** — "God Bless" Line of Judah Sweater → move into `pullover-hoodies` subcategory.

After moves, parent categories `Tops` and `Hoodies` hold 0 direct products (subcategories still aggregate up via `ProductGrid`'s parent→subcategory query, so the Hoodies parent page keeps working).

I'll confirm the target slugs with you before running the SQL migration (see Question below).

## 3. Remove empty category pages from navigation

`src/components/header/Navigation.tsx` hardcodes many subcategories that don't exist in the DB. Compared to populated categories, the following are empty and should be removed from the desktop + mobile menus:

- **Bottoms** entire branch (Shorts, Joggers, Sweatpants) — no `bottoms` category, no products
- **Tees** subs: Cropped (empty); keep Short Sleeve + Long Sleeve
- **Hoodies** subs: Crewnecks, Lightweight Hoodies (don't exist); Zip-Up Hoodies, Quarter Zips (exist but 0 products) — remove all four, keep Pullover Hoodies
- **Hats** subs: Snapbacks, Dad Hats, Beanies (don't exist) — remove all three, Hats stays as a flat link
- **Accessories** entire branch (Bags, Socks, Stickers) — no `accessories` category, no products

Final visible nav:
- Tees → Short Sleeve, Long Sleeve
- Hoodies → Pullover Hoodies
- Hats (no submenu)

Same cleanup applied to `MobileMenu.tsx` if it mirrors the same data.

## 4. Out of scope

- Not creating new DB categories.
- Not touching admin tooling — products can still be reassigned in the admin UI later.
- Not changing the `/catalogue` toolbar/sort/filter UX, only the tile.

---

## Question before I build

For the two miscategorized products, which subcategory do you want?

1. **"Blessed be his name" Mineral Wash Boxy Tee** → `tees` (parent) or `short-sleeve` (sub)?
2. **"God Bless" Line of Judah Sweater** → `pullover-hoodies`, or leave under `hoodies` parent?

If you just say "you pick" I'll use `short-sleeve` and `pullover-hoodies`.
