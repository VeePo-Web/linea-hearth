## Goal
Eliminate every reference to the two ghost products (`heavenly-crewneck`, `stay-holy-hoodie`) — they are not in the database, so the cards in your screenshot are showing data with no destination. Replace the 35 hard-coded `/products/.../` paths with images from real products in the catalog (or remove the section entirely where the image was decorative filler).

## What's wrong today
- `public/products/heavenly-crewneck/` and `public/products/stay-holy-hoodie/` hold 10 PNGs that don't correspond to any DB product.
- 13 source files hard-code those paths (35 references). Some are editorial decoration, some are real "shop this" carousels that would 404 if clicked.
- One DB product is `heavenly-khaki-low-profile-baseball-cap` (note: this is a real product — it stays. Only the old "Heavenly Crewneck" mockup gets purged.)

## Real-product image pool I'll draw from
Pulled from `product_images.is_primary = true` in the DB. Hero candidates that fit each slot's vibe:
- **Hoodie hero shots** → `you-need-jesus-heavy-weight-sun-fade-oversized-hoodie`, `in-jesus-name-oversized`, `ichthys-fish-oversized-sun-fade-hoodie`, `first-love-snow-washed-oversized-hoodie`
- **Tee hero shots** → `adam-god-mineral-wash-cotton-boxy-tee-shirt`, `burning-love-boxy-tee`, `faith-in-fear-boxy-tee`, `revelation-3-20-sun-fade-boxy-waffle-tee-shirt`, `names-of-god-mineral-wash-cotton-tee-shirt`
- **Sweater/crew** → `god-bless-line-of-judah-sweater`
- **Hat/cap** → `heavenly-khaki-low-profile-baseball-cap`, `blessed-denim-baseball-cap-embroidered`, `salvation-belongs-unisex-corduroy-baseball-cap`

## File-by-file plan

| File | Action |
|---|---|
| `public/products/heavenly-crewneck/` | **Delete entire folder** (5 files) |
| `public/products/stay-holy-hoodie/` | **Delete entire folder** (5 files) |
| `src/components/header/Navigation.tsx` (lines 61-68, 82-85) | Swap mega-menu preload + portrait image src to `you-need-jesus` (Hoodies card) + `adam-god-mineral-wash` (Tees card). Update labels to match. |
| `src/components/content/ProductCarousel.tsx` | This file hard-codes a fake 4-product array. Replace its data with the real DB products listed above so cards link to live PDPs. |
| `src/components/content/FiftyFiftySection.tsx` | Swap to one hoodie + one tee from real pool. |
| `src/components/content/LargeHero.tsx` | Swap to `god-bless-line-of-judah-sweater` lifestyle image. |
| `src/components/content/EditorialSection.tsx` | Swap to `first-love-snow-washed-oversized-hoodie`. |
| `src/components/homepage/HeroBlock.tsx` | Swap to `you-need-jesus` hero. |
| `src/components/homepage/FeaturedDrop.tsx` | Swap to `ichthys-fish-oversized-sun-fade-hoodie`. |
| `src/components/homepage/MissionBlock.tsx` | Swap to `adam-god-mineral-wash-cotton-boxy-tee-shirt`. |
| `src/components/about/StoryWorldwideTribe.tsx` (8 refs) | Rebuild collage from a mix of 8 real product hero shots. |
| `src/components/about/StoryJoinCTA.tsx` | Swap to `you-need-jesus`. |
| `src/components/checkout/PostPurchaseOffer.tsx` | This is the "You Might Also Like" surface from your screenshot. Replace hard-coded offer with a real DB-driven product (or two), e.g. `adam-god-mineral-wash` + `burning-love-boxy-tee`. Make the card link to the actual PDP. |
| `src/pages/Lookbook.tsx` (lines 48, 58) | Swap to two real hero shots from the pool. |
| `src/pages/admin/AdminProductForm.tsx` | Only references in a comment/placeholder string — safe to leave or remove if cosmetic. I'll inspect and clean if it's a real placeholder URL. |

## Image source format
I'll reference the real images via their Supabase storage public URLs (already used across the live PDPs), e.g.:
`https://harckavibhmimndfvnyo.supabase.co/storage/v1/object/public/product-images/<uuid>/<file>.png`

No new uploads. No new DB rows. Pure swap-and-delete.

## Acceptance
- Zero matches for `rg "heavenly-crewneck|stay-holy-hoodie" src/ public/`.
- `public/products/` directory is empty (or removed).
- Every former image slot renders a real product image whose card click lands on a live PDP.
- The "You Might Also Like" surface in your screenshot now shows real, in-stock products.

## Notes
- Editorial layouts (collages, hero compositions) keep their grid; only the `src` paths change.
- I won't touch product data or DB rows — only frontend asset references.
- After the swap I'll re-grep to prove zero ghost-product references remain.
