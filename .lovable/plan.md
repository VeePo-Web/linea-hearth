

# User Account System -- Complete Feature Audit and Fix Plan

## Summary

After reviewing every file in the account system (admin + customer), the previous round of fixes landed correctly. However, a full scan reveals one **critical systemic issue** and a handful of **functional improvements** needed to make every account feature bulletproof.

---

## CRITICAL: 87 Euro Symbols Still in Codebase

The previous fix corrected `AccountOrders.tsx`, but **9 other files** still display prices with the Euro symbol instead of Dollar. This affects cart, checkout, lookbook, saved items, and bundle features -- all user-facing.

### Files Requiring Currency Fix

| File | Occurrences |
|------|-------------|
| `src/components/cart/SavedItem.tsx` | 1 |
| `src/components/cart/SavedForLaterShelf.tsx` | 1 |
| `src/components/cart/TrustRow.tsx` | 1 |
| `src/components/cart/BundleProgress.tsx` | 5 |
| `src/components/checkout/SavingsSummary.tsx` | 4 |
| `src/components/lookbook/ShopTheLook.tsx` | 3 |
| `src/components/search/SearchQuickAdd.tsx` | 1+ |
| `src/hooks/useSavedForLater.ts` | 2 |
| `src/pages/CheckoutSuccess.tsx` | 1 |

### Fix
Simple find-and-replace: change every `€` to `$` in these files. No logic changes needed.

---

## Account Features Status (Post-Previous Fixes)

### Working Correctly -- No Changes Needed

| Feature | File(s) | Notes |
|---------|---------|-------|
| Auth Modal slide-in panel | `AuthModal.tsx` | Tab switching, animations, backdrop click-to-close |
| Email/password sign-in | `SignInForm.tsx` | Email typo detection, inline errors, password toggle |
| Account creation | `CreateAccountForm.tsx` | Email typo detection, password strength, benefits list |
| Google OAuth | `GoogleAuthButton.tsx`, `useAuth.tsx` | Fixed in previous session, uses Lovable Cloud module |
| Forgot password (in-modal) | `SignInForm.tsx` | Pre-fills email, multi-step flow, success state |
| Reset password page | `ResetPassword.tsx` | Token validation, strength indicator |
| Admin login | `AdminLogin.tsx` | Post-auth role check, rejects + signs out non-admins |
| Admin protected route | `ProtectedRoute.tsx` | Loading state, redirect to login, access denied screen |
| Admin dashboard | `AdminDashboard.tsx` | Revenue cards, low stock, unfulfilled orders, refresh |
| Account layout | `AccountLayout.tsx` | Desktop sidebar + mobile horizontal scroll tabs |
| Account dropdown | `AccountDropdown.tsx` | Greeting, quick links, sign out |
| Account dashboard | `AccountDashboard.tsx` | Stats, recent order preview, quick actions |
| Account profile | `AccountProfile.tsx` | Name edit, password change (schema cleaned up) |
| Account addresses | `AccountAddresses.tsx` | Full CRUD, default flags, form validation |
| Account favorites | `AccountFavorites.tsx` | Grid with images, remove, quick add to bag |
| Account orders list | `AccountOrders.tsx` | Currency fixed, reorder buttons |
| Account order detail | `AccountOrderDetail.tsx` | Status timeline, shipping address, payment summary |
| Order reorder button | `OrderReorderButton.tsx` | Single item + bulk reorder, haptic feedback, animations |
| Protected account route | `ProtectedAccountRoute.tsx` | Redirects to home with auth modal |
| Profile hook | `useProfile.ts` | Fetch + update with optimistic state |
| Addresses hook | `useAddresses.ts` | CRUD with default flag management |
| Orders hook | `useOrders.ts` | Single-query fetch (N+1 fixed) |
| Favorites hook | `useFavorites.ts` | React Query with optimistic add/remove |
| Size memory hook | `useSizeMemory.ts` | localStorage + database sync, confidence scoring |

---

## Implementation Steps

### Step 1: Fix all remaining Euro symbols across 9 files
Replace every `€` with `$` in the files listed above. This is a direct string replacement with no logic changes.

---

## Technical Notes

- All database tables have proper RLS policies scoped to `auth.uid()` or the `has_role` security function
- The `size_confidence_stats` view has no RLS policies, which is acceptable since it only returns data for the querying user via the `user_id` filter in the hook
- The admin owner protection trigger (`protect_owner_admin`) ensures the owner's admin role can never be permanently deleted
- The 30-minute inactivity timer is handled by the `AdminLayout` component (not audited here as it's outside the account feature scope)

