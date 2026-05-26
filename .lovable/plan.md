
# Genesis 49:9-10 in the Category Hero

Fill the empty upper half of `CollectionHero` (the dark zone the user circled on `/category/shop`) with editorial fragments of Genesis 49:9-10 — the Lion of Judah passage. The verse becomes the atmosphere of the hero; the existing eyebrow ("THE FULL DROP" / tagline), title ("All Products"), and count stay exactly where they are.

## Where it lands

- File: `src/components/category/CollectionHero.tsx`
- Affects every category route, with strongest editorial weight on `/category/shop` (the screenshot the user marked up). Subcategory pages inherit the same treatment but the verse stays universal — Judah is the brand's namesake, so the passage reads as house scripture, not category copy.

## Composition

```text
┌─────────────────────────────────────────────┐
│  GENESIS 49:9                               │  ← tiny eyebrow, top-left, 10px chrome
│                                             │
│  "Judah is a lion's cub..."                 │  ← fragment A, serif, large, faded
│                                             │
│         "who dares rouse him?"              │  ← fragment B, offset right, italic
│                                             │
│                  ✦                          │  ← hairline divider (forest-500/30)
│                                             │
│           THE FULL DROP                     │  ← existing eyebrow (unchanged)
│           All Products                      │  ← existing H1 (unchanged)
│              16 pieces                      │  ← existing count (unchanged)
└─────────────────────────────────────────────┘
```

Three fragments, surfaced as floating editorial type — not one paragraph block:

1. **Top-left, eyebrow micro-label:** `GENESIS 49:9–10 · ESV` — 10px, `tracking-[0.3em]`, `text-white/40`
2. **Fragment A (large, serif, opacity 0.35):** *"Judah is a lion's cub; he stooped down, he crouched as a lion."*
3. **Fragment B (smaller, italic, offset, opacity 0.5):** *"Who dares rouse him?"*
4. **Fragment C (bottom of verse zone, all-caps tracked):** `THE SCEPTER SHALL NOT DEPART FROM JUDAH` — 11px, `tracking-[0.25em]`, `text-white/30`

A thin forest-500/20 hairline separates the verse zone from the existing title block so the hero reads as two stacked acts: **Scripture → Drop.**

## Visual treatment

- Verse fragments use a serif (project already loads `Instrument Serif` / `Cormorant` via Google Fonts in `index.html` — reuse, do not add new).
- Opacity tiers (0.30 / 0.45 / 0.30) so nothing competes with the H1.
- Mobile (390px): stack fragments vertically, reduce fragment A to `text-2xl`, hide Fragment C if it would push the H1 below the fold. Hero height bumps from `h-[35dvh]` → `h-[55dvh]` on mobile to give the verse room without crushing "All Products".
- Desktop: fragments anchored absolutely inside the hero so they read as found-typography, not centered marketing copy. Existing centered title block stays centered.
- Subtle Framer Motion fade+rise on each fragment, staggered 80ms, editorialEase. Respects `useReducedMotion`.

## Hero height adjustment

| Breakpoint | Current | New |
|---|---|---|
| Mobile | `h-[35dvh]` | `h-[55dvh]` |
| md | `h-[50vh]` | `h-[62vh]` |
| lg | `h-[60vh]` | `h-[68vh]` |

Enough vertical canvas to hold the verse without the user having to scroll past empty black.

## Reduced scope guardrails

- No changes to `ProductGrid`, `FilterSortBar`, or anything below the hero.
- No new dependencies, no new fonts, no new images.
- Existing `bgClass` gradients stay — verse layers *on top* of them.
- `tagline` and `title` from `collectionData` are untouched, so subcategory taglines like *"Cover your head. Declare your King."* still render below the verse.

## Acceptance

- Verse fragments visible on `/category/shop` filling the previously-empty top zone the user circled.
- H1 "All Products" + tagline + count still render in their current position, unchanged.
- Mobile 390px: nothing clipped, everything above-the-scroll legible.
- Reduced-motion users see static fragments, no animation.
- `rg "Judah is a lion"` returns exactly one match (`CollectionHero.tsx`).
