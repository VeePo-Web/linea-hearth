## Goal
World-class, "Victorious SEO"-tier technical + on-page SEO for lineofjudah.clothing — **zero visible UI changes**. All work happens in `<head>`, JSON-LD scripts, `robots.txt`, `sitemap.xml`, and per-route `<Helmet>` metadata. No component markup, styling, copy, or layout is touched.

## Scope guardrails
- No edits to any rendered component, page body, Tailwind class, or visual element.
- Only files touched: `index.html`, `public/robots.txt`, `public/sitemap.xml`, per-route `<Helmet>` blocks inside existing page files (metadata only — no JSX visible to users), and optionally a new `scripts/generate-sitemap.ts` for dynamic product/lookbook URLs.
- No new dependencies (`react-helmet-async` already installed).

## Audit findings (current state)
1. **index.html** — Title/description are decent but generic; missing: `og:site_name`, `og:locale`, `twitter:card` for product previews, Organization + WebSite JSON-LD with `SearchAction`, `theme-color`, robots directives.
2. **sitemap.xml** — Static, hand-maintained, missing every product page (`/product/:slug`), every category (`/category/:slug`), lookbook looks, FAQ, accessibility, ambassador subpages. `lastmod` absent on all entries. Hand-edited file can't track DB-driven product/lookbook URLs.
3. **robots.txt** — Fine, but missing `Disallow` for `/ops-portal/`, `/account/`, `/checkout`, `/checkout-success`, `/recover-cart`, `/recover-payment`, `/reset-password`, `/try-on-room` (private/transactional routes Google shouldn't index or waste crawl budget on).
4. **Per-route metadata** — `Catalogue.tsx` uses `<Helmet>` well. Spot-check needed on: `Index`, `ProductDetail`, `Lookbook`, `OurStory`, `OurMission`, `SizeGuide`, `Community`, `Ambassador`, `Contact`, `FAQ`, `ShippingInfo`, `ReturnsExchanges`, `PrivacyPolicy`, `TermsOfService`, `Accessibility`. Any missing `<Helmet>` = duplicate sitewide title/description across routes (major SEO smell).
5. **Structured data** — No `Product` JSON-LD on PDPs (price, availability, brand, sku, aggregateRating) → losing rich snippets in Google Shopping/SERP. No `BreadcrumbList`. No `FAQPage` on FAQ route. No `Organization` sitewide.
6. **Canonicals** — `index.html` ships `<link rel="canonical" href="/">` implicitly via Helmet on some routes but the static file has no canonical → routes without Helmet inherit nothing. Risk of duplicate-content signals on parameterized URLs (`?sort=`, `?utm=`).
7. **Image SEO** — `og:image` points to `/og-home.png`; need to verify it exists at 1200×630. PDPs should emit product image as og:image dynamically (metadata only — already done via Helmet pattern, just needs auditing).
8. **Performance/Core Web Vitals hints in head** — Already has `preconnect`, `dns-prefetch`, `preload` for hero image. Good. Add `preconnect` for `fonts.gstatic.com` (already there) — verified. Could add `<link rel="alternate" hreflang="en" />` for clarity.

## Implementation plan (head/metadata only)

### 1. `index.html` — sitewide head hardening
- Add `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`
- Add `<meta name="theme-color" content="#0a0a0a" />` (matches dark editorial theme)
- Add `<meta property="og:site_name" content="Line of Judah" />`
- Add `<meta property="og:locale" content="en_CA" />` (CAD currency confirms Canadian market)
- Add `<meta name="twitter:creator" content="@lineofjudah" />`
- Add `<link rel="alternate" hreflang="en-ca" href="https://lineofjudah.clothing/" />` and `x-default`
- Add **Organization** JSON-LD (name, url, logo, sameAs Instagram/Twitter, contactPoint email from `BRAND.email.support`)
- Add **WebSite** JSON-LD with `SearchAction` pointing at `/catalogue?q={query}` (enables Google sitelinks search box)
- **Remove** any duplicate canonical that would conflict with per-route Helmet canonicals (currently none in static head — confirmed safe).

### 2. `public/robots.txt` — crawl-budget protection
Add `Disallow:` rules under `User-agent: *` for private/transactional routes:
```
Disallow: /ops-portal/
Disallow: /account/
Disallow: /checkout
Disallow: /checkout-success
Disallow: /recover-cart
Disallow: /recover-payment
Disallow: /reset-password
Disallow: /try-on-room
Disallow: /*?*utm_
Disallow: /*?*auth=
```
Keep `Allow: /` and `Sitemap:` directive intact.

### 3. `public/sitemap.xml` → dynamic generator
Migrate the static sitemap to `scripts/generate-sitemap.ts` (runs via `predev`/`prebuild` hooks already pattern). The generator:
- Hard-codes all static routes (current entries + missing: `/community`, `/ambassador`, `/contact`, `/faq`, `/shipping`, `/returns`, `/accessibility`, `/worn-in-the-wild`).
- Queries Supabase at build time for `products` where `status='active'` → emits `/product/{slug}` per row with `lastmod=updated_at`.
- Queries `categories` → emits `/category/{slug}`.
- Queries lookbook looks if a public listing exists → emits `/lookbook/{slug}`.
- Adds `<lastmod>` to every entry.
- Writes to `public/sitemap.xml`.
- Wire `predev` + `prebuild` in `package.json`.

**Confirmation needed before migrating** (per sitemap skill rule): replacing the hand-edited file. Recommended because the catalogue is DB-driven.

### 4. Per-route `<Helmet>` audit
For each route file listed in finding #4, verify the `<Helmet>` block emits:
- Unique `<title>` (≤60 chars, keyword-front-loaded)
- Unique `<meta name="description">` (≤160 chars)
- `<link rel="canonical">` with the absolute production URL
- `og:title`, `og:description`, `og:url`, `og:type` (`website` / `article` / `product`)
- `twitter:card="summary_large_image"`

Where missing → **add Helmet block only** (no visible JSX change). For PDPs, also inject `Product` JSON-LD inside Helmet with: name, image, description, sku, brand=Line of Judah, offers (price, priceCurrency=CAD, availability, url). For FAQ route → `FAQPage` JSON-LD built from existing FAQ data. For all detail routes → `BreadcrumbList` JSON-LD.

### 5. Optional polish (no UI impact)
- Add `<link rel="manifest">` audit (already present).
- Verify `/og-home.png` exists and is 1200×630 — if missing, flag for user to provide (don't generate without asking).

## Technical details
- **Files modified**: `index.html`, `public/robots.txt`, `package.json` (scripts), plus per-route page files (Helmet blocks only — no body/JSX changes).
- **Files created**: `scripts/generate-sitemap.ts`.
- **Files replaced (with approval)**: `public/sitemap.xml` (becomes generator output).
- **Dependencies**: none added; `react-helmet-async` and `@supabase/supabase-js` already present.
- **Risk**: zero visual regression — all changes are in `<head>` or non-rendered Helmet children. Build pipeline gains a ~2s sitemap-generation step.

## Open question before implementing
1. OK to migrate the hand-edited `public/sitemap.xml` to a Supabase-driven generator script (recommended — otherwise products/categories will never appear in Google)?
2. Should I add `Product` JSON-LD to PDPs? (Highly recommended for rich snippets, zero UI change.)
3. Confirm `/og-home.png` exists at 1200×630 — should I check, or do you want to supply one?
