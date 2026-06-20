# Cart Drawer Polish

Four targeted tweaks to `src/components/cart/CartDrawer.tsx` plus one new lion asset. Open speed stays instant; nothing else changes.

## 1. Synced, smooth close
Backdrop and panel exit on the same curve and duration so they fade together — no panel-then-backdrop staggering, no abrupt cutoff.

- `backdropVariants.exit`: `duration: 0.45`, `ease: editorialEase`
- `drawerVariants.exit`: `x: "100%"`, `opacity: 0`, `duration: 0.45`, `ease: editorialEase` (drop the `0.85` opacity floor so it fully dissolves with the backdrop)
- Open variants untouched (still 0.3s/0.35s, instant feel)

## 2. Stronger background blur
- Backdrop: `bg-black/75 backdrop-blur-[40px]` (was `bg-black/70 backdrop-blur-2xl` ≈ 24px). Page behind reads as a dark frosted plate so the lion + verse pop harder.

## 3. Better lion + eyes
Regenerate `public/lion-mark.png` as a refined heraldic Lion of Judah mark:
- Soft warm-white silhouette (#F5F0E6), cleaner mane geometry, slightly more regal/symmetrical face — same favicon DNA, just sharper craft
- Eyes: two small **warm amber-gold** dots (#C9A961) — not black, not white — so they read as "lit from within" against the white face and tie to the verse glow
- Transparent background, 1024x1024
- CartDrawer keeps the existing warm halo `drop-shadow(0 0 32px rgba(201,169,97,0.18))`, no destructive filter

## 4. Verse styled like homepage "glory / beauty"
The homepage uses warm champagne color `hsla(45, 55%, 82%, 0.95)` with layered gold text-shadow for the illuminated glow (from `src/index.css` `.glory-word` / `.beauty-word`). Apply the same to the cart verse:

- Verse line: bump from `text-sm` to `text-lg md:text-xl`, `font-medium` (bold-ish but still editorial, not heavy), `tracking-[0.01em]`, `leading-[1.6]`, `max-w-[520px]`
- Color: `hsla(45, 55%, 82%, 0.95)`
- `textShadow`: `0 0 15px hsla(45, 70%, 65%, 0.35), 0 0 30px hsla(45, 60%, 60%, 0.2), 0 0 45px hsla(45, 50%, 55%, 0.12)` — same 3-layer warm glow as homepage
- "EXODUS 28:2" eyebrow: keep small/uppercase, same champagne tone `hsla(45, 55%, 82%, 0.7)` so it harmonizes
- Hairline divider unchanged

## What stays the same
Open timing, lion size/position, layout, mobile (lion stack still `hidden lg:flex`), drawer panel, header, items, footer, hooks, scroll lock, copy ("And thou shalt make holy garments…"). No new dependencies.

## Verification
Open cart: same instant slide-in, deeper blur, refined lion with subtle amber eyes, verse glows warm-champagne like homepage glory/beauty, larger and bolder. Close cart: backdrop and panel fade out together over ~0.45s on editorial easing — no flicker, no stagger.
