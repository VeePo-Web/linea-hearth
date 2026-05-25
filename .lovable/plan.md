## What I found

**1. Collection cards (homepage)** — `src/components/homepage/CategoryTiles.tsx` hardcodes 4 tiles (Hoodies / Tops / Tees / Accessories) to images of just two old products (`stay-holy-hoodie`, `heavenly-crewneck`). These don't update when you add new products.

The `categories` table already has an `image_url` column, and `products` + `product_images` are populated per category. Two places that drive collection imagery from the DB already exist as patterns: `FeaturedCollection.tsx` and `DropGrid.tsx`.

**2. "Our Reach"** — only appears in `src/components/about/ImpactMap.tsx` (lines 100 and 136).

**3. Champagne/silver accents** in the footer + community page:
- `src/components/footer/Footer.tsx` — `text-champagne-500` on the brand "JUDAH" word and on every link hover state (Shop / Support / About / social / legal).
- `src/components/community/CommunityHero.tsx` — "Tribe" headline word, eyebrow label, italic line, featured-story badge, avatar circle.
- `src/components/community/StoryGrid.tsx` — "02" eyebrow number.
- `src/components/community/SubmitStoryCTA.tsx` — "Testimony?" headline word.

---

## Plan

### A. Collection cards → live from database
Refactor `CategoryTiles.tsx` to fetch its 4 tile images from Supabase instead of hardcoded paths.

For each tile slug (`hoodies`, `tops`, `tees`, `accessories`):
1. Look up the category row by slug — use `categories.image_url` if set.
2. Otherwise pull the newest active product in that category and use its primary `product_images.image_url`.
3. If neither exists, render a neutral dark stone tile (no broken image).

One `useQuery` call with a 5-min staleTime, joined query, mapped onto the existing 4 tiles. Keep all current layout/animation/copy untouched — only the `image` source changes.

Result: as soon as you publish a product in the admin CMS, that category's tile updates automatically. No more stale "stay-holy-hoodie" everywhere.

### B. "Our Reach" → "Outreach"
Two string swaps in `src/components/about/ImpactMap.tsx`. Nothing else changes.

### C. Footer + Community: champagne → white
Replace `text-champagne-500` with `text-white` (and `bg-champagne-500` / `bg-champagne-500/20` with `bg-white` / `bg-white/10`) in:
- `Footer.tsx` — "JUDAH" word + all link hover states + Contact email hover + social links hover + legal links hover.
- `CommunityHero.tsx` — "Tribe" word, eyebrow, italic line, featured badge bg, avatar circle bg + text.
- `StoryGrid.tsx` — "02" eyebrow.
- `SubmitStoryCTA.tsx` — "Testimony?" word.

No layout, copy, spacing, or animation changes — purely color token swaps.

### Technical notes
- `CategoryTiles` becomes a client component using `@tanstack/react-query` + `supabase` (same pattern as `FeaturedCollection.tsx`).
- All other files: search-and-replace level edits.
- Memory note `color-palette` says Silver Chrome & Forest Green, no gold — champagne accents were drift from that. Switching to white aligns with the core aesthetic.

### Out of scope
- No new product photos are being uploaded in this pass — the live-DB wire-up means the tiles will reflect whatever product images already exist in your catalog.
- Other champagne accents elsewhere on the site (e.g. About pages, ambassador, cart) are untouched unless you ask.
