# Sticky Nav & Overlay Audit — Fix Plan

## The disconnect bug (root cause)

`src/components/category/FilterSortBar.tsx:176`
```
isSticky && "sticky top-[var(--header-height)] z-30 bg-background/95 backdrop-blur-sm shadow-sm pt-4 -mt-4"
```
Three faults:
1. **Translucent bg** (`/95` + `backdrop-blur-sm`) lets product imagery bleed through → the bar visually merges with cards behind it.
2. **`-mt-4 pt-4` hack** = layout jump the instant it engages.
3. **`top-[var(--header-height)]`** is hard-pinned to 100px even when the global header has hidden itself (translateY -100) on scroll-down → a 100px empty band sits above the bar.

## Inventory (every sticky/fixed surface found)

| Surface | File | Position | z | Bg |
|---|---|---|---|---|
| Global header | `header/Header.tsx` | fixed top | **50** | opaque |
| Status bar promo | `homepage/SecondaryCTAStrip.tsx` | fixed top | 40 | opaque |
| Search overlay | `header/SearchOverlay.tsx` | fixed inset / abs | 50 | opaque |
| Mega menu | `header/MegaMenu.tsx` | absolute | 50 | opaque |
| Mobile menu drawer | `header/MobileMenu.tsx` | fixed | 50 / 40 backdrop | opaque |
| Full screen nav | `header/FullScreenNav.tsx` | fixed inset | 50 | opaque |
| Cart drawer | `cart/CartDrawer.tsx` | sheet | 50 | opaque |
| Favorites drawer | `favorites/FavoritesDrawer.tsx` | fixed | 50 / 40 | opaque |
| **Shop filter bar** | `category/FilterSortBar.tsx` | sticky | **30** | **/95 blur** ⚠ |
| Story filters | `community/StoryFilters.tsx` | sticky | 30 | /95 blur ⚠ |
| Legal/Service/About sidebars (TOC) | `legal/TableOfContents.tsx`, `service/ServiceSidebar.tsx`, `about/AboutSidebar.tsx`, `legal/LegalSidebar.tsx` | sticky | — | — |
| Mobile sticky ATC (PDP) | `product/MobileStickyATC.tsx` | fixed bottom | 50 | /95 blur |
| Mobile sticky shop bar (home) | `homepage/MobileStickyBar.tsx` | fixed bottom | **40** | opaque |
| Mobile sticky checkout | `checkout/MobileStickyCheckout.tsx` | fixed bottom | — | — |
| Try-on mobile bar | `try-on/MobileTryOnBar.tsx` | fixed | — | — |
| Lookbook dot nav (desk/mob) | `lookbook/LookNavigation*.tsx` | fixed | 40 | — |
| Catalogue filter sheet | `pages/Catalogue.tsx` | fixed | 50 / 40 | opaque |
| Quick view modal | `category/QuickViewModal.tsx` | dialog | 50 | opaque |
| Fit guide modal | `lookbook/FitGuideModal.tsx` | fixed | 50 | opaque |
| Image zoom (PDP) | `product/ImageZoom.tsx` | fixed | 50 | opaque |
| About scroll progress | `about/ScrollProgress.tsx` | fixed | **50** ⚠ same as header |
| Admin chrome | `admin/AdminLayout.tsx` | sticky/fixed | 50 | opaque |
| Toaster | `ui/toast.tsx` | fixed | [100] | opaque |
| shadcn Dialog/Sheet/AlertDialog/Drawer | `ui/*` | fixed | 50 | opaque |

## Findings

- **F1 (THE bug)** — Shop filter bar translucent + low z; product card chrome (Quick View pills, +, NEW badges, heart) and thumbnails bleed through. **User-visible.**
- **F2** — Story filters has the same translucent pattern. Will exhibit the same bleed on Community page.
- **F3** — `top-[var(--header-height)]` ignores header auto-hide; gap when header retracts.
- **F4** — `-mt-4 pt-4` causes 16px jump at the sticky engage moment.
- **F5** — `ScrollProgress` (About) sits at z-50 alongside the fixed header; if the header re-reveals they collide in the same plane.
- **F6** — `SecondaryCTAStrip` (z-40) is **below** Header (z-50) but both occupy `top:0`. When both render, Strip is covered. Intentional but undocumented.
- **F7** — Bottom-fixed bars are mixed: `MobileStickyATC` z-50, `MobileStickyBar` z-40, `LookNavigationMobile` z-40. Toasts z-[100] sit above all (correct), but bars can co-exist on PDP if both mount — no coordination.
- **F8** — No central z token. Every component invents its own number.

## Fix — single source of truth

**New file `src/lib/zLayers.ts`** (tailwind-arbitrary-value friendly tokens, mirrored in `tailwind.config.ts`):

```text
base          0    page content
card-chrome   10   NEW badge, heart, Quick View, +
sticky-sub    30   shop filter bar, story filter bar, TOC sub-nav
banner        35   promo strip (SecondaryCTAStrip)
header        40   global ImmersiveHeader
fixed-bar     45   bottom mobile bars (ATC, sticky shop, lookbook nav)
overlay       60   backdrops
drawer        70   cart / favorites / mobile menu
modal         80   dialogs, quick view, fit guide, image zoom
toast         90   toaster
portal        100  brand gate / loading boot
```

Re-key existing usages to these tokens. (Header moved from 50 → 40 since modals at 80 still cover it; bumps Header above ScrollProgress which becomes `sticky-sub`.)

## Rules enforced

1. Every sticky/fixed element MUST use a **fully opaque** background (`bg-background`, `bg-nav`, or a solid hex). Translucency only with `backdrop-blur-xl` *and* a z above any underlying interactive chrome. Filter bars → flip to opaque `bg-background`.
2. Sticky elements span full viewport width with internal padding (no negative margin hacks). Remove `-mt-4 pt-4` from FilterSortBar; replace with proper `py-4`.
3. Sticky `top` value tracks header reveal state via a CSS var. Add `--sticky-top` written by `Header.tsx` (0px when hidden, `var(--header-height)` when revealed) and consume it in FilterSortBar + StoryFilters.
4. Sharp edges only (`rounded-none`) — already compliant; verify.
5. `scroll-margin-top: var(--header-height)` already on `<main>`; confirm anchor sections inherit it.
6. `prefers-reduced-motion`: sticky engage/retract uses `transition-none`; verify Header tween is already gated (it isn't currently — add).
7. Mobile bottom-bar coordination: introduce simple context `useBottomBarSlot` so only one of {MobileStickyATC, MobileStickyBar, LookNavigationMobile} is visible at a time per route (out of scope to fully implement here — flagged).

## Changes (files touched)

1. **Create** `src/lib/zLayers.ts` — token export + JSDoc table.
2. **Edit** `tailwind.config.ts` — add `zIndex` scale keyed to tokens (`'card-chrome': 10`, `'sticky-sub': 30`, `banner: 35`, `header: 40`, `'fixed-bar': 45`, `overlay: 60`, `drawer: 70`, `modal: 80`, `toast: 90`, `portal: 100`).
3. **Edit** `src/index.css` — add `--sticky-top: var(--header-height);` default; Header toggles it via inline style on hide.
4. **Edit** `src/components/header/Header.tsx` — write `--sticky-top` on hide/reveal; switch `z-50` → `z-header`; respect reduced-motion.
5. **Edit** `src/components/category/FilterSortBar.tsx` — `z-sticky-sub`, `bg-background` (opaque), drop `-mt-4 pt-4`, use `top-[var(--sticky-top)]`.
6. **Edit** `src/components/community/StoryFilters.tsx` — same opacity + token treatment.
7. **Edit** `src/components/homepage/SecondaryCTAStrip.tsx` — `z-banner`; document that it sits below header by design.
8. **Edit** bottom-fixed bars (`MobileStickyATC`, `MobileStickyBar`, `MobileStickyCheckout`, `MobileTryOnBar`, `LookNavigationMobile`) — unify on `z-fixed-bar`; ATC keeps opaque bg (drop `/95`).
9. **Edit** `about/ScrollProgress.tsx` — demote to `z-sticky-sub`.
10. **Edit** shadcn primitives (`dialog`, `sheet`, `alert-dialog`, `drawer`, `toast`) — swap `z-50`/`z-[100]` for `z-modal`/`z-toast`.
11. **Edit** drawers (`CartDrawer`, `FavoritesDrawer`, `MobileMenu`, `FullScreenNav`, `SearchOverlay`, `Catalogue` filter sheet) — `z-drawer` (+ `z-overlay` backdrop).
12. **Edit** `admin/AdminLayout.tsx` — `z-header` for top, `z-fixed-bar` for bottom nav.

## Out of scope (flagged, not done)

- Bottom-bar mutual-exclusion context (F7) — note added, separate task.
- Visual regression screenshots at 375 / 768 / 1440 across 3 scroll states — manual QA after build.

## Deliverables

- New `zLayers.ts` + tailwind tokens.
- 11 component edits (above).
- Inventory table (this doc) committed at top of `zLayers.ts` as JSDoc.
- Before/after screenshot of Shop filter bar bug (manual).
