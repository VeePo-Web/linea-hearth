## Goal
Replace the leftover "Linea" jewelry social/thumbnail assets with the Line of Judah hero hoodie (the Stay Holy hoodie with the lion graphic) so link previews and the browser tab show the right brand.

## Changes (all in `index.html`)

1. **Favicon** (`<link rel="icon">`)
   - Currently: external Google Storage URL pointing to old Linea logo
   - Change to: `/logo.svg` (existing Line of Judah logo in `public/`)

2. **Open Graph image** (`<meta property="og:image">`)
   - Currently: `social-1758825622907-Linea OG Image.png`
   - Change to: `https://lineofjudah.clothing/products/stay-holy-hoodie/male-model.png` (the lion hoodie hero shot)

3. **Twitter image** (`<meta name="twitter:image">`)
   - Same swap as og:image.

No component code changes — the homepage hero already uses this image. No new assets need to be uploaded; we're pointing at files already in `public/`.

## Note
Social platforms (iMessage, WhatsApp, Facebook) cache link previews aggressively. After deploy, your friend may still see the old Linea thumbnail for ~24h unless they clear cache or you re-scrape via Facebook's Sharing Debugger.
