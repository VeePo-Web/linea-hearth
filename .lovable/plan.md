

# TEMU-Tier Conversion Engineering: Gap Analysis and Next Steps

## Current State Assessment

Based on my analysis of the codebase, here's what's **already implemented** vs **missing**:

### Already Implemented (Strong Foundation)

| Pillar | Feature | Status |
|--------|---------|--------|
| Size Memory | Database sync with `user_size_preferences` | Complete |
| Size Memory | Guest-to-auth migration | Complete |
| Size Memory | Size confidence scoring via `size_confidence_stats` view | Complete |
| Size Memory | Category mapping (tops/bottoms/hats) | Complete |
| Quick Add | Universal `useQuickAdd` hook | Complete |
| Quick Add | Stock-aware with nearest-size fallback | Complete |
| Quick Add | Haptic feedback (50ms vibrate) | Complete |
| Quick Add | Toast notifications with product thumbnail | Complete |
| Bundle Engine | `bundle_discounts` table with rules | Complete |
| Bundle Engine | `useBundleDiscounts` hook with `BundleMatch` | Complete |
| Bundle Engine | `BundleProgress` and `BundleSavingsRow` components | Complete |
| Bundle Engine | `MissingProduct` fetching for smart prompts | Complete |
| Cart Drawer | Email capture for abandoned cart | Complete |
| Cart Drawer | `SmartUpsell` component | Complete |
| Cart Drawer | `SavedForLaterShelf` | Complete |
| Cart Drawer | Bundle progress cards | Complete |
| Free Shipping | Progress bar with milestone celebrations | Complete |
| Free Shipping | Haptic feedback at 50% and 100% | Complete |
| Free Shipping | Color temperature transitions | Complete |
| Threshold Upsells | `threshold_upsell_products` table | Complete |
| Threshold Upsells | `useThresholdUpsells` hook | Complete |
| Favorites | Database-backed with RLS | Complete |
| Checkout | Stripe integration with hosted checkout | Complete |
| Checkout | Discount code validation (server-side) | Complete |
| Checkout | Order modification window (mentioned) | Partial |

---

## Critical Gaps for TEMU-Tier Status

### Gap 1: Express Checkout (Apple Pay / Google Pay)

**Current State:** 
- Only redirects to Stripe hosted checkout
- No inline Apple Pay / Google Pay buttons
- Full form required before payment

**Impact:** High friction on mobile. TEMU and Shein show express payment buttons at cart level.

**Implementation:**
```text
Files to create/modify:
- src/components/checkout/ExpressCheckout.tsx (new)
- src/hooks/useExpressPay.ts (new)
- supabase/functions/create-payment-intent/index.ts (new)
- Install @stripe/react-stripe-js
```

---

### Gap 2: Behavioral Intent Signals Collection

**Current State:**
- `RecentlyViewedContext` tracks last 20 viewed products
- No tracking of high-intent signals (time on page, zoom interactions, repeat views)

**Impact:** Cannot trigger "Ready to buy?" prompts or predictive pre-loading.

**Implementation:**
```text
Database:
- Create `user_behavior_signals` table with:
  - product_id, view_count, total_time_ms, zoom_count, add_remove_count

Hooks:
- src/hooks/useBehaviorTracking.ts (new)
- Attach to ProductDetail.tsx: track time, zoom, scroll depth

UI:
- "You've viewed this 3 times—ready to buy?" prompt
```

---

### Gap 3: Predictive Pre-Loading

**Current State:**
- No pre-fetching of checkout sessions
- No pre-warming of cart API on hover

**Impact:** Perceived latency on high-intent actions.

**Implementation:**
```text
- Create usePreloadCheckout() hook
- On 3+ views of same product: prefetch checkout session in background
- On hover over "Add to Bag": prefetch cart drawer data
- Store prefetch state in React Query cache
```

---

### Gap 4: Size Quiz / Onboarding Flow

**Current State:**
- Size preferences saved per-product interaction
- No first-time visitor onboarding flow

**Impact:** New visitors must add items to learn their sizes.

**Implementation:**
```text
- src/components/size-guide/SizeQuizModal.tsx (new)
- 3-question flow: height, fit preference, primary category
- Populates all size categories at once
- Gamified: "You'll save 12 seconds on future purchases!"
- Trigger: first add-to-cart attempt without saved sizes
```

---

### Gap 5: Return Customer Recognition

**Current State:**
- No personalized greetings
- No "buy again" functionality

**Impact:** Repeat customers treated same as new.

**Implementation:**
```text
- src/hooks/useReturnCustomer.ts (new)
- On auth: fetch last order, greet by name
- "Your last order was M in tops—still your size?"
- Quick reorder from order history
```

---

### Gap 6: Lookbook Swipe Interface (Mobile)

**Current State:**
- Standard scroll-based lookbook
- "Shop The Look" drawer exists

**Impact:** Lower engagement vs swipe-to-shop patterns.

**Implementation:**
```text
- src/components/lookbook/SwipeLookbook.tsx (new)
- Tinder-like: swipe right = add to bag, left = skip
- Running total at bottom
- Uses existing useQuickAdd hook
```

---

### Gap 7: Real-Time Stock Urgency (Live)

**Current State:**
- Stock awareness in `useQuickAdd`
- No "added to X carts today" messaging

**Impact:** Missing social proof urgency.

**Implementation:**
```text
Database:
- Track cart_adds in last 24h per product

UI:
- "Only 2 left—added to 3 carts today"
- Real query, not fake urgency
```

---

## Prioritized Roadmap

### Phase 1: High Impact, Low Risk (This Week)

| Feature | Effort | Impact | Files |
|---------|--------|--------|-------|
| Size Quiz Onboarding | Medium | High | New modal, trigger logic |
| Behavioral Intent Tracking | Medium | High | New hook, PDP integration |
| Return Customer Recognition | Low | Medium | New hook, Header greeting |

### Phase 2: Express Checkout (Week 2)

| Feature | Effort | Impact | Files |
|---------|--------|--------|-------|
| Apple Pay / Google Pay buttons | High | Very High | New Stripe Elements integration |
| Payment intent API | High | Very High | New edge function |
| Cart-level express pay | Medium | High | CartDrawer update |

### Phase 3: Engagement Loops (Week 3)

| Feature | Effort | Impact | Files |
|---------|--------|--------|-------|
| Lookbook swipe interface | Medium | Medium | New component |
| Predictive pre-loading | Medium | Medium | New hook |
| Real-time stock urgency | Medium | Medium | Database + UI |

### Phase 4: Advanced Personalization (Week 4)

| Feature | Effort | Impact | Files |
|---------|--------|--------|-------|
| "You viewed 3x" prompts | Low | Medium | PDP enhancement |
| Quick reorder from history | Medium | Medium | Account orders page |
| Size confidence display | Low | Medium | SizeSelector badge |

---

## Immediate Next Step: Size Quiz Onboarding

The highest-leverage first implementation is the **Size Quiz Onboarding Flow**:

1. **Trigger**: First-time visitor attempts quick-add without saved size
2. **Modal**: 3 questions (height range, fit preference, primary category)
3. **Output**: Populates `tops_size`, `bottoms_size`, `hats_size` in one interaction
4. **Gamification**: "You'll save 12 seconds on future purchases!"
5. **Integration**: `useSizeMemory.rememberSize()` for each category

This reduces future friction across **all** product surfaces instantly.

---

## Technical Notes

### Database Changes Required

```sql
-- Behavioral signals table
CREATE TABLE user_behavior_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- for anonymous tracking
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  view_count INT DEFAULT 1,
  total_time_ms INT DEFAULT 0,
  zoom_count INT DEFAULT 0,
  add_remove_count INT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Users can only see their own signals
ALTER TABLE user_behavior_signals ENABLE ROW LEVEL SECURITY;
```

### New Hooks Architecture

```text
src/hooks/
├── useBehaviorTracking.ts    # Track view time, zooms, scrolls
├── usePreloadCheckout.ts     # Pre-fetch checkout on high intent
├── useReturnCustomer.ts      # Personalized greetings + reorder
├── useExpressPay.ts          # Apple Pay / Google Pay integration
└── useSizeQuiz.ts            # Onboarding flow state management
```

---

## Summary

The current implementation is **70% TEMU-tier**. The foundation (size memory, quick add, bundle engine, free shipping gamification) is solid.

The gaps are primarily in:
1. **Express checkout friction** (no Apple/Google Pay inline)
2. **Behavioral intelligence** (no high-intent signal collection)
3. **Onboarding** (no size quiz for new visitors)
4. **Return customer recognition** (no personalized greetings)

Implementing the **Size Quiz Onboarding** first will have the highest ROI, followed by **Express Checkout** for mobile conversion lift.

