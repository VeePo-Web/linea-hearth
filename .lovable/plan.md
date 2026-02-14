

# User Account Features Audit and Fix Plan

## Issues Found

### Bug 1: Euro Symbol in Order History (Critical -- user-facing)

**File:** `src/pages/account/AccountOrders.tsx`, line 130

The order total displays `€` instead of `$`:
```
€{(order.total_cents / 100).toFixed(2)}
```
Should be `$`.

---

### Bug 2: Password Change Skips Current Password Verification

**File:** `src/pages/account/AccountProfile.tsx`

The password form schema defines a `currentPassword` field (line 21), but:
- There is no input field rendered for it in the UI
- The submit handler (line 70) calls `supabase.auth.updateUser({ password })` directly, ignoring `currentPassword` entirely

This means anyone with an active session can change the password without knowing the current one. While Supabase's `updateUser` does allow this for authenticated users, it's a UX problem -- the form *looks* like it should ask for the current password but doesn't.

**Fix:** Remove `currentPassword` from the zod schema since Supabase doesn't support verifying the old password client-side anyway. The form already requires an active session, which is sufficient. This eliminates the dead validation rule that would always fail (required but no input).

---

### Bug 3: N+1 Query in Order Fetching

**File:** `src/hooks/useOrders.ts`, lines 33-45

The hook fetches each order individually then loops through to fetch items one-by-one. For a user with 10 orders, this fires 11 database calls. This causes slow load times and unnecessary network traffic.

**Fix:** Fetch orders with items in a single query using Supabase's relation syntax:
```typescript
.select('*, order_items(*)')
```

---

## Features That Are Working Correctly

After reviewing every file, these features are solid and need no changes:

| Feature | Status | Notes |
|---------|--------|-------|
| Auth Modal (sign in / sign up) | Working | Slide-in panel, tab switching, email typo detection all functional |
| Google OAuth | Working | Just fixed -- uses Lovable Cloud managed module |
| Forgot Password flow | Working | In-modal flow with email sending and success confirmation |
| Reset Password page | Working | Token validation, password match checking, strength indicator |
| Admin Login | Working | Role verification, unauthorized rejection with sign-out, forgot password |
| Admin ProtectedRoute | Working | Redirects non-admins, loading states |
| Account Dashboard | Working | Stats, recent order, quick actions |
| Account Profile | Working (after fix) | Name editing, password change |
| Account Addresses | Working | Full CRUD, default shipping/billing flags, form validation |
| Account Favorites | Working | Grid view, remove, quick add to bag |
| Account Order Detail | Working | Status timeline, item list, reorder buttons, shipping address |
| ProtectedAccountRoute | Working | Redirects unauthenticated users to home with auth modal |
| Sign Out | Working | Clears session and admin state |

---

## Implementation Steps

### Step 1: Fix euro symbol in AccountOrders.tsx
Change line 130 from `€` to `$`.

### Step 2: Clean up password schema in AccountProfile.tsx
Remove the unused `currentPassword` field from the zod schema and update the TypeScript type.

### Step 3: Optimize order fetching in useOrders.ts
Replace the N+1 loop with a single Supabase query using relation joins.

---

## Risk Level
All three fixes are low-risk, isolated changes with no side effects.

