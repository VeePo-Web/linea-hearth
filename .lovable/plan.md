

# Tighten Permissive RLS Policies

## The Problem

13 RLS policies across 8 tables use `USING (true)` or `WITH CHECK (true)` with role `{public}` (meaning everyone -- anon and authenticated). Several of these are labeled "Service can..." but since the Supabase service role key **bypasses RLS entirely**, these policies are redundant for edge functions and **dangerously open** to any browser user.

## Risk Assessment

| Table | Policy | Risk Level | Issue |
|-------|--------|-----------|-------|
| `orders` | Service can insert orders (INSERT true) | **CRITICAL** | Any user can create fake orders |
| `orders` | Service can update orders (UPDATE true) | **CRITICAL** | Any user can change any order status/totals |
| `order_items` | Service can manage order items (ALL true) | **CRITICAL** | Any user can read/write/delete all order line items |
| `discount_code_redemptions` | Service can manage redemptions (ALL true) | **HIGH** | Any user can fabricate redemption records |
| `abandoned_carts` | Service role can update carts (UPDATE true) | **HIGH** | Any user can modify any abandoned cart |
| `abandoned_carts` | Anyone can select by recovery token (SELECT true) | **MEDIUM** | Any user can read ALL abandoned carts (emails, items, totals) |
| `saved_outfits` | Users can view their outfits (SELECT true) | **LOW** | Any user can see all saved outfits |

## Policies That Are Fine (Intentionally Public)

These are correctly permissive and should NOT change:

- `categories` SELECT true -- public catalog data
- `newsletter_subscribers` INSERT true -- public signup
- `ambassador_applications` INSERT true -- public form
- `community_stories` INSERT true -- public submission
- `abandoned_carts` INSERT true -- guest cart sync (no auth required)
- `saved_outfits` INSERT true -- guest outfit saving

## The Fix

**Core principle:** Drop every "Service can..." policy. The service role key (used by edge functions) bypasses RLS automatically -- these policies serve no purpose except to open holes.

### Migration SQL

**Step 1 -- Drop dangerous policies:**

```sql
-- orders
DROP POLICY "Service can insert orders" ON public.orders;
DROP POLICY "Service can update orders" ON public.orders;

-- order_items
DROP POLICY "Service can manage order items" ON public.order_items;

-- discount_code_redemptions
DROP POLICY "Service can manage redemptions" ON public.discount_code_redemptions;

-- abandoned_carts
DROP POLICY "Service role can update carts" ON public.abandoned_carts;
DROP POLICY "Anyone can select by recovery token" ON public.abandoned_carts;
```

**Step 2 -- Replace with scoped policies:**

```sql
-- abandoned_carts: SELECT only your own cart by email match
-- (edge functions use service_role and bypass this)
CREATE POLICY "Admins can view all carts"
ON public.abandoned_carts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- saved_outfits: SELECT scoped to owner or shared
DROP POLICY "Users can view their outfits" ON public.saved_outfits;

CREATE POLICY "Users can view own or shared outfits"
ON public.saved_outfits FOR SELECT
USING (
  user_id = auth.uid()
  OR user_id IS NULL
  OR share_id IS NOT NULL
);

-- discount_code_redemptions: admin-only management
CREATE POLICY "Admins can manage redemptions"
ON public.discount_code_redemptions FOR ALL
USING (has_role(auth.uid(), 'admin'));
```

**Step 3 -- Verify edge functions still work:**

All edge functions (`create-checkout-session`, `stripe-webhook`, `process-abandoned-carts`, `recover-cart`, `sync-abandoned-cart`) use `SUPABASE_SERVICE_ROLE_KEY` to create their Supabase client. The service role key bypasses RLS entirely, so removing these policies has zero impact on edge function behavior.

### What Changes

| Table | Before | After |
|-------|--------|-------|
| `orders` | Anyone can INSERT/UPDATE | Only admins + service role (edge functions) |
| `order_items` | Anyone can do anything | Only admins + service role; users can SELECT own |
| `discount_code_redemptions` | Anyone can do anything | Only admins + service role |
| `abandoned_carts` | Anyone can read all / update all | Admins can read; service role handles updates |
| `saved_outfits` | Anyone can read all | Owner, anonymous (null user_id), or shared only |

### No Code Changes Required

All frontend code accesses these tables through either:
- Edge functions (service role -- unaffected by RLS)
- Authenticated queries that already scope to `user_id = auth.uid()` via existing safe policies

### Verification Steps

After migration, verify:
1. Checkout flow still works (edge function creates order via service role)
2. Stripe webhook still updates orders (service role)
3. Cart recovery still works (edge function reads/updates via service role)
4. Admin orders page still loads (has_role policy)
5. User can still see their own orders (existing "Users can view own orders" policy unchanged)

