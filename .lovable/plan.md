

# TEMU-Tier Conversion Audit: Complete Gap Analysis

## Executive Summary

This audit compares the current LINEA e-commerce implementation against TEMU's world-class conversion optimization techniques. The codebase already implements approximately **85-90%** of advanced conversion patterns. This analysis identifies the remaining gaps and prioritizes them by expected conversion lift.

---

## Current Implementation Status

### Already Implemented (World-Class Level)

| Category | Features | Quality |
|----------|----------|---------|
| **Size Memory System** | localStorage + DB sync, confidence scoring, size quiz onboarding, guest-to-auth migration | Excellent |
| **One-Tap Add-to-Cart** | Universal `useQuickAdd` hook, works on PLP, search, favorites, recently viewed, lookbooks | Excellent |
| **Bundle Discount Engine** | `useBundleDiscounts` with lookbook detection, tier-based discounts (10%/15%), missing product suggestions | Excellent |
| **Cart Drawer Optimization** | Free shipping bar with celebrations, smart threshold upsells, save for later, email capture, express checkout | Excellent |
| **Behavioral Tracking** | View count, dwell time, zoom tracking, high-intent prompts | Good |
| **Return Customer Recognition** | Welcome back banner, size reminders, last order reference | Good |
| **Quick Reorder** | One-tap reorder from order history with size preservation | Excellent |
| **Post-Purchase Account Creation** | Guest-to-account conversion with discount incentive | Excellent |
| **Lookbook Swipe Interface** | Tinder-style mobile shopping with running totals | Excellent |
| **Free Shipping Gamification** | Milestone celebrations, haptic feedback, progress messaging | Excellent |
| **Email Typo Detection** | Levenshtein-based detection on all 9 email inputs | Excellent |

---

## Gap Analysis: Remaining TEMU Features

### GAP 1: Real-Time Social Proof (Live Data)

**Current State**: `OrderStatsBadge` displays simulated data ("X orders today", "X viewing now")

**TEMU Pattern**: Real-time, product-specific social proof:
- "47 people bought this in the last 24 hours"
- "12 viewing this product right now"
- "Added to 8 carts in the last hour"

**Technical Implementation**:
- Query `user_behavior_signals` for real aggregate data
- Use Supabase Realtime for live viewer counts
- Add "X bought this today" from `order_items` table

**Expected Lift**: +5-8% conversion on high-traffic products

---

### GAP 2: Waitlist / Restock Notifications

**Current State**: No waitlist functionality exists

**TEMU Pattern**: When size/product is OOS:
- "Notify me when back in stock" button
- Email capture specific to product/size
- Push notification when restocked

**Technical Implementation**:
- Create `restock_notifications` table (user_id, product_id, variant_id, email, notified_at)
- Edge function to send restock emails
- Show waitlist count as social proof ("32 people waiting for this")

**Expected Lift**: +3-5% recovered sales on OOS items

---

### GAP 3: Price Drop Alerts

**Current State**: Sale badges exist but no proactive notifications

**TEMU Pattern**:
- "Track this price" button on non-sale items
- Email when price drops
- Browser push notifications for price drops

**Technical Implementation**:
- Create `price_alerts` table (user_id, product_id, original_price, target_price)
- Trigger on price update or sale activation
- Integrate with abandoned cart recovery

**Expected Lift**: +2-4% conversion on watched items

---

### GAP 4: Flash Sale / Limited-Time Deals

**Current State**: `UrgencyTimer` exists but isn't product-specific

**TEMU Pattern**:
- Product-specific countdown timers
- "Flash Sale ends in 02:34:17" on select items
- Visual urgency indicators (pulsing, color changes)

**Technical Implementation**:
- Add `flash_sale_end` timestamp to products table
- Create `FlashSaleBanner` component for PLP/PDP
- Auto-remove sale when timer expires

**Expected Lift**: +10-15% conversion during flash sale periods

---

### GAP 5: Loyalty Points / Credit System

**Current State**: `RewardsProgress` shows milestone unlocks, but no persistent points

**TEMU Pattern**:
- Earn X coins per purchase
- Spend coins on discounts
- Daily check-in bonuses
- Points expiration urgency

**Technical Implementation**:
- Create `user_loyalty_points` table
- Points earning rules (1 point per €1, bonus for reviews)
- Points redemption in checkout
- Points balance display in header/account

**Expected Lift**: +15-25% repeat purchase rate

---

### GAP 6: Spin Wheel / Scratch Card Gamification

**Current State**: No gamification for discount acquisition

**TEMU Pattern**:
- "Spin to win" for first-time visitors
- Random discount reveals (5-20% off)
- Scratch cards on repeat visits

**Technical Implementation**:
- Create `SpinWheelModal` with weighted outcomes
- Store spin results in `user_spins` table
- Auto-generate discount codes on win
- Limit to 1 spin per session/day

**Expected Lift**: +8-12% first-time conversion, +5% email capture

---

### GAP 7: Coupon / Referral Sharing

**Current State**: Ambassador program exists but no user-to-user sharing

**TEMU Pattern**:
- "Share and earn" referral codes
- Both parties get discount
- Easy share to WhatsApp/SMS/social
- Track referral conversions

**Technical Implementation**:
- Create `referral_codes` table linked to users
- Create `referral_conversions` tracking
- Deep link handling for referral attribution
- Share sheet UI on mobile

**Expected Lift**: +10-20% new customer acquisition cost reduction

---

### GAP 8: Saved Address Auto-Fill in Checkout

**Current State**: Addresses saved in account but not auto-applied at checkout

**TEMU Pattern**:
- "Use saved address" dropdown
- One-click address selection
- Default address auto-populated

**Technical Implementation**:
- Query `addresses` table on checkout load
- Add address selector dropdown
- Auto-populate form fields on selection

**Expected Lift**: +3-5% checkout completion

---

### GAP 9: Cart Quantity Badges on Product Cards

**Current State**: Cart badge shows total count in header only

**TEMU Pattern**:
- If product is in cart, show quantity badge on product card
- "In your bag" indicator
- Quick quantity adjustment from PLP

**Technical Implementation**:
- Check `useCart().items` in ProductCard
- Show quantity badge overlay
- Add +/- controls on hover

**Expected Lift**: +2-3% cart awareness

---

### GAP 10: Recently Bought Together / Frequently Bought Together

**Current State**: "Complete the Look" shows lookbook pairings only

**TEMU Pattern**:
- "Frequently Bought Together" bundle on PDP
- Based on actual order data (collaborative filtering)
- One-click add all with bundle discount preview

**Technical Implementation**:
- Create `product_purchase_pairs` materialized view
- Query co-purchase patterns from order_items
- Show on PDP with combined price

**Expected Lift**: +8-12% average order value

---

## Priority Matrix

| Priority | Gap | Effort | Impact | ROI |
|----------|-----|--------|--------|-----|
| P1 | Saved Address Auto-Fill | Low | Medium | High |
| P1 | Real-Time Social Proof | Medium | High | High |
| P2 | Waitlist/Restock Notifications | Medium | Medium | Medium |
| P2 | Flash Sale Countdown | Low | High | High |
| P2 | Cart Quantity on Product Cards | Low | Low | Medium |
| P3 | Frequently Bought Together | High | High | Medium |
| P3 | Price Drop Alerts | Medium | Medium | Medium |
| P3 | Referral Sharing System | High | High | Medium |
| P4 | Loyalty Points System | High | Very High | Long-term |
| P4 | Spin Wheel Gamification | Medium | Medium | Medium |

---

## Implementation Sprints

### Sprint 1: Quick Wins (1-2 days)
1. Saved address auto-fill in checkout
2. Cart quantity badges on product cards
3. Flash sale countdown component

### Sprint 2: Social Proof & Urgency (3-4 days)
4. Real-time social proof from actual data
5. Waitlist/restock notifications
6. Price drop alerts infrastructure

### Sprint 3: AOV Boosters (4-5 days)
7. Frequently bought together engine
8. Referral sharing system

### Sprint 4: Gamification (5-7 days)
9. Loyalty points system
10. Spin wheel / scratch card

---

## Technical Details for Top Priority Gaps

### Gap 8: Saved Address Auto-Fill

**Database**: Uses existing `addresses` table (already has `is_default_shipping`)

**New Hook**: `src/hooks/useSavedAddresses.ts`
```typescript
interface UseSavedAddressesReturn {
  addresses: Address[];
  defaultAddress: Address | null;
  isLoading: boolean;
  selectAddress: (id: string) => void;
}
```

**Checkout Integration**:
- Add `<Select>` component above shipping form
- On selection, populate all fields via `setShippingAddress`
- Show "Use saved address" only for authenticated users

---

### Gap 1: Real-Time Social Proof

**Database Queries**:
```sql
-- People viewing now (last 5 minutes)
SELECT COUNT(DISTINCT session_id) 
FROM user_behavior_signals 
WHERE product_id = $1 AND last_viewed_at > NOW() - INTERVAL '5 minutes'

-- Bought in last 24 hours
SELECT COUNT(*) FROM order_items 
WHERE product_id = $1 
AND created_at > NOW() - INTERVAL '24 hours'
```

**New Component**: `src/components/product/SocialProofBadge.tsx`
- Shows on PDP below price
- Updates every 30 seconds via polling or Realtime
- Displays: "🔥 47 people viewing • 12 bought today"

---

### Gap 4: Flash Sale Countdown

**Database Change**: Add `flash_sale_ends_at` column to `products` table

**New Component**: `src/components/product/FlashSaleTimer.tsx`
- Accepts `endsAt: Date` prop
- Shows countdown with urgency styling
- Auto-hides when expired
- Pulses when < 1 hour remaining

**Integration Points**:
- ProductCard (badge overlay)
- ProductInfo (prominent display)
- CartDrawer (in line item)

---

## Summary

The codebase is already at an impressive 85-90% TEMU-tier implementation. The remaining gaps focus on:

1. **Real-time data** instead of simulated social proof
2. **Notification systems** for restocks and price drops
3. **Advanced gamification** (loyalty points, spin wheels)
4. **Referral mechanics** for viral growth
5. **Checkout friction reduction** via saved addresses

The P1 items (saved addresses, real social proof, flash sales) can be implemented in 1-2 sprints and will provide the highest immediate ROI. The loyalty points system is a larger investment but offers the highest long-term repeat purchase rate improvement.

