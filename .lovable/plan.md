

# Quick Reorder from Order History

## Overview

Implement a one-tap "Buy Again" feature for order history that allows users to instantly repurchase items from past orders using their saved sizes. This is a high-impact Phase 4 conversion feature targeting a +10-15% repeat purchase rate lift.

---

## Architecture

```text
                         QUICK REORDER FLOW
 ────────────────────────────────────────────────────────────────

 ┌─────────────────────────────────────────────────────────────┐
 │                    AccountOrders.tsx                        │
 │                                                             │
 │   Order #ABC123 • March 15, 2024                            │
 │   ┌─────────────────────────────────────────────────────┐  │
 │   │ [img] Stay Holy Hoodie                              │  │
 │   │       Size L • Carolina Blue                        │  │
 │   │       €79.99                                        │  │
 │   │                          ┌───────────────────────┐  │  │
 │   │                          │ Buy Again (Size L)    │  │  │
 │   │                          └───────────────────────┘  │  │
 │   └─────────────────────────────────────────────────────┘  │
 │                                                             │
 │   ┌─────────────────────────────────────────────────────┐  │
 │   │ [img] Heavenly Crewneck                             │  │
 │   │       Size M • White                                │  │
 │   │       €69.99                                        │  │
 │   │                          ┌───────────────────────┐  │  │
 │   │                          │ Buy Again (Size M)    │  │  │
 │   │                          └───────────────────────┘  │  │
 │   └─────────────────────────────────────────────────────┘  │
 │                                                             │
 │   [ Reorder Entire Order (2 items) ]                        │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘

                              │
                              ▼ On Click

 ┌─────────────────────────────────────────────────────────────┐
 │  1. Uses variant_size from order history (not size memory)  │
 │  2. Triggers addItem() directly to cart                     │
 │  3. Shows success toast with product thumbnail              │
 │  4. Haptic feedback on mobile                               │
 │  5. Cart drawer opens automatically                         │
 └─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### New Component: `src/components/account/OrderReorderButton.tsx`

A reusable button component for reordering individual items or entire orders.

**Props Interface**:
```typescript
interface OrderReorderButtonProps {
  /** Single item to reorder */
  item?: OrderItem;
  /** Array of items (for "Reorder All") */
  items?: OrderItem[];
  /** Button variant */
  variant?: 'item' | 'order';
  /** Size of the button */
  size?: 'sm' | 'default';
}
```

**Component States**:
- `idle` - Default state showing "Buy Again" or "Reorder All"
- `adding` - Loading spinner while adding to cart
- `success` - Animated check icon with color shift

**Key Features**:
1. Uses order history size (not size memory) - the user bought this exact size before
2. Integrates with existing cart context via `useCart()`
3. Shows "Buy Again (Size M)" with the original purchased size
4. Batch add functionality for "Reorder Entire Order"
5. Uses DrawCheckIcon for success animation
6. Triggers haptic feedback via `triggerHapticFeedback()`

---

### Changes to `AccountOrders.tsx`

1. **Import the new component**:
   ```typescript
   import OrderReorderButton from '@/components/account/OrderReorderButton';
   ```

2. **Add per-item Buy Again buttons** in the order items section (around line 90-114)

3. **Add "Reorder Entire Order" button** in the footer section (around line 127-136)

**Integration Points**:
- Each order item thumbnail row gets a `OrderReorderButton` with `variant="item"`
- Order footer gets `OrderReorderButton` with `variant="order"` and all items

---

### Changes to `AccountOrderDetail.tsx`

1. **Add per-item Buy Again buttons** next to each order item (around line 190-220)

2. **Add "Reorder This Order" button** in the order summary section

---

### Conversion Logic

**Single Item Reorder**:
```typescript
const handleReorderItem = (item: OrderItem) => {
  // Use exact size/color from order history
  addItem({
    id: productIdToCartId(item.product_id),
    name: item.product_name,
    price: item.unit_price_cents / 100,
    priceFormatted: formatPrice(item.unit_price_cents / 100),
    image: item.product_image_url || '/placeholder.svg',
    category: 'tops', // Inferred or default
    size: item.variant_size,
    color: item.variant_color,
    quantity: item.quantity,
  });
  
  triggerHapticFeedback();
  showAddedToast({ ... });
  openCart();
};
```

**Batch Reorder**:
```typescript
const handleReorderAll = (items: OrderItem[]) => {
  items.forEach(item => {
    addItem({ ... });
  });
  
  triggerHapticFeedback();
  toast.success(`${items.length} items added to bag!`);
  openCart();
};
```

---

## UI Design (No Layout Changes)

### AccountOrders.tsx - Order Card

**Current** (lines 90-114):
- Shows 4 product thumbnails in a row
- No action buttons

**After**:
- Each thumbnail becomes a mini-card with hover "Buy Again" button
- On mobile: tap to reveal "Buy Again" overlay
- Order footer adds "Reorder All" button

**Visual Treatment**:
```text
┌──────────────────────────────────────────────────────────────┐
│  Order #ABC123 • Delivered                                   │
│  March 15, 2024 • 2 items                                    │
│                                                              │
│  ┌────────┐  ┌────────┐                                      │
│  │ [img]  │  │ [img]  │                                      │
│  │ +Buy   │  │ +Buy   │   ← Hover/tap reveals button         │
│  └────────┘  └────────┘                                      │
│                                                              │
│  Stay Holy Hoodie, Heavenly Crewneck                         │
│                                                              │
│  €149.98                    [ Reorder All (2) ]  View →      │
└──────────────────────────────────────────────────────────────┘
```

### AccountOrderDetail.tsx - Item List

**Current** (lines 190-220):
- Shows product name, size/color, quantity, price
- No action buttons

**After**:
- Each item row gets "Buy Again" button on the right
- Compact button to preserve layout

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/account/OrderReorderButton.tsx` | **NEW** - Reusable reorder button component |
| `src/pages/account/AccountOrders.tsx` | Add OrderReorderButton to each order card |
| `src/pages/account/AccountOrderDetail.tsx` | Add OrderReorderButton to each item row |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Item no longer exists | Show "Unavailable" state, disabled button |
| Size out of stock | Show "Size M sold out" toast, offer alternative |
| Product deleted | Skip silently in batch, show count of successful adds |
| Already in cart | Add to existing quantity (default cart behavior) |
| Guest user | Not applicable - order history requires auth |

---

## Optimistic Update Flow

1. **Immediate**: Button shows spinner + disabled state
2. **Background**: Cart context adds item(s)
3. **Success**: Button shows animated check for 2s
4. **Feedback**: Toast + haptic + cart drawer opens
5. **Reset**: Button returns to "Buy Again" state

---

## Analytics Events

| Event | Properties | When |
|-------|------------|------|
| `order_reorder_item_clicked` | `order_id`, `product_id`, `variant_size` | Single item Buy Again clicked |
| `order_reorder_item_success` | `order_id`, `product_id`, `variant_size` | Item added to cart |
| `order_reorder_all_clicked` | `order_id`, `item_count` | Reorder All clicked |
| `order_reorder_all_success` | `order_id`, `item_count`, `total_value` | All items added |

---

## Technical Implementation Notes

1. **No Database Changes Required**: Uses existing `order_items` table data

2. **No New API Calls**: Reads from already-fetched order data

3. **Reuses Existing Utilities**:
   - `productIdToCartId()` from cartUtils
   - `triggerHapticFeedback()` from cartUtils
   - `formatPrice()` from cartUtils
   - `showAddedToast()` from toastUtils
   - `DrawCheckIcon` for success animation

4. **Cart Context Integration**: Uses `addItem()` and `openCart()` from `useCart()`

5. **Size Priority**:
   - Order history size takes precedence (user already bought this exact size)
   - Falls back to size memory only if order size is null
   - This is intentional: "Buy what you bought before"

---

## Mobile-First Considerations

1. **Touch Targets**: Buttons are 44px minimum height
2. **Thumb Zone**: "Reorder All" positioned in bottom-right of card
3. **Haptic Feedback**: 50ms vibration on add
4. **Reduced Motion**: Respects `prefers-reduced-motion` preference

---

## Expected Conversion Impact

| Metric | Current | Expected |
|--------|---------|----------|
| Repeat purchase rate | ~12% | 18-25% |
| Days between orders | 45 | 30 |
| Items per repeat order | 1.5 | 2.2 |
| Order history page engagement | Low | High |

---

## Dependencies

All dependencies are already in the project:
- `framer-motion` for animations
- `lucide-react` for icons
- `sonner` for toasts
- Existing cart context and utilities

