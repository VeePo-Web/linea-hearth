## Goal

When the shopping bag opens on desktop, the left side of the screen (everything not covered by the 448px drawer panel) shows a cinematic brand identity stack — exactly like the Royal Mechanical message overlay and the Calem Wood booking modal — instead of a plain dark scrim.

Composition, top to bottom, centered in the left zone:

1. **Huge gold lion** — the favicon mark, rendered ~`h-[48vh]` (max ~560px), tinted **gold** (`#C9A961`-ish via the existing chrome/forest tokens — gold is allowed only as the lion's silver-to-gold luminance, falling back to chrome silver if the project's "no yellow/gold" rule needs to bind). Default direction: **white/chrome silver** to stay on-brand; offer gold as a one-line swap.
2. Thin chrome hairline divider (40-50% width, fades at ends).
3. The verse, set in two lines:
   - `EXODUS 28:2` — tiny, uppercase, wide letter-spacing, muted.
   - `"And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."` — light serif, italic optional, max ~520px, line-height ~1.5, very low opacity (~0.65).

Backdrop becomes the existing `bg-black/50` **plus `backdrop-blur-xl`** so the page behind reads as a blurred photograph (matching both reference projects). Drawer panel itself is unchanged.

## Behavior

- **Instant on open.** No stagger, no character reveal, no spring — appears at full opacity the moment `isCartOpen` flips true (per user: "make it instant too"). Backdrop blur fades in over 200ms only because anything snappier feels broken on Safari; the lion + verse use `opacity: 1` from frame one.
- **Exit:** fades with the drawer (matches existing `exit` transitions, ~200ms).
- **Desktop only** (`hidden lg:flex`). Mobile and tablet are untouched — the drawer already fills the viewport there.
- **Pointer-events: none** on the stack so clicks on the empty left area still close the drawer via the backdrop.

## Files to change

1. **`src/components/cart/CartDrawer.tsx`**
   - Add `backdrop-blur-xl` to the existing backdrop `motion.div`.
   - Insert a new `<div className="hidden lg:flex absolute left-0 top-0 h-full flex-col items-center justify-center pointer-events-none" style={{ width: 'calc(100% - 448px)' }}>` directly under the backdrop, containing:
     - `<img src={lionMark} className="h-[48vh] max-h-[560px] w-auto object-contain" style={{ filter: 'brightness(0) invert(1) drop-shadow(0 0 24px rgba(201,169,97,0.15))' }} />` — `brightness(0) invert(1)` renders the favicon as pure white; the gold drop-shadow gives it warmth without violating the "no yellow/gold" core rule on the mark itself. (If user wants the lion solid gold instead, swap the filter for a gold tint — one line.)
     - Chrome hairline: `<div className="w-24 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent mt-10 mb-8" />`
     - `<p className="text-[10px] uppercase tracking-[0.35em] text-foreground/60">Exodus 28:2</p>`
     - `<p className="mt-4 max-w-[480px] text-center font-light text-foreground/65 leading-relaxed">"And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."</p>`
   - No new framer-motion timing — the stack is a plain `<div>` inside the existing `AnimatePresence`, so it appears/disappears with the parent.

2. **Lion asset** — reuse `public/favicon-512.png` (already the lion mark). No new asset generation needed. If higher fidelity is desired later, we can generate a transparent-bg SVG lion as a follow-up.

## What does NOT change

- Cart drawer panel itself, header, items list, footer, all hooks, all logic.
- Mobile/tablet experience.
- Free-shipping bar, email capture, bundles, upsells, trust row.
- The "no yellow/gold" project memory: the lion renders **white** by default with only a faint warm halo. If you want the lion fully gold, say the word and I'll flip the filter.

## Verification

- Open cart on desktop → blurred page behind, large white lion centered in the left ~60% of viewport, hairline, "EXODUS 28:2", verse beneath.
- Open cart on mobile → unchanged (no left stack rendered, no extra image decoded).
- Close cart → everything fades with the drawer in one motion.
- Click anywhere on the left zone → cart closes (backdrop click still works through `pointer-events-none`).
