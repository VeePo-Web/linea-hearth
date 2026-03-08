

# Performance & Polish Audit: Round 10 — Authentication Independence and Remaining Green

## Problem

The current Google OAuth implementation uses `lovable.auth.signInWithOAuth` from `@lovable.dev/cloud-auth-js`, which is Lovable's managed OAuth. While this works on `*.lovable.app` published domains, it creates a dependency on Lovable's infrastructure. Email/password auth already uses standard backend calls and works everywhere. The goal is to make the entire auth system robust and independent so public users on any domain can authenticate without issues.

## Plan

### 1. Add Google OAuth Fallback in `useAuth.tsx`
Wrap the `signInWithGoogle` method to try `lovable.auth.signInWithOAuth` first, and if it fails (e.g., on a custom domain or non-Lovable environment), fall back to standard `supabase.auth.signInWithOAuth({ provider: 'google' })`. This ensures Google sign-in works regardless of hosting environment.

```typescript
const signInWithGoogle = async () => {
  try {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    const error = result.error ? ... : null;
    return { error };
  } catch {
    // Fallback to standard OAuth
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }
};
```

### 2. Graceful Google OAuth Error Handling in `GoogleAuthButton.tsx`
If Google OAuth fails entirely (no provider configured in either system), show a clear, non-technical message and guide the user to email/password sign-in instead. No crashing, no cryptic errors.

### 3. Fix Remaining `text-green-600` in Customer-Facing Auth Components
Two files still use raw `text-green-600` in customer-facing auth surfaces:

- **`CreateAccountForm.tsx` (line 174)**: Password strength indicator uses `text-green-600`. Replace with `text-foreground`.
- **`ResetPassword.tsx` (lines 171, 175, 211, 212)**: Password strength and match indicators use `text-green-600`. Replace with `text-foreground`.

**Not changed** (admin/internal/semantic):
- `AdminOrderDetail.tsx` — admin page, semantic discount color
- `AccountOrderDetail.tsx` — account page discount display
- `SizeRecommendation.tsx` — internal try-on tool
- `AskUsModal.tsx` — borderline, lower priority standalone form

---

## Summary

| File | Change |
|------|--------|
| `useAuth.tsx` | Add try/catch fallback for Google OAuth to standard Supabase OAuth |
| `GoogleAuthButton.tsx` | Improve error messaging when OAuth unavailable |
| `CreateAccountForm.tsx` | Replace `text-green-600` with `text-foreground` |
| `ResetPassword.tsx` | Replace 4 `text-green-600` instances with `text-foreground` |

