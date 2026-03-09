

# Round 31 — Remove Lovable Managed Auth from Google OAuth + Polish

## Critical Issue: Google OAuth Routes Through Lovable Infrastructure

**File:** `src/hooks/useAuth.tsx`, lines 130-145

The `signInWithGoogle` function currently tries `lovable.auth.signInWithOAuth("google", ...)` first, which routes through `@lovable.dev/cloud-auth-js` — an external Lovable-hosted OAuth proxy. The standard Supabase OAuth is only a catch fallback. This creates a dependency on Lovable's infrastructure for every Google sign-in attempt.

**Fix:** Reverse the logic. Use standard `supabase.auth.signInWithOAuth` as the primary path. Remove the `lovable` import from `useAuth.tsx` entirely so there is zero dependency on Lovable managed auth for authentication flows.

The `src/integrations/lovable/index.ts` file is auto-generated and will remain untouched — we simply stop importing it in `useAuth.tsx`.

**Important caveat:** Standard Supabase Google OAuth requires Google OAuth credentials (Client ID + Secret) configured in the backend auth settings. If these aren't configured, Google sign-in will fail gracefully — the `GoogleAuthButton` component already handles errors with a toast: "Google sign-in is unavailable. Please use email and password to sign in." This is the correct UX.

### Change 1: Simplify `signInWithGoogle` in `useAuth.tsx`

| File | Lines | Change |
|------|-------|--------|
| `src/hooks/useAuth.tsx` | 4 | Remove `import { lovable }` |
| `src/hooks/useAuth.tsx` | 130-145 | Replace with direct `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })` — no try/catch needed, single clean path |

Before:
```typescript
import { lovable } from '@/integrations/lovable/index';
// ...
const signInWithGoogle = async () => {
  try {
    const result = await lovable.auth.signInWithOAuth("google", { ... });
    // ...
  } catch {
    const { error } = await supabase.auth.signInWithOAuth({ ... });
    return { error };
  }
};
```

After:
```typescript
// No lovable import
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return { error };
};
```

## What Is NOT Changed
- `src/integrations/lovable/index.ts` — auto-generated, untouched
- `supabase/functions/generate-avatar-config/index.ts` — AI avatar generation still uses Lovable API (not auth-related)
- No layout, typography, or spacing changes
- No database changes
- Admin dashboard, cart, checkout logic untouched
- All scroll lock, dvh, and overlay fixes from rounds 23-30 preserved

## Audit Summary — Verified Clean

| Area | Status |
|------|--------|
| Email/password sign-up (CreateAccountForm) | Zod validation, typo detection, confirmation handling — solid |
| Email/password sign-in (SignInForm) | Error handling, forgot password flow — solid |
| Password reset (ResetPassword page) | Session validation, redirectTo configured — solid |
| Admin login (AdminLogin) | Role check post-auth, non-admin rejection — solid |
| Admin protected route | Loading state, redirect, access denied — solid |
| Profile upsert (useAuth + useProfile) | Application-level safety net — solid |
| Cart drawer scroll lock | lockScroll/unlockScroll + overscroll-contain — solid |
| Mobile menu scroll lock | Same pattern — solid |
| Auth modal scroll lock | Same pattern — solid |
| FullScreenNav scroll lock | Same pattern + touch-none — solid |
| FavoritesDrawer scroll lock | Same pattern — solid |
| All overlays h-[100dvh] | Applied consistently — solid |

