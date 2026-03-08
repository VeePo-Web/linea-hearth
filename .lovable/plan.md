

# Round 23 — Auth Modal Link Fix + CartDrawer h-screen Consistency + Veepo Footer Spacing Tighten

## Issues Found

### 1. Auth Modal Footer Links Cause Full Page Reload (UX Bug)
**Problem:** The "Terms of Service" and "Privacy Policy" links in `AuthModal.tsx` (lines 179, 183) use `<a href="...">` instead of React Router `<Link>`. Clicking them triggers a full browser navigation, unmounting the entire React app and losing all state (cart, auth progress, form data). On a modal that's open during signup, this is a conversion killer.

**Fix:** Replace `<a href>` with `<Link to>` from react-router-dom, and add `onClick={onClose}` so the modal closes cleanly before navigation.

| File | Change |
|------|--------|
| `src/components/auth/AuthModal.tsx` | Import `Link` from react-router-dom. Lines 179-185: Replace both `<a href="/terms-of-service">` and `<a href="/privacy-policy">` with `<Link to="..." onClick={onClose}>` |

### 2. CartDrawer Uses `min-h-screen` Which Differs from `100dvh` on iOS (Visual Glitch)
**Problem:** The CartDrawer's outer wrapper (line 154) uses both `min-h-screen` and `h-[100dvh]`. On iOS Safari, `100vh` (which `min-h-screen` resolves to) includes the browser chrome area, making the drawer slightly taller than the visual viewport. While `100dvh` is correct, the `min-h-screen` override can cause a subtle scroll within the drawer on iOS, especially when the keyboard is open.

**Fix:** Remove `min-h-screen` from both the wrapper div and the backdrop div, keeping only `h-[100dvh]`.

| File | Change |
|------|--------|
| `src/components/cart/CartDrawer.tsx` | Line 154: remove `min-h-screen` from outer div. Line 157: remove `min-h-screen` from backdrop div. Line 172: remove `min-h-screen` from drawer panel div. |

### 3. Veepo Footer Attribution — Tighten Vertical Spacing (Cheap Detail)
**Problem:** The Veepo attribution block has `gap-3` between elements (tagline, logo, domain, motto, gradient line). This makes the stack feel too spread out and takes excessive vertical real estate. A tighter `gap-1.5` creates a more confident, compact brand moment.

**Fix:** Change `gap-3` to `gap-1.5` on the attribution flex container.

| File | Change |
|------|--------|
| `src/components/footer/Footer.tsx` | Line 163: change `gap-3` to `gap-1.5` |

## What Is NOT Changed
- No layout, typography, or spacing changes beyond the three targeted fixes
- No database changes
- Auth flow logic unchanged
- Admin dashboard unchanged

