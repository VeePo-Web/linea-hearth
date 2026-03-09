

# Round 26 — SPA Link Fixes + FullScreenNav h-[100dvh] Consistency

## Issues Found

### 1. Two Internal Links Use `<a href>` Instead of React Router `<Link>` (SPA Break)
When a user clicks "Privacy Policy" from the Terms of Service page or the Contact form, the browser performs a full page reload, destroying all React state (cart contents, auth session, scroll position). These are internal routes that must use SPA navigation.

**Files affected:**

| File | Line | Current | Fix |
|------|------|---------|-----|
| `src/pages/TermsOfService.tsx` | 141 | `<a href="/privacy-policy" ...>` | Import `Link` from react-router-dom, replace with `<Link to="/privacy-policy" ...>` |
| `src/components/contact/ContactForm.tsx` | 233 | `<a href="/privacy-policy" ...>` | Import `Link` from react-router-dom, replace with `<Link to="/privacy-policy" ...>` |

### 2. FullScreenNav Missing `h-[100dvh]` (iOS Safari Height Glitch)
The FullScreenNav overlay at line 158 uses `fixed inset-0` without an explicit `h-[100dvh]`. On iOS Safari, `inset-0` resolves to the layout viewport (including hidden browser chrome), which can cause the nav background to extend behind the URL bar and create a visible gap or scroll artifact when the browser chrome animates in/out.

**Fix:** Add `h-[100dvh]` to the root `motion.div` at line 158 of `src/components/header/FullScreenNav.tsx` — same pattern applied to CartDrawer, FavoritesDrawer, MobileMenu, and AuthModal in rounds 23-24.

| File | Line | Change |
|------|------|--------|
| `src/components/header/FullScreenNav.tsx` | 158 | Add `h-[100dvh]` to className |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- No visual design changes
- Auth flow, admin dashboard logic unchanged
- All external links (`mailto:`, `target="_blank"`) remain as `<a>` tags (correct behavior)

