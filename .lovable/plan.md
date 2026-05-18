## Goal
Purge any remaining Lovable-default branding (favicon, og/twitter images, meta tags, placeholder asset) and replace with Line of Judah equivalents.

## Audit findings
- `index.html` — favicon already `/logo.svg` (LOJ wordmark) ✓, but `<meta name="author" content="Lovable" />` still present. OG/Twitter image uses `/products/stay-holy-hoodie/male-model.png` (person model — conflicts with the "no people on homepage" preference).
- `public/placeholder.svg` — the generic gray Lovable placeholder. Used as fallback in 12+ components (cart, favorites, search, etc.).
- `public/favicon.ico` — already deleted in earlier turn ✓.
- No other Lovable thumbnail assets found in `public/`.

## Changes

### 1. `index.html`
- Remove `<meta name="author" content="Lovable" />` → replace with `content="Line of Judah"`.
- Swap OG + Twitter `og:image` / `twitter:image` from `male-model.png` → `/products/stay-holy-hoodie/flat-front.png` (the hoodie flat — same product-first image used as homepage hero, no people).
- Add `<link rel="apple-touch-icon" href="/logo.png">` so iOS bookmarks/share sheets show the LOJ mark instead of a screenshot.

### 2. `public/placeholder.svg`
Replace the Lovable gray-square-with-image-icon SVG with a minimal LOJ-branded placeholder: off-white background (`#f5f3ee` Paper & Ink token), centered "LINE OF JUDAH" wordmark in light tracked uppercase, subtle hairline border. 1200×1200 to keep dimensions identical so every existing `<img src="/placeholder.svg">` fallback gets the new look automatically — no component edits needed.

### 3. (Optional, ask) `public/logo.png`
Current `logo.png` exists and is what would be used for apple-touch-icon. If it isn't square/LOJ-branded I'll regenerate; otherwise reuse as-is.

## Files touched
- `index.html` (edit)
- `public/placeholder.svg` (overwrite)

## Out of scope
- Component fallback paths (`'/placeholder.svg'`) — no edits required, they auto-pick up the new asset.
- `src/integrations/lovable/index.ts` — auto-generated infra file, not user-facing branding, must not be edited.
