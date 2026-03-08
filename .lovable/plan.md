

# Round 24 — iOS Drawer Height Consistency + SearchOverlay Double-Unlock Cleanup

## Issues Found

### 1. Three Drawers Still Use `h-screen` Instead of `h-[100dvh]` (iOS Safari Glitch)
**Problem:** In Round 23, we fixed the CartDrawer to use `h-[100dvh]` instead of `h-screen` / `min-h-screen` to prevent iOS Safari's browser chrome from making the drawer taller than the visual viewport. Three other drawer/panel components still use `h-screen`, creating the same subtle scroll bug on mobile Safari:

- **FavoritesDrawer** (line 250): `h-screen`
- **MobileMenu** (line 151): `h-screen`
- **AuthModal** (line 81): `h-screen`

**Fix:** Replace `h-screen` with `h-[100dvh]` on the drawer panel div in all three components. This is a one-word class change per file — no layout or visual change on non-Safari browsers.

| File | Change |
|------|--------|
| `src/components/favorites/FavoritesDrawer.tsx` | Line 250: `h-screen` → `h-[100dvh]` |
| `src/components/header/MobileMenu.tsx` | Line 151: `h-screen` → `h-[100dvh]` |
| `src/components/auth/AuthModal.tsx` | Line 81: `h-screen` → `h-[100dvh]` |

### 2. SearchOverlay Calls `unlockScroll()` Twice on Close (Code Smell)
**Problem:** The SearchOverlay's `useEffect` (lines 231-243) calls `unlockScroll()` in the `else` branch when `isOpen` becomes false, AND in the cleanup function. When closing, both fire: the cleanup from the previous render and the `else` branch of the new render. The reference counter prevents actual breakage (`Math.max(0, ...)`), but the redundant call is sloppy and could mask bugs if the locking system changes.

**Fix:** Remove the `unlockScroll()` from the `else` branch. The cleanup function already handles it correctly. Keep `setSearchValue("")` and `setDebouncedSearch("")` in the else branch — those are state resets, not scroll management.

| File | Change |
|------|--------|
| `src/components/header/SearchOverlay.tsx` | Lines 231-243: Remove `unlockScroll()` from the `else` branch. Keep the cleanup return as the sole unlock path. |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- No visual design changes
- Auth flow logic unchanged
- Admin dashboard unchanged

