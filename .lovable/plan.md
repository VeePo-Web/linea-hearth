

# Round 12 — Auth System Audit: Bugs and Hardening

## Critical Bug Found

### 1. `?auth=true` Redirect Is Broken
`ProtectedAccountRoute` redirects unauthenticated users to `/?auth=true`, but **nothing reads that query parameter**. The `LandingPage` component (mounted at `/`) never checks for `?auth=true` and never opens the auth modal. The user lands on the landing page with no indication they need to sign in.

Additionally, the `authRedirect` sessionStorage value is set but **never consumed** after successful auth — the user is never redirected back to their intended destination.

**Fix:** Add a `useEffect` in `Navigation.tsx` that reads `?auth=true` from the URL and opens the auth modal. After successful auth, read `authRedirect` from sessionStorage and navigate there. Clean up both the query param and sessionStorage after use.

### 2. Sign-Up Success Message Is Misleading (Email Confirmation)
The `CreateAccountForm` calls `onSuccess()` immediately and shows "Your account has been created successfully" — but if email confirmation is enabled (the default, and the correct setting for this project), the user **cannot sign in until they confirm their email**. The modal closes and the user appears signed in momentarily before the session is rejected.

**Fix:** After `signUp`, check the response for `data.user?.identities`. If identities is empty or `email_confirmed_at` is null, show a "Check your email to confirm" message instead of closing the modal and toasting success. Only call `onSuccess()` if the user is actually authenticated.

### 3. Sign-Up Error Handling Gaps
- The `signUp` function in `useAuth` returns `{ error }` but doesn't return `{ data, error }`. The `CreateAccountForm` has no way to inspect the response data to determine if email confirmation is pending vs. the account was auto-confirmed.

**Fix:** Update `signUp` in `useAuth.tsx` to return `{ data, error }` so the form can inspect the signup response.

### 4. Google OAuth Button — `rounded` Inconsistency
The Google auth button uses `rounded` (line 65 of GoogleAuthButton.tsx). The design system uses sharp corners (`rounded-none`). This was missed in prior rounds.

**Fix:** Replace `rounded` with `rounded-none`.

### 5. `ProtectedAccountRoute` — Unused State
`shouldShowAuth` state variable (line 14) is declared but never used.

**Fix:** Remove it.

---

## Summary

| File | Change |
|------|--------|
| `Navigation.tsx` | Add `useEffect` to read `?auth=true` and open auth modal; consume `authRedirect` after auth success |
| `useAuth.tsx` | Return `{ data, error }` from `signUp` |
| `CreateAccountForm.tsx` | Handle email confirmation pending state instead of assuming instant success |
| `GoogleAuthButton.tsx` | Replace `rounded` with `rounded-none` |
| `ProtectedAccountRoute.tsx` | Remove unused `shouldShowAuth` state |

## What Is NOT Changed
- Auth provider logic (Google OAuth fallback already in place)
- SignInForm (already robust)
- ResetPassword page (already handles invalid sessions)
- Admin auth flow (separate system, already secured)
- Database schema or RLS policies

