

# Round 17 — Veepo Footer Attribution Upgrade + Auth Confirmation

## Auth Status: Verified Complete

The auth system is production-ready and domain-independent. No changes needed.

- `useAuth()` returns safe defaults (no throws, no blank screens)
- Email/password: standard backend calls
- Google OAuth: managed `lovable.auth.signInWithOAuth` with fallback to `supabase.auth.signInWithOAuth`
- Password reset, protected routes, error boundaries all hardened

## Veepo Footer Attribution — Current vs. Proposed

**Current:** Plain `text-xs text-white/40` text reading "Locally powered by veepo.ca" — forgettable, low-impact, reads as an afterthought.

**Veepo Brand Identity (from veepo.ca):**
- Pure black/dark backgrounds with clean white typography
- Tagline: "Where Vision Meets Precision" / "Let VeePo Power Your Vision"
- Minimal, confident, high-contrast aesthetic
- No color accents on the main brand — monochrome with selective warmth

**FlexServices pattern:** "The Vision For This Website Is Powered By" + Veepo logo image, with hover color reveals on key words.

**Proposed upgrade:** A self-contained, branded micro-banner that acts as a subtle but confident ad — separated from the Line of Judah footer content by its own border, using Veepo's own brand language while respecting the host site's premium tone.

## Implementation

| File | Change |
|------|--------|
| Copy Veepo logo | Copy `veepo-logo.png` from FlexServices project into this project's `src/assets/` |
| `src/components/footer/Footer.tsx` | Replace the plain text attribution (lines 157-167) with a branded micro-strip: a centered `<a>` linking to `https://veepo.ca/case-studies` containing the phrase **"This Vision Is Powered By"** in `text-white/50` with the Veepo logo image (~h-8) beside it. On hover: the word "Vision" shifts to `text-white`, "Powered" shifts to `text-white`, and the logo brightens slightly. The whole unit scales subtly (`hover:scale-[1.02]`). Wrapped in its own `border-t border-white/5 mt-4 pt-4` to give it breathing room as a distinct element. Uses `rounded-none` per design system. Link opens in new tab with `rel="noopener noreferrer"`. |

### Design Details

- Typography: `text-xs tracking-[0.15em] uppercase` for the phrase — editorial, not casual
- Logo height: `h-7` to `h-8` — prominent enough to read but not overwhelming
- Hover interaction: `group` wrapper with `group-hover:text-white` on key words + `group-hover:brightness-110` on logo — reveals energy on intent
- Transition: `transition-all duration-300` — smooth, premium feel
- No Line of Judah brand colors (no champagne) — this is Veepo's space, so it stays monochrome white-on-dark
- Mobile: stacks vertically with `flex-col` at small screens, `flex-row` at `sm:` breakpoint

## What Is NOT Changed
- Auth system (complete)
- Any other footer content, links, or structure
- No database or schema changes

