
# Smart Free Shipping Threshold Upsell System - Implementation Plan

## Overview

Build an intelligent product suggestion engine that automatically recommends low-priced items (accessories, hats, stickers) specifically priced to help users reach the €150 free shipping threshold. The system features **one-click add-to-cart** with size memory integration, creating a frictionless path to unlocking free shipping.

---

## TEMU Conversion Psychology

**Why this matters:**
- **Threshold anxiety**: Users hate paying €8 shipping when they're €20 away from free
- **Decision fatigue reduction**: "Here's exactly what you need" vs "browse accessories"
- **One-tap friction physics**: Every tap saved = 3% conversion lift
- **Price anchoring**: A €25 hat to save €8 shipping = perceived €17 gain
- **Gamification completion**: Progress bar goes 100% → dopamine hit

**Expected Impact:**
| Metric | Expected Lift | Mechanism |
|--------|---------------|-----------|
| Free shipping unlock rate | +15-25% | Targeted threshold-gap products |
| Average order value | +€18-30 | Strategic add-on suggestions |
| Cart-to-checkout rate | +5% | Friction elimination via one-tap |

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FREE SHIPPING BAR                           │
│  "You're €23 away from FREE shipping"                          │
│  ████████████████████░░░░░░░░░  85%                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SMART THRESHOLD UPSELL SECTION                    │
│  "Unlock free shipping with one tap"                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [IMG] Dad Hat - €25        [+ Add M] ← One-tap (amber)  │  │
│  │        + Unlocks free shipping!                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ Sticker €5 │  │ Socks €15  │  │ Beanie €20 │  ← Alternatives │
│  │   [+Add]   │  │  [+Add M]  │  │  [+Add M]  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. Database: Threshold Upsell Products Table

Create a dedicated table for tracking products eligible for threshold upsells:

```sql
-- Track which products are good for threshold upsells
CREATE TABLE threshold_upsell_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  priority integer DEFAULT 0,  -- Higher = shown first
  min_threshold_gap numeric,   -- Show when gap is >= this (e.g., €5)
  max_threshold_gap numeric,   -- Show when gap is <= this (e.g., €30)
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_threshold_upsell_active ON threshold_upsell_products (is_active, priority DESC);

-- RLS: Public read, admin write
ALTER TABLE threshold_upsell_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active threshold upsells" ON threshold_upsell_products
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage threshold upsells" ON threshold_upsell_products
FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### 2. New Hook: useThresholdUpsells

```typescript
// src/hooks/useThresholdUpsells.ts

interface ThresholdProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  category_slug: string;
  product_images: Array<{ image_url: string; is_primary: boolean }>;
  product_variants: Array<{ size: string | null; color: string | null; stock_quantity: number }>;
  // Computed
  willUnlockShipping: boolean;      // True if price >= amountToFreeShipping
  gapMatch: 'exact' | 'close' | 'over';  // How well it matches the gap
}

interface UseThresholdUpsellsReturn {
  // Primary recommendation (best match for gap)
  primaryProduct: ThresholdProduct | null;
  
  // Alternative suggestions (2-3 more options)
  alternatives: ThresholdProduct[];
  
  // State
  isLoading: boolean;
  
  // Context
  amountToFreeShipping: number;
  hasFreeShipping: boolean;
}
```

**Logic:**
1. Query products priced between `amountToFreeShipping - 10` and `amountToFreeShipping + 50`
2. Prioritize products that exactly or closely match the gap
3. Exclude products already in cart
4. Sort by: exact match → close match → accessories → hats → lower price variance
5. Limit to 4 products (1 primary + 3 alternatives)

### 3. Enhanced SmartUpsell Component

Upgrade the existing `SmartUpsell.tsx` to become a "Threshold-Aware Upsell Engine":

```text
Current State:
- Uses hardcoded mock products
- Basic price matching logic
- Single product display

Upgraded State:
- Fetches real products from database
- Smart price-gap matching algorithm
- Shows 1 primary + 3 scrollable alternatives
- All use useQuickAdd for one-tap functionality
- Tracks which products actually unlock shipping
```

**Visual Sections:**

**A. Primary Upsell (when close to threshold):**
```
┌─────────────────────────────────────────────────┐
│ "Unlock free shipping with one tap"             │
│ ┌─────┐ Dad Hat                    [+ Add M]    │
│ │ IMG │ €25  • Your size M                      │
│ └─────┘ + Unlocks free shipping!                │
└─────────────────────────────────────────────────┘
```

**B. Alternative Grid (horizontal scroll on mobile):**
```
┌──────────────────────────────────────────────────────────┐
│ Or try these:                                            │
│ ┌────────┐ ┌────────┐ ┌────────┐                        │
│ │ [IMG]  │ │ [IMG]  │ │ [IMG]  │  ← Scroll →            │
│ │Sticker │ │ Socks  │ │ Beanie │                        │
│ │  €5    │ │  €15   │ │  €20   │                        │
│ │ [+Add] │ │[+Add M]│ │[+Add M]│                        │
│ └────────┘ └────────┘ └────────┘                        │
└──────────────────────────────────────────────────────────┘
```

### 4. ThresholdUpsellCard Component

New compact card component optimized for threshold suggestions:

```typescript
// src/components/cart/ThresholdUpsellCard.tsx

interface ThresholdUpsellCardProps {
  product: ThresholdProduct;
  variant: 'primary' | 'compact';  // Primary = full details, compact = grid item
  willUnlockShipping: boolean;
}
```

**Features:**
- Integrates with `useQuickAdd` for one-tap functionality
- Shows remembered size badge (amber color)
- "Unlocks free shipping!" badge when applicable
- Inline size picker if no remembered size
- Success animation (check overlay) on add
- Haptic feedback (10ms) on tap

### 5. Query Logic for Smart Product Selection

```typescript
// Product selection algorithm
function selectThresholdProducts(
  allProducts: Product[],
  cartItems: CartItem[],
  amountToFreeShipping: number
): ThresholdProduct[] {
  const cartIds = new Set(cartItems.map(i => i.id));
  
  // Filter: in stock, not in cart, priced appropriately
  const candidates = allProducts.filter(p => {
    const inCart = cartIds.has(productIdToCartId(p.id));
    const hasStock = p.product_variants?.some(v => v.stock_quantity > 0);
    const priceMatch = p.price >= amountToFreeShipping * 0.5 && 
                       p.price <= amountToFreeShipping + 50;
    return !inCart && hasStock && priceMatch;
  });
  
  // Score and sort
  const scored = candidates.map(p => ({
    ...p,
    willUnlock: p.price >= amountToFreeShipping,
    gapDelta: Math.abs(p.price - amountToFreeShipping),
    // Prioritize accessories for impulse buys
    categoryBonus: ['hats', 'accessories', 'socks', 'stickers'].includes(p.category_slug) ? 10 : 0,
  }));
  
  // Sort: exact matches first, then close, then by category bonus
  scored.sort((a, b) => {
    // Prefer products that unlock shipping
    if (a.willUnlock && !b.willUnlock) return -1;
    if (!a.willUnlock && b.willUnlock) return 1;
    
    // Then by gap closeness
    if (a.gapDelta !== b.gapDelta) return a.gapDelta - b.gapDelta;
    
    // Then by category bonus
    return b.categoryBonus - a.categoryBonus;
  });
  
  return scored.slice(0, 4);
}
```

### 6. Display Conditions

The threshold upsell section appears when:
1. Cart has items (`items.length > 0`)
2. Free shipping NOT yet unlocked (`!hasFreeShipping`)
3. User is "within reach" (`shippingProgress >= 50%` OR `amountToFreeShipping <= 75`)
4. At least one threshold product is available

---

## Component Integration Points

| Component | Changes |
|-----------|---------|
| `src/components/cart/CartDrawer.tsx` | Replace `<SmartUpsell />` with new threshold-aware component |
| `src/components/cart/SmartUpsell.tsx` | Complete rewrite with database query + multi-product grid |
| `src/hooks/useCart.tsx` | Already exports needed values (no changes) |
| `src/hooks/useQuickAdd.ts` | Already works with ProductForQuickAdd (no changes) |

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useThresholdUpsells.ts` | Hook for fetching and scoring threshold products |
| `src/components/cart/ThresholdUpsellCard.tsx` | Compact card with one-tap add functionality |
| Database migration | `threshold_upsell_products` table |

---

## Haptic Feedback Integration

Follows existing patterns:
- **10ms pulse**: One-tap add (matches cart addItem pattern)
- **50ms pulse**: Free shipping unlocked (triggers in FreeShippingBar)

---

## One-Tap Flow

```text
1. User sees "€23 away from free shipping"
2. User sees Dad Hat suggestion: "€25 • Your size M • [+ Add M]"
3. User taps amber "Add M" button
4. Haptic pulse (10ms) → Check animation → Product added
5. Progress bar animates to 100% → Haptic pulse (50ms)
6. Message: "Free shipping unlocked 🎉"
```

---

## Fallback Behavior

| Scenario | Behavior |
|----------|----------|
| No threshold products in DB | Use existing mock products |
| No products match gap | Show closest available product |
| All suggestions in cart | Hide threshold upsell section |
| User already has free shipping | Hide threshold upsell section entirely |

---

## Analytics Events

| Event | Properties | Trigger |
|-------|------------|---------|
| `threshold_upsell_viewed` | `gap_amount`, `products_shown`, `primary_product_id` | Section visible |
| `threshold_upsell_added` | `product_id`, `price`, `gap_before`, `unlocked_shipping` | Product added via threshold section |
| `free_shipping_unlocked_via_upsell` | `product_id`, `total_upsell_value` | Threshold crossed after upsell add |

---

## Files to Modify/Create Summary

### Create:
1. `src/hooks/useThresholdUpsells.ts` - Fetch and score products
2. `src/components/cart/ThresholdUpsellCard.tsx` - Compact product card
3. Database migration for `threshold_upsell_products` table

### Modify:
1. `src/components/cart/SmartUpsell.tsx` - Complete rewrite with new logic
2. `src/components/cart/CartDrawer.tsx` - Update import if component renamed

---

## Phase 2 Enhancements (Future)

1. **Personalized suggestions**: Factor in recently viewed products
2. **A/B test layouts**: Primary + grid vs. carousel
3. **Dynamic pricing display**: Show "Save €8 on shipping!" when product > gap
4. **Re-engagement**: If user removes item and drops below threshold, surface upsell with urgency
