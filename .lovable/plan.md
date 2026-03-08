

# Round 13 — Fix MobileMenu and FavoritesDrawer Crashes + Auth Audit Confirmation

## Auth System Audit: Complete

The full auth system has been audited across all previous rounds and is production-ready:

- **Email/password sign-up and sign-in**: Uses standard backend calls, works on any domain
- **Google OAuth**: Try/catch fallback from managed OAuth to standard `supabase.auth.signInWithOAuth`
- **Email confirmation handling**: `CreateAccountForm` checks `confirmed_at` and shows appropriate messaging
- **Password reset**: Full flow with `/reset-password` page, inline forgot-password in `SignInForm`
- **Protected routes**: `ProtectedAccountRoute` redirects to `/?auth=true`, `Navigation` reads the param and opens auth modal, post-login redirects to intended destination via `sessionStorage`
- **Error handling**: Graceful messages for all failure states, email typo detection on all email inputs
- **Design system compliance**: All auth components use `rounded-none`, `text-foreground` for indicators

No auth changes needed.

## Critical Issue: MobileMenu and FavoritesDrawer Crashes

Console logs show two components crashing on render: `<MobileMenu>` and `<FavoritesDrawer>`. The error traces don't include the root cause message, which means I need to investigate by reading the code carefully and adding defensive guards.

### Likely Cause: `useQuickAdd` hook in `FavoritesDrawer`

The `FavoriteItem` component calls `useQuickAdd` for every rendered favorite item. `useQuickAdd` internally calls `useSizeQuizContext()` which uses `useContext` and is wrapped in a try/catch. However, if `SizeQuizContext` throws during render (not just returns undefined), the catch may not handle it properly in React's strict mode.

Additionally, `MobileMenu` calls `useProfile()` which depends on `useAuth()`. If there's a subtle timing issue (e.g., profile query fires before auth is ready), it could cause a crash.

### Plan

1. **Add an ErrorBoundary component** — Wrap `Navigation`'s children (MobileMenu, FavoritesDrawer) in error boundaries so crashes in these drawers don't take down the entire site. This is defensive infrastructure that any production site needs.

2. **Fix the root crash in FavoritesDrawer** — Investigate `useQuickAdd`'s `useSizeQuizContext()` try/catch pattern. Hooks cannot be called conditionally in React, and wrapping a hook call in try/catch is technically valid but fragile. If the context provider is missing or throws, this can cause React to crash. Make the hook usage defensive.

3. **Fix the root crash in MobileMenu** — Review `useProfile` and ensure it handles the unauthenticated state gracefully without triggering any Supabase query errors during initial render.

## Implementation

| File | Change |
|------|--------|
| `src/components/ui/ErrorBoundary.tsx` | Create a reusable ErrorBoundary component |
| `src/components/header/Navigation.tsx` | Wrap MobileMenu and FavoritesDrawer in ErrorBoundary |
| `src/hooks/useQuickAdd.ts` | Make `useSizeQuizContext()` usage safer — always call the hook but handle missing context gracefully |

## What Is NOT Changed
- Auth flow (confirmed complete and working)
- SignInForm, CreateAccountForm, AuthModal, GoogleAuthButton
- Database schema or RLS policies
- Any other pages or components

