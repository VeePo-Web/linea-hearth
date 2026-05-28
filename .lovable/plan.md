## Why this is happening

Routing is already correct — `/` serves `LandingPage` (the Exodus 28:2 portal). When someone Googles "lineofjudah.clothing" and lands on `/catalogue`, it's because:

1. **No canonical tag** — Google can't tell which URL is the "real" homepage.
2. **No sitemap.xml** — Google guessed based on which pages it crawled most and assigned `/catalogue` more weight.
3. **Generic homepage meta** — `index.html` title is "Line of Judah - Faith-Forward Apparel" with "Premium streetwear with purpose" description. That snippet describes the catalogue better than the portal, so Google may have rewritten the displayed URL to `/catalogue`.
4. **No per-route canonicals** — `/catalogue` competes with `/` for the brand keyword.

## Fix

### 1. `index.html` — rewrite homepage meta for the portal + add canonical
- Title: `Line of Judah — Make Holy Garments` (portal-focused, brand-first)
- Description: short Exodus 28:2-flavored line (e.g. "Make holy garments for your brother, for glory and for beauty. Enter the Line of Judah.")
- Add `<link rel="canonical" href="https://lineofjudah.clothing/" />`
- Add `<meta property="og:url" content="https://lineofjudah.clothing/" />`
- Update existing `og:title` / `og:description` / `twitter:*` to match the new portal copy
- Update existing og:image URLs (already on lineofjudah.clothing) — leave as is

### 2. `public/sitemap.xml` (new) — tell Google `/` is priority 1
Static file with the real public routes (omit admin / account / checkout):
- `/` priority 1.0
- `/catalogue` priority 0.8
- `/lookbook`, `/about/our-story`, `/about/our-mission`, `/about/size-guide`, `/community`, `/ambassador`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy-policy`, `/terms-of-service` priority 0.5–0.7
- `BASE_URL = "https://lineofjudah.clothing"`

### 3. `public/robots.txt` — point crawlers at the sitemap
Add `Sitemap: https://lineofjudah.clothing/sitemap.xml` to the existing file (preserve all existing User-agent blocks).

### 4. `src/pages/Catalogue.tsx` — add a per-route canonical via Helmet
Add `<link rel="canonical" href="https://lineofjudah.clothing/catalogue" />` so `/catalogue` self-canonicalises and stops competing with `/` for the brand search.

### 5. `src/pages/LandingPage.tsx` — tighten its existing Helmet
Already uses `<Helmet>`. Update/ensure it sets:
- `<title>` matching the new portal title
- canonical → `https://lineofjudah.clothing/`
- og:url → `https://lineofjudah.clothing/`

## What you'll need to do after deploy (outside Lovable)

The code change alone won't move Google overnight. After this ships to Vercel:

1. Open **Google Search Console** for `lineofjudah.clothing`.
2. Submit `https://lineofjudah.clothing/sitemap.xml`.
3. Use **URL Inspection** on `https://lineofjudah.clothing/` → click **Request Indexing**.
4. Do the same on `/catalogue` so Google re-reads its new self-canonical.
5. Allow 3–14 days for the search result to update.

Want me to proceed with steps 1–5?