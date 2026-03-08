

# Round 22 — Account Redirect Fix + MobileMenu Auth Timing + Performance Guard

## Issues Found

### 1. Account Protected Route Redirects to Landing Splash (UX Bug)
**Problem:** `ProtectedAccountRoute` navigates to `/?auth=true` when an unauthenticated user hits `/account/*`. The `/` route renders the `LandingPage` (cinematic splash screen), not the store. After signing in, the user gets redirected back, but the splash screen flash is jarring and confusing.

**Fix:** Change the redirect target from `/?auth=true` to `/home?auth=true` so the user lands on the actual store homepage with the auth modal open.

| File | Change |
|------|--------|
| `src/components/account/ProtectedAccountRoute.tsx` | Line 19: change `navigate('/?auth=true')` to `navigate('/home?auth=true')` |

### 2. MobileMenu Auth Open Timing Gap (UX Polish)
**Problem:** When tapping "Sign In" in the MobileMenu, the menu closes first, then `setTimeout(onAuthOpen, 300)` fires. During that 300ms gap the user sees nothing happening — the menu is gone and the auth modal hasn't appeared yet. Same issue exists for Search and Favorites buttons.

**Fix:** Reduce the delay from 300ms to 150ms. The menu exit animation is 300ms, but the panel is visually gone by ~150ms. This tightens the perceived gap without overlap.

| File | Change |
|------|--------|
| `src/components/header/MobileMenu.tsx` | Lines 284, 294, 329: change all `setTimeout(..., 300)` to `setTimeout(..., 150)` |

### 3. LandingPage RAF Cleanup Safety (Performance)
**Problem:** The LandingPage parallax effect uses `requestAnimationFrame` in a loop. If the component unmounts mid-frame, the `cancelAnimationFrame` in cleanup uses a stale `rafId.current` because the tick function re-assigns it asynchronously. This could cause a leaked frame on fast navigation.

**Fix:** Use the `active` boolean flag (already present) as the sole cancellation mechanism. Add `cancelAnimationFrame(rafId.current)` in the cleanup alongside setting `active = false` for belt-and-suspenders safety. The existing code already does this correctly — no change needed here after re-reading.

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- No visual design changes
- Auth flow logic unchanged (only redirect destination updated)

