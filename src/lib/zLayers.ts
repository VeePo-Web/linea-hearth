/**
 * Z-Layer System — single source of truth for stacking order.
 *
 * | Token        | z   | Use                                                       |
 * |--------------|-----|-----------------------------------------------------------|
 * | base         | 0   | page content                                              |
 * | card-chrome  | 10  | NEW badge, heart, Quick View, + (product card overlays)   |
 * | sticky-sub   | 30  | shop filter bar, story filter bar, TOC sub-nav, progress  |
 * | banner       | 35  | promo strip (SecondaryCTAStrip) — sits below header       |
 * | header       | 40  | global Header / ImmersiveHeader                           |
 * | fixed-bar    | 45  | bottom mobile bars (ATC, sticky shop, lookbook nav)       |
 * | overlay      | 60  | backdrops                                                 |
 * | drawer       | 70  | cart / favorites / mobile menu / full-screen nav          |
 * | modal        | 80  | dialogs, quick view, fit guide, image zoom                |
 * | toast        | 90  | toaster                                                   |
 * | portal       | 100 | brand gate / boot                                         |
 *
 * Rules:
 * - Every sticky/fixed element MUST use a fully opaque background.
 *   Translucency only with backdrop-blur-xl AND a z above any underlying chrome.
 * - Sticky `top` consumes `var(--sticky-top)` so it tracks header auto-hide.
 * - Sharp edges (rounded-none) per project design system.
 * - Use tailwind class `z-<token>` (e.g. `z-header`, `z-sticky-sub`).
 */
export const Z = {
  base: 0,
  cardChrome: 10,
  stickySub: 30,
  banner: 35,
  header: 40,
  fixedBar: 45,
  overlay: 60,
  drawer: 70,
  modal: 80,
  toast: 90,
  portal: 100,
} as const;

export type ZToken = keyof typeof Z;
