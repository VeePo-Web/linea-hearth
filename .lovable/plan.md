
# Add the Genesis 49:9–10 verse hero to /catalogue

The "Enter" button on the landing nav routes to `/catalogue` (`src/pages/LandingPage.tsx` → `navigate('/catalogue')`). That page (`src/pages/Catalogue.tsx`) currently opens with a plain text header ("The Full Drop / All Products / N pieces") and is missing the scripture treatment we already ship on every `/category/:slug` route via `CollectionHero`.

## Change

**File:** `src/pages/Catalogue.tsx`

1. Import `CollectionHero` from `@/components/category/CollectionHero`.
2. Replace the existing "Page Header" block (the `<div className="px-4 ... pt-10 pb-8 border-b">` containing the eyebrow + H1 + count) with:
   ```tsx
   <CollectionHero category="shop" productCount={filtered.length} />
   ```
   This reuses the same Lion of Judah composition (Genesis 49:9–10 fragments, hairline, "All Products" title, live piece count, mobile/desktop split) that lives on `/category/shop`, so the verse layout — including the recent mobile tuning — applies identically.
3. Remove the top `pt-20 md:pt-24` from the page wrapper since `CollectionHero` owns its own full-bleed dark surface and sits flush under the fixed header (matching `/category/:slug` behavior).
4. Keep everything below the hero (toolbar, filter drawer, product grid) byte-for-byte unchanged.

## Why "shop" as the category prop

`CollectionHero` reads `collectionData[category]` to derive `bgClass`, `tagline`, and `title`. The `shop` entry produces "All Products" + the brand-wide tagline, which is exactly what the catalogue route represents (the full drop, no slug filter). No new entry in `collectionData` is needed.

## Out of scope

- No changes to `CollectionHero.tsx` itself — the scripture, sizes, and mobile rhythm stay as last tuned.
- No changes to toolbar, filters, sort, or product grid.
- No new routes, no new copy.

## Acceptance

- Visiting `/catalogue` (via the landing "Enter" button or directly) shows the Genesis 49:9–10 scripture hero above the filter bar, matching `/category/shop`.
- Mobile 390px: no overlap between verse fragments and the "All Products" title (inherits the existing mobile grid layout).
- `rg "Judah is a lion" src/` still returns exactly the 2 matches already in `CollectionHero.tsx` (mobile + desktop strings) — no duplication.
