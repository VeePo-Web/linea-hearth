

# Round 15 — Fix Blank Screen Crash from useAuth Context Loss

## Root Cause

The error `useAuth must be used within an AuthProvider` causes a **blank screen** because:

1. `Navigation` itself calls `useAuth()` at line 30
2. When the context is temporarily unavailable (HMR, fast refresh, or edge-case React reconciliation), `useAuth()` throws
3. The `ErrorBoundary` components around `MobileMenu`, `FavoritesDrawer`, and `AccountDropdown` are irrelevant because the crash happens in their **parent** (`Navigation`), not in the children
4. No ErrorBoundary exists above `Navigation` → the error propagates to the root and blanks the screen

## Fix

**Make `useAuth` resilient instead of throwing.** Return safe defaults when the context is missing, so no component ever crashes from a missing provider. This is the same pattern already applied for `useSizeQuizContextSafe`.

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Change `useAuth()` to return safe defaults (null user, no-op functions, loading=true) when context is undefined, instead of throwing. Remove the throw entirely. |

The safe defaults ensure:
- `user` is `null` → UI shows logged-out state
- `loading` is `true` → protected routes show spinner instead of redirecting
- `signIn`, `signUp`, `signOut`, `signInWithGoogle` are no-op async functions that return error objects

This is a single-line-area change that eliminates the entire class of "useAuth outside AuthProvider" crashes across the app — MobileMenu, AccountDropdown, and any future component.

## What Is NOT Changed
- AuthProvider logic, session handling, admin checks
- ErrorBoundary wrappers (kept as defense-in-depth)
- Any UI components, pages, or database schema

