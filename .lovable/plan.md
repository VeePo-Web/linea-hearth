## Subtle Urgency Cues in Pre-Sale Marquee

Add clean, editorial visual hierarchy to the red scrolling marquee so key deadline and scarcity phrases catch the eye without feeling cheesy.

### Changes

1. **Rewrite `src/components/header/PreSaleMarquee.tsx`**
   - Replace the flat `MARQUEE_COPY` string with a structured JSX helper that returns `<span>` segments.
   - Wrap urgency phrases in spans with an underline class:
     - `FIRST DROP SHIPS JULY 1ST` — hard deadline, highest urgency
     - `FOUNDING MEMBER ACCESS CLOSES SOON` — scarcity on tribe access
   - Keep the existing `sr-only` span as plain text for screen-reader accessibility.
   - Preserve the 4x repeat inside the `animate-marquee` container and all existing styling (height, bg, border, font size, tracking).

2. **Add CSS utility in `src/index.css`**
   - Introduce `.marquee-underline` in the `@layer components` block, placed directly after the existing `.animate-marquee` rules.
   - Style: `text-decoration: underline`, `text-decoration-color: hsl(0 0% 100% / 0.6)`, `text-underline-offset: 3px`.
   - On hover, bump underline opacity to 100% for a subtle interaction cue.

### Scope
- Only `PreSaleMarquee.tsx` and `index.css` are touched.
- No changes to animation speed, marquee height, colors, or any other page.
- No new dependencies.

### Visual Result
Scrolling red bar where "FIRST DROP SHIPS JULY 1ST" and "FOUNDING MEMBER ACCESS CLOSES SOON" carry a thin white underline at ~60% opacity — clean, editorial, immediately readable.