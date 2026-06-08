## Scrolling Pre-Sale Marquee Bar

A thin red bar sits at the very top of every page — above the existing black announcement bar — with copy continuously scrolling right-to-left to build pre-sale urgency until the July 1st ship date.

### Scope
- **Only new visual element.** No other page changes.
- Appears site-wide above `StatusBar` (which sits above `Navigation`).
- Permanent (no close button). Shows on every page including the portal.

### Copy (Ogilvy-meets-Brunson tone, on-brand)
A single string with bullet separators (`◆`) loops seamlessly. Final copy:

> **PRE-SALE NOW LIVE ◆ FIRST DROP SHIPS JULY 1ST ◆ RESERVE YOUR ARMOR BEFORE THE GATE CLOSES ◆ LIMITED FIRST-RUN — ONCE IT'S GONE, IT'S GONE ◆ EXODUS 28:2 ◆**

Reasons it works:
- Ogilvy: concrete date, definite scarcity, plain verbs.
- Brunson: future-pace ("RESERVE"), loss-aversion ("GATE CLOSES", "ONCE IT'S GONE"), stack of reasons.
- On-brand: "armor" (not "comfort"), Exodus 28:2 anchor, no emojis, all-caps editorial.

### Visual Spec
- Height: **24px** (mobile) / **28px** (md+). Slim — does not eat hero space.
- Background: **#C8102E** (editorial red — matches existing `--destructive` HSL `0 62% 50%` family but more saturated print-red). Implemented as a new token `--marquee-bg: 350 86% 42%` and `--marquee-fg: 0 0% 100%`.
- Text: white, `font-mono` or `Inter`, `text-[10px] md:text-[11px]`, `tracking-[0.2em]`, `font-medium uppercase`.
- Sharp edges (no radius — matches editorial system). Subtle 1px black hairline border-bottom.
- No grain overlay (kept clean so it reads instantly).

### Motion
- Pure CSS keyframe `marquee-scroll` translating `-50%` over **40s linear infinite** (mobile slightly faster — `30s` — since less visible text fits).
- Track contains the copy duplicated twice for a seamless loop.
- Respects `prefers-reduced-motion`: animation pauses and content centers statically.
- Pauses on hover (desktop only) via `:hover { animation-play-state: paused }`.

### Layout / Header Integration
Current header chain inside `Header.tsx`:
```text
<motion.header fixed top-0>
  <StatusBar />      // 36px
  <Navigation />     // 64px
</motion.header>
```

New chain:
```text
<motion.header fixed top-0>
  <PreSaleMarquee /> // 24px mobile / 28px desktop
  <StatusBar />
  <Navigation />
</motion.header>
```

CSS variables in `index.css` updated so every downstream sticky element tracks the new total height:
- Add `--marquee-height: 24px` (with `@media (min-width: 768px) { --marquee-height: 28px }`)
- Update `--header-height` from `100px` → `calc(100px + var(--marquee-height))`
- `--sticky-top` already derives from `--header-height`, so sub-nav filter bars, story filters, PDP sticky CTA all adjust automatically (per Sticky Z-Layer System).
- `--header-height-scrolled` stays `64px` (marquee + status bar hide together when header retracts on scroll-down — already handled by existing `shouldHide` logic since the marquee lives inside the same `motion.header`).

### Files

**New**
- `src/components/header/PreSaleMarquee.tsx` — component (~40 lines, single export, no props).

**Edited**
- `src/components/header/Header.tsx` — render `<PreSaleMarquee />` as the first child inside `motion.header`, before `<StatusBar />`.
- `src/index.css` —
  - Add `--marquee-height`, `--marquee-bg`, `--marquee-fg` tokens in `:root` (and `.light` variant if present — same values, the bar stays red on both).
  - Update `--header-height` calc.
  - Add `@keyframes marquee-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }` and `.animate-marquee { animation: marquee-scroll 40s linear infinite; will-change: transform } @media (min-width:768px){.animate-marquee{animation-duration:30s}} @media (prefers-reduced-motion: reduce){.animate-marquee{animation:none;justify-content:center}}`.

### Accessibility
- Wrapping `<div role="marquee" aria-label="Pre-sale announcement">` with `aria-live="off"` (it's decorative urgency copy, not a notification).
- Visually-hidden static `<span class="sr-only">` mirrors the copy once for screen readers — no looping announcement.

### Verification
- View `/home`, `/shop`, `/lookbook`, `/` (portal), one PDP, `/checkout` at 390×844 and 1366×768.
- Confirm: marquee visible at top, copy scrolls smoothly, no layout shift on hero, sticky filter bars on Category page still pin correctly below the new total header height, header still auto-hides on scroll-down and reveals on scroll-up as one unit.
