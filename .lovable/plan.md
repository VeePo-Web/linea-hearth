## Goal
Polish 404 typography for perfect optical centering and readability.

## Changes to `src/pages/NotFound.tsx`

**Verse (centerpiece)**
- Narrow column: `max-w-[420px]` → `max-w-[440px]` (slightly wider for better line breaks)
- Size: `text-xl md:text-2xl` → `text-[22px] md:text-[28px]` (more presence on desktop)
- Leading: `1.6` → `1.5` (tighter, more poetic)
- Tracking: `-0.01em` → `-0.015em`
- Weight: keep `font-light`; bump opacity `text-foreground/90` → `text-foreground/95`

**Hairline divider**
- `mt-10` → `mt-12`; width `40%` → `48px` (fixed hairline, more editorial)
- `bg-foreground/20` → `bg-foreground/30`

**Citation**
- `mt-6` → `mt-5`; tracking `0.4em` → `0.45em`

**404 superscript (top)**
- `top-8` → `top-10`; remove `<sup>` wrapper (already small); tracking `0.4em` → `0.5em`

**Lion sigil + Return link (bottom)**
- `bottom-16` → `bottom-12`; gap `gap-6` → `gap-5`
- Sigil opacity `0.8` → `0.7` for quieter presence
- Return link: tracking `0.45em`; add tiny silver hairline under on hover (chrome underline pattern)

**Optical centering fix**
- Wrap verse block + reserve symmetric bottom space so the verse sits at true visual center (the absolute-positioned sigil currently pulls weight downward without offsetting the layout). Add `pb-32` to main and remove absolute positioning ambiguity — keep sigil absolute but ensure verse stays vertically centered relative to viewport, not pushed up.

## Files
- `src/pages/NotFound.tsx` (edit only)
