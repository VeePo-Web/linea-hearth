

# Round 25 — Dead Code Removal + Admin SPA Link Fix

## Issues Found

### 1. Dead Component: `src/components/header/ShoppingBag.tsx` (165 lines)
**Problem:** This is a legacy cart drawer component that is never imported anywhere in the codebase. It defines its own `CartItem` interface (with `price: string` instead of the current `price: number`) and uses none of the modern cart infrastructure (`useCart`, `CartDrawer`, bundle discounts, etc.). It's dead weight in the bundle — 165 lines of unused code that could confuse future maintenance and adds to IDE noise.

**Fix:** Delete the file entirely.

| File | Change |
|------|--------|
| `src/components/header/ShoppingBag.tsx` | Delete file |

### 2. Admin ProtectedRoute Uses `<a href="/">` Instead of React Router (SPA Break)
**Problem:** In `src/components/admin/ProtectedRoute.tsx` (line 36-40), the "Back to Store" link in the access-denied state uses a raw `<a href="/">`. This triggers a full page reload, dumping all React state (cart, auth session, favorites). Should use `<Link to="/">` for SPA navigation.

**Fix:** Import `Link` from react-router-dom and replace the `<a>` tag.

| File | Change |
|------|--------|
| `src/components/admin/ProtectedRoute.tsx` | Line 1: add `Link` to router import. Lines 36-40: Replace `<a href="/">` with `<Link to="/">` |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- Auth flow logic unchanged (already robust with zod, typo detection, confirmation)
- Admin dashboard logic unchanged

