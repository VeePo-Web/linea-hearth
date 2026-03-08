

# Round 14 — Auth Craft Polish and Duplicate Request Deduplication

## Auth Audit Status: Complete and Verified

The full authentication system has been audited across Rounds 11-13 and is production-ready:

- Email/password sign-up and sign-in: Standard backend calls, domain-independent
- Google OAuth: Try/catch fallback from managed to standard `signInWithOAuth`
- Email confirmation: `CreateAccountForm` checks `confirmed_at`, shows "Check your email" toast
- Password reset: Full flow with inline forgot-password and `/reset-password` page
- Protected routes: `ProtectedAccountRoute` redirects to `/?auth=true`, Navigation reads param
- Post-login redirect: `sessionStorage` consumed after auth success
- Error boundaries: `MobileMenu` and `FavoritesDrawer` wrapped in `ErrorBoundary`
- Safe context hooks: `useSizeQuizContextSafe` prevents render crashes
- Design system compliance: All auth UI uses `rounded-none`
- Zero console errors confirmed

No auth changes are needed.

## Craft-Level Improvements Found

### 1. Error message `rounded` inconsistency in both auth forms
Both `CreateAccountForm` (line 101) and `SignInForm` (line 156) use `rounded` on the error message `div`. The design system mandates `rounded-none`. This is the kind of detail that makes a site feel inconsistent at a subconscious level.

### 2. Duplicate `user_size_preferences` POST on page load
Network requests show two identical POST requests to `user_size_preferences` fired within the same second (timestamps `21:51:49Z`). This is a performance waste — the `useSizeMemory` hook is likely double-firing its sync. The upsert is idempotent so it doesn't cause data issues, but it doubles network overhead on every page load for authenticated users.

### 3. Duplicate `size_confidence_stats` GET on page load
Same pattern — two identical GET requests to `size_confidence_stats` fired simultaneously. This suggests the hook is mounted in two places or React strict mode is causing double-mount without cleanup.

## Implementation

| File | Change |
|------|--------|
| `CreateAccountForm.tsx` | Change `rounded` to `rounded-none` on error div (line 101) |
| `SignInForm.tsx` | Change `rounded` to `rounded-none` on error div (line 156) |
| `useSizeMemory.ts` | Add deduplication guard (e.g., `useRef` flag) to prevent double POST/GET on mount |

## What Is NOT Changed
- Auth flow logic (complete and verified)
- Database schema or RLS policies
- Any other pages or components

