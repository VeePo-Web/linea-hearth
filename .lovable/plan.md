

# Round 29 — Critical: Missing Signup Trigger + Profile Upsert Safety Net

## Critical Issue

The `handle_new_user` trigger on `auth.users` does **not exist** in the live database. The migration file created the `FUNCTION` but the `CREATE TRIGGER ... ON auth.users` statement was silently rejected because Lovable Cloud migrations cannot modify the `auth` schema.

**Impact:** Every new user signup (email or Google OAuth) fails to create a `profiles` row. This breaks:
- Account dashboard (profile page shows nothing)
- Mobile menu greeting (useProfile returns null)
- Account profile updates (UPDATE on non-existent row = silent failure)
- Any feature querying the profiles table for the logged-in user

Only 1 profile row exists in the database (likely the original admin, manually inserted).

## Fix Strategy

Since we cannot create triggers on `auth.users` via migrations in Lovable Cloud, we implement an **application-level upsert safety net** — the same pattern used by production Supabase apps when triggers aren't available.

### Change 1: Add profile upsert to `useAuth.tsx` on auth state change

When `onAuthStateChange` fires with a valid session, upsert a profile row. This is idempotent (uses `ON CONFLICT DO NOTHING` semantics via `.upsert()`) so it's safe for existing users.

**File:** `src/hooks/useAuth.tsx`

In the `onAuthStateChange` callback (line 54 block), after setting user state, call a helper that upserts the profile:

```typescript
const ensureProfile = async (user: User) => {
  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
  }, { onConflict: 'id', ignoreDuplicates: true });
};
```

Call `ensureProfile(session.user)` inside the `setTimeout` block alongside `checkAdminRole`, and also in the `getSession` block. This runs once per login/page-load — negligible cost.

### Change 2: Add profile upsert fallback to `useProfile.ts`

If `fetchProfile` returns a `PGRST116` (no rows) error, create the profile row on the spot using auth user data, then re-fetch. This catches edge cases where the auth state change fires before the component mounts.

**File:** `src/hooks/useProfile.ts`

In the `fetchProfile` function, after the `.single()` call, if error code is `PGRST116`:

```typescript
if (error?.code === 'PGRST116') {
  // Profile doesn't exist yet — create it
  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
  }, { onConflict: 'id', ignoreDuplicates: true });
  // Re-fetch
  const { data: retryData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (retryData) setProfile(retryData);
  return;
}
```

### What Is NOT Changed
- No layout, typography, or visual changes
- No database schema changes (profiles table already exists with correct structure and RLS)
- Admin dashboard, cart, checkout logic untouched
- No new dependencies

### Why This Is Critical
Without this fix, **every new user who signs up will have a broken account experience**. The profile page, order history greeting, and preference sync all depend on the profiles row existing.

