

# Round 21 — Scroll Lock Re-entrancy Fix + Admin Route Race Condition + Google Icon Polish

## Issues Found

### 1. Scroll Lock Re-entrancy Bug (Critical)
The `scrollLock.ts` utility uses a single `savedScrollY` variable. If two overlays open sequentially (e.g., MobileMenu opens, then user taps "Sign In" which opens AuthModal), the second `lockScroll()` call overwrites `savedScrollY` with `0` (because the body is already `position: fixed` and `window.scrollY` returns 0). When both close, the page jumps to the top.

**Fix:** Add a reference counter. Only capture `scrollY` on the first lock, only restore on the last unlock.

```text
lockScroll() called (count 0→1): save scrollY, apply class
lockScroll() called (count 1→2): no-op (already locked)
unlockScroll() called (count 2→1): no-op (still locked)
unlockScroll() called (count 1→0): remove class, restore scrollY
```

| File | Change |
|------|--------|
| `src/lib/scrollLock.ts` | Add `lockCount` variable. `lockScroll()` increments count, only captures scrollY and applies class when count goes from 0 to 1. `unlockScroll()` decrements count, only removes class and restores scrollY when count goes from 1 to 0. |

### 2. Admin ProtectedRoute Flash of "ACCESS DENIED" (UX Bug)
When navigating to `/ops-portal` after login, `useAuth` sets `loading = false` before `isAdmin` resolves (due to `setTimeout` in `onAuthStateChange`). The `ProtectedRoute` sees `user` exists but `isAdmin` is false, briefly showing "ACCESS DENIED" before the role check completes.

**Fix:** Track admin role loading separately. While admin status is still being checked, show the loading spinner instead of "ACCESS DENIED".

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Add `adminLoading` boolean state. Set it to `true` when starting the admin check, `false` when resolved. Expose in context. |
| `src/components/admin/ProtectedRoute.tsx` | Consume `adminLoading`. When `requireAdmin && adminLoading`, show spinner instead of "ACCESS DENIED". |

### 3. Google Icon is Monochrome (Cheap Detail)
`GoogleAuthButton.tsx` renders all 4 Google logo paths with `fill="currentColor"`, making them all one color. The recognizable Google "G" uses 4 distinct brand colors (blue, red, yellow, green). Monochrome reads as a knockoff.

**Fix:** Replace `fill="currentColor"` on the parent SVG with the official Google brand colors on each individual path.

| File | Change |
|------|--------|
| `src/components/auth/GoogleAuthButton.tsx` | Remove `fill="currentColor"` from `<svg>`, add `fill="#4285F4"` (blue), `fill="#34A853"` (green), `fill="#FBBC05"` (yellow), `fill="#EA4335"` (red) to the 4 paths respectively. |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- No visual design changes beyond fixing the Google icon to use its actual brand colors

