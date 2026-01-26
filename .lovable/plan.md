

# Post-Purchase Account Creation Prompt

## Overview

Implement a high-conversion guest-to-account flow on the CheckoutSuccess page. This feature captures the 95% of guest checkout users who never return because they have no account relationship with the brand.

---

## Architecture

```
                      POST-PURCHASE ACCOUNT CREATION FLOW
 ─────────────────────────────────────────────────────────────────────
 
 ┌──────────────────────────────────────────────────────────────────┐
 │                    CheckoutSuccess Page                          │
 │                                                                  │
 │   [Order Confirmation]                                           │
 │   Order #ABC123 - Thank you for your purchase!                   │
 │                                                                  │
 │   ┌──────────────────────────────────────────────────────────┐  │
 │   │           PostPurchaseSignup Component                   │  │
 │   │  ┌────────────────────────────────────────────────────┐  │  │
 │   │  │  🎁 Save your info for next time                   │  │  │
 │   │  │                                                    │  │  │
 │   │  │  Create an account to:                             │  │  │
 │   │  │  ✓ Track this order in real-time                   │  │  │
 │   │  │  ✓ Checkout faster next time (sizes saved)         │  │  │
 │   │  │  ✓ Get 10% off your next order                     │  │  │
 │   │  │                                                    │  │  │
 │   │  │  Email: john@gmail.com (from order)                │  │  │
 │   │  │  Password: [________________]                      │  │  │
 │   │  │                                                    │  │  │
 │   │  │  [ Create Account & Get 10% Off ]                  │  │  │
 │   │  │                                                    │  │  │
 │   │  │  Skip for now                                      │  │  │
 │   │  └────────────────────────────────────────────────────┘  │  │
 │   └──────────────────────────────────────────────────────────┘  │
 │                                                                  │
 └──────────────────────────────────────────────────────────────────┘
 
                              │
                              ▼ On Success
 
 ┌──────────────────────────────────────────────────────────────────┐
 │  1. Create auth.user with email + password                       │
 │  2. Link order.user_id to new auth.user.id                       │
 │  3. Migrate size preferences from localStorage                   │
 │  4. Create "WELCOME10" discount for next order                   │
 │  5. Show success state with confetti                             │
 └──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### New File: `src/components/checkout/PostPurchaseSignup.tsx`

This component will:
1. Accept order email, first name, and order ID as props
2. Pre-fill the email (read-only - already captured)
3. Only require password input (friction minimization)
4. Include email typo detection for password confirmation
5. Show compelling value propositions (10% off, track order, saved sizes)
6. Handle signup via `useAuth().signUp`
7. On success, link the order to the new account
8. Migrate localStorage preferences (sizes, cart context)

**Props Interface**:
```typescript
interface PostPurchaseSignupProps {
  orderEmail: string;
  orderFirstName: string | null;
  orderId: string;
  onSuccess: () => void;
  onSkip: () => void;
}
```

**Component States**:
- `idle` - Initial state, showing form
- `loading` - Signup in progress
- `success` - Account created successfully
- `error` - Signup failed (email already registered, etc.)

### Key UI Elements

1. **Value Stack (Above Form)**:
   - "Track this order in real-time" (immediate value)
   - "Checkout faster next time (sizes saved)" (future convenience)
   - "Get 10% off your next order" (incentive)

2. **Pre-filled Email (Read-only)**:
   - Shows email from order with lock icon
   - "This is the email we'll use for your account"

3. **Password Field Only**:
   - Single field signup - minimum friction
   - "Create a password to secure your account"
   - Show/hide toggle
   - 6+ character requirement indicator

4. **CTA Button**:
   - Primary: "Create Account & Get 10% Off"
   - Full-width, prominent styling
   - Loading state with spinner

5. **Skip Option**:
   - Subtle link: "No thanks, continue as guest"
   - Track skip analytics for optimization

---

## Changes to CheckoutSuccess.tsx

1. **Import `useAuth` hook** to check if user is already authenticated
2. **Add state for signup flow**:
   - `showSignup` - whether to show the prompt
   - `signupCompleted` - track if user created account
3. **Conditional rendering**:
   - Only show `PostPurchaseSignup` if `!user` (guest checkout)
   - Hide after successful signup or skip
4. **Position**: Between "Email Confirmation" and "Order Items" sections

---

## Order-to-Account Linking

After successful signup, we need to link the order to the new user:

```typescript
// After signUp succeeds, link order to new user
const linkOrderToUser = async (orderId: string, userId: string) => {
  await supabase
    .from('orders')
    .update({ user_id: userId })
    .eq('id', orderId);
};
```

This is safe because:
- The `orders` table already has a nullable `user_id` column
- Guest orders have `user_id = null`
- RLS policies should allow updating own order (by session email match)

---

## Preference Migration

On successful signup, migrate localStorage preferences:

```typescript
const migratePreferences = async (userId: string) => {
  // Migrate size memory
  const sizePrefs = localStorage.getItem('linea-size-preferences');
  if (sizePrefs) {
    await supabase
      .from('user_size_preferences')
      .upsert({ user_id: userId, preferences: JSON.parse(sizePrefs) });
  }
  
  // Migrate recently viewed
  const recentlyViewed = localStorage.getItem('linea-recently-viewed');
  if (recentlyViewed) {
    await supabase
      .from('user_behavior_signals')
      .insert({ user_id: userId, recently_viewed: JSON.parse(recentlyViewed) });
  }
};
```

---

## Welcome Discount Code

Create a personal discount code for the new user:

```typescript
const createWelcomeDiscount = async (email: string) => {
  const code = `WELCOME10-${Date.now().toString(36).toUpperCase()}`;
  
  await supabase
    .from('discount_codes')
    .insert({
      code,
      name: 'Welcome 10% Off',
      discount_type: 'percentage',
      discount_value: 10,
      per_user_limit: 1,
      usage_limit: 1,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });
    
  return code;
};
```

Show the code prominently after signup: "Your code: WELCOME10-XYZ123 (10% off your next order)"

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/checkout/PostPurchaseSignup.tsx` | **NEW** - Post-purchase account creation component |
| `src/pages/CheckoutSuccess.tsx` | Add `useAuth` check, render `PostPurchaseSignup` for guests |

---

## Analytics Events

| Event | Properties | When |
|-------|------------|------|
| `post_purchase_signup_shown` | `order_id` | Component renders |
| `post_purchase_signup_started` | `order_id` | User focuses password field |
| `post_purchase_signup_completed` | `order_id`, `user_id` | Account created |
| `post_purchase_signup_skipped` | `order_id` | User clicks "No thanks" |
| `post_purchase_signup_error` | `order_id`, `error_type` | Signup fails |

---

## Success State UI

After account creation, transform the signup box into a success confirmation:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ Account Created!                                                 │
│                                                                     │
│  Welcome to LINEA, John!                                            │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Your 10% discount code:                                      │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  WELCOME10-XYZ123                              [Copy]   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  Valid for 30 days • One-time use                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ✓ Your sizes have been saved                                       │
│  ✓ This order is now linked to your account                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Conversion Psychology

1. **Reciprocity**: "You just bought from us, we'll give you 10% off"
2. **Sunk Cost**: "Don't lose your order tracking - create an account"
3. **Immediate Gratification**: Discount code visible immediately
4. **Social Proof**: "Join X,XXX members" (future enhancement)
5. **Loss Aversion**: "Track this order" implies they'll lose visibility otherwise

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Email already registered | Show "Already have an account? Sign in" option |
| User is already authenticated | Don't show PostPurchaseSignup at all |
| Signup fails | Show error, allow retry |
| User closes page before finishing | Order stays as guest order (no loss) |
| User signs in later with same email | Manual order linking (future enhancement) |

---

## Expected Conversion Impact

| Metric | Current | Expected |
|--------|---------|----------|
| Guest-to-account rate | ~5% | 15-25% |
| Repeat purchase rate | ~8% | 12-18% |
| Next-order conversion (with code) | 0% | 35-45% |
| Email list growth | - | +15% active subscribers |

---

## Implementation Priority

This is a **Sprint 1 Quick Win** with:
- Low complexity (one new component, minor page changes)
- High impact (direct conversion lift)
- No database schema changes required
- No new edge functions needed

