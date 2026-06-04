## Goal
Rebuild `src/pages/NotFound.tsx` as a "lone epigraph" 404 — scripture-forward, no imagery except a 36px lion favicon sigil, typography-only, dark field.

## Design
- **Background**: Full dark (`bg-background`, `#0F172A`), `h-[100dvh]`.
- **Layout**: Single centered column. Tall, narrow text column.
- **404 mark**: Reduced to a 10px superscript reference mark, muted.
- **Verse**: Dominant — "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty." — set in large, light text, centered, narrow max-width (~480px), generous line-height.
- **Reference**: "— Exodus 28:2 (ASV)" below in smaller muted caps.
- **Lion sigil**: 36px favicon at bottom-center as a quiet seal.
- **Back link**: "Return to the Treasury" (or "Enter the Gate" — we can decide in build), sharp-edged button or text link, appears after a 3-second delay via Framer Motion.
- **Animation**: Slow fade-in (1.2s) on mount. Back link staggers in at 3s.
- **Styling**: `rounded-none`, `-0.02em` tracking, editorialEase `[0.25, 0.46, 0.45, 0.94]`. No yellow. Silver Chrome accents if any.

## Technical
- Single file: `src/pages/NotFound.tsx`.
- Use `motion` from framer-motion for entrance + delayed Back link.
- Use existing `Link` from react-router-dom.
- Respect `prefers-reduced-motion`.
- Keep `Helmet` for SEO: title "Not Found — Line of Judah".
- No `Layout` wrapper — this page should feel like a standalone epigraph, not a standard page. Or use `Layout` but override styles. Decision: full-bleed standalone, no Layout wrapper for immersion.

## Files
- `src/pages/NotFound.tsx` (rewrite)
