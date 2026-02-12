
# Fix 1: Admin Login -- Post-Sign-In Role Verification

## The Problem

Right now, when someone signs in at `/ops-portal/login`:

1. `signIn()` succeeds for ANY valid user (admin or not)
2. The page navigates to `/ops-portal`
3. `ProtectedRoute` checks `isAdmin` from the auth context
4. If not admin, the user sees a dead-end "ACCESS DENIED" page with no way back except a tiny link

This is broken UX. A non-admin user gets authenticated, sees a success toast ("Welcome back, Session authenticated"), and then immediately hits a wall. The login page should reject non-admins before navigating.

Additionally, there's a race condition: `isAdmin` is set asynchronously in `useAuth` via `checkAdminRole` inside a `setTimeout`. The navigation to `/ops-portal` can happen before `isAdmin` is resolved, causing a brief flash of the "ACCESS DENIED" screen even for actual admins.

## The Fix

Modify `AdminLogin.tsx` to verify admin role immediately after successful sign-in, before navigating:

1. After `signIn()` succeeds, query `user_roles` table directly for `role = 'admin'` matching the signed-in user
2. If not admin: call `signOut()` immediately and show an inline error message "This account is not authorized for the operations portal"
3. If admin: navigate to `/ops-portal` as normal
4. Add an inline error state (red text below the form) for auth failures instead of relying solely on toasts which can be missed

### Additional Login Fixes in This Pass
- **Forgot password empty field**: Add email validation before calling `resetPasswordForEmail`. If blank, show inline error "Please enter your email"
- **Inline error for wrong credentials**: Instead of just a toast, set a form-level error string displayed below the Sign In button

## Technical Changes

### File: `src/pages/admin/AdminLogin.tsx`

**handleSignIn function** (lines 31-72):
```
After signIn succeeds (no error):
1. Get the session to extract user ID
2. Query: supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle()
3. If no admin role found:
   - await signOut()
   - Set formError state: "This account is not authorized."
   - Return (don't navigate)
4. If admin confirmed: navigate('/ops-portal')
```

**New state**: `formError` string displayed below the Sign In button in red text.

**Forgot password section** (lines 177-178):
```
Add validation: if forgotEmail is empty or not a valid email, 
set a local error state instead of silently returning.
```

## What This Does NOT Change
- No layout changes
- No new dependencies
- No database changes
- The `ProtectedRoute` component stays as-is (defense in depth)
- The `useAuth` context stays as-is

## Risk Assessment
- **Low risk**: Only changes the login page logic
- **No breaking changes**: The `ProtectedRoute` still works as a fallback safety net
- **Solves**: Dead-end UX for non-admin users, race condition flash for admin users, missed toast errors
