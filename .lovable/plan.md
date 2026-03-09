

# Round 28 — SearchOverlay Mobile dvh Fix

## Issue Found

### SearchOverlay Mobile Missing `h-[100dvh]` (iOS Safari Height Glitch)
**File:** `src/components/header/SearchOverlay.tsx`, line 315

The mobile full-screen search overlay uses `fixed inset-0` without `h-[100dvh]`. On iOS Safari, this causes the overlay to extend behind the URL bar, creating a visible gap or allowing background scroll bleed when the browser chrome animates in/out. Every other overlay (CartDrawer, FavoritesDrawer, MobileMenu, AuthModal, FullScreenNav) already has this fix applied in rounds 23-27.

**Fix:** Add `h-[100dvh]` to the mobile overlay's className on line 315.

| File | Line | Change |
|------|------|--------|
| `src/components/header/SearchOverlay.tsx` | 315 | Add `h-[100dvh]` to className |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- Desktop search overlay unaffected (it's a different element)
- All other overlays already patched

