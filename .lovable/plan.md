

# Round 19 — Veepo Footer "veepo.ca" Clarity + UI/UX Polish Pass

## Current State

The Veepo footer attribution at lines 158-181 of `Footer.tsx` is already well-built with:
- Orange/green hover color reveals on "Vision" and "Powered"
- Gradient underline animation
- Logo brightness lift on hover
- Links to `https://veepo.ca/case-studies`

However, the logo image alt text says "VeePo" with no ".ca" suffix, and there is no textual "veepo.ca" anywhere — only the logo image. If the logo doesn't clearly say "veepo.ca", visitors won't know it's veepo.ca vs veepo.com.

## Changes

| File | Change |
|------|--------|
| `src/components/footer/Footer.tsx` | 1. Add a small `veepo.ca` text label beneath the logo image (`text-[10px] tracking-[0.2em] uppercase text-white/30 group-hover:text-white/60`) so the domain is explicitly visible even if the logo PNG doesn't include ".ca". 2. Update alt text from "VeePo" to "veepo.ca — Where Vision Meets Precision". 3. Update copyright year from 2025 to 2026 (current date is March 2026). |

No other files changed. No database changes. No layout/spacing changes — just a text label addition and alt text fix.

