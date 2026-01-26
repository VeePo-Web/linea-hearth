
# Save For Later Implementation Plan

## Overview

Build a world-class "Save For Later" shelf that transforms cart removal from a dead-end into a conversion opportunity. When users remove items from their cart, instead of permanently deleting them, we intercept and offer a "Save for Later" option that:

- Keeps items visible and one-tap accessible
- Syncs with the favorites system for persistence
- Creates urgency messaging ("X items waiting")
- Enables instant move-back-to-cart with remembered sizes

---

## Architecture Decision

### Leveraging Existing Favorites Infrastructure

Rather than creating a new table, we'll extend the existing `favorites` system with a `saved_from_cart` flag. This approach:

1. **Reuses existing RLS policies** - no new security surface
2. **Reuses existing React Query setup** - optimistic updates, caching
3. **Natural fallback** - if user isn't logged in, favorites prompt auth anyway
4. **Single source of truth** - no sync conflicts between saved items and favorites

### Database Enhancement

```sql
-- Add column to track items saved from cart
ALTER TABLE public.favorites 
ADD COLUMN saved_from_cart BOOLEAN DEFAULT false;

-- Add index for efficient querying
CREATE INDEX idx_favorites_saved_from_cart 
ON public.favorites(user_id, saved_from_cart) 
WHERE saved_from_cart = true;
```

### For Guest Users (localStorage)

Guest users will have a separate localStorage shelf that:
- Persists across sessions
- Migrates to favorites on auth (like size memory)
- Syncs variant preferences (size, color selected at removal time)

---

## Technical Implementation

### Phase 1: Create useSavedForLater Hook

**File:** `src/hooks/useSavedForLater.ts`

**Data Structure:**
```typescript
interface SavedItem {
  id: string;                    // Product ID (UUID)
  savedAt: string;               // ISO timestamp
  savedSize?: string;            // Size when removed from cart
  savedColor?: string;           // Color when removed from cart
  savedQuantity: number;         // Quantity when removed
  product?: {                    // Product details (fetched)
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    image_url: string;
    category_slug?: string;
  };
}

interface UseSavedForLaterReturn {
  // State
  savedItems: SavedItem[];
  savedCount: number;
  isLoading: boolean;
  
  // Actions
  saveForLater: (cartItem: CartItem) => Promise<void>;
  removeFromSaved: (productId: string) => Promise<void>;
  moveToCart: (productId: string) => void;
  moveAllToCart: () => void;
  clearSaved: () => void;
  
  // UI Helpers
  isSaved: (productId: string) => boolean;
  waitingMessage: string | null;  // "3 items waiting for you"
}
```

**Core Logic:**
```text
┌─────────────────────────────────────────────────────────┐
│               SAVE FOR LATER FLOW                       │
├─────────────────────────────────────────────────────────┤
│ 1. User clicks "Remove" on cart item                    │
│ 2. Show confirmation with two options:                  │
│    ├─ "Remove" → hard delete                           │
│    └─ "Save for Later" → trigger saveForLater()        │
│                                                         │
│ 3. On saveForLater():                                   │
│    a. Remove from cart (immediate)                      │
│    b. If authenticated:                                 │
│       - Add to favorites with saved_from_cart = true   │
│       - Store size/color in separate JSON column       │
│    c. If guest:                                         │
│       - Save to localStorage 'linea-saved-for-later'   │
│    d. Trigger haptic + success animation               │
│    e. Update savedCount (for badge)                    │
└─────────────────────────────────────────────────────────┘
```

### Phase 2: Modify Cart Item Removal UX

**File:** `src/components/cart/CartItem.tsx`

**Current:** Clicking X immediately removes item

**Enhanced:**
- Show slide-in confirmation panel instead of immediate deletion
- Two buttons: "Remove" (destructive) and "Save for Later" (primary)
- Swipe-left gesture support on mobile → reveals save option
- Auto-collapse after 3s if no action

**Micro-interaction:**
```
┌────────────────────────────────────────┐
│ [Item sliding left...]                 │
│                                        │
│ ┌──────────────┐ ┌──────────────────┐  │
│ │   Remove     │ │  Save for Later  │  │
│ │   (gray)     │ │    (primary)     │  │
│ └──────────────┘ └──────────────────┘  │
└────────────────────────────────────────┘
```

### Phase 3: Saved For Later Shelf in Cart Drawer

**File:** `src/components/cart/SavedForLaterShelf.tsx`

**Position:** Below cart items, above upsells

**UI Structure:**
```
┌─────────────────────────────────────────┐
│ 💾 SAVED FOR LATER                      │
│ 3 items waiting for you                 │
├─────────────────────────────────────────┤
│ [img] Product Name            €49.00    │
│       Size M saved             [Add] ↩  │
├─────────────────────────────────────────┤
│ [img] Another Product         €65.00    │
│       Size L saved             [Add] ↩  │
├─────────────────────────────────────────┤
│            [Add All to Bag]             │
└─────────────────────────────────────────┘
```

**Features:**
- Collapsible by default if cart has 3+ items
- Expand on tap to show saved items
- One-tap "Add" uses saved size (remembered at removal time)
- "Add All to Bag" button at bottom
- Remove option via swipe or X button
- Items link to PDP on tap

### Phase 4: Badge Integration

**Files:** `src/components/header/Header.tsx`, `src/components/cart/CartDrawer.tsx`

**Changes:**
- Add secondary badge on cart icon showing saved count
- Format: `🛒 3 + 2` (cart items + saved items)
- Or: small heart-dot indicator next to main badge

### Phase 5: Conversion Messaging

**Waiting Message Logic:**
```typescript
const getWaitingMessage = (count: number): string | null => {
  if (count === 0) return null;
  if (count === 1) return "1 item waiting for you";
  if (count <= 3) return `${count} items waiting for you`;
  return `${count} items are waiting—ready to complete your look?`;
};
```

**Urgency Triggers:**
- If saved item goes low stock: "⚡ Heavenly Crewneck is almost sold out!"
- If price drops: "🏷️ Price dropped on 2 saved items"
- Time-based: "Still thinking about the Stay Holy Hoodie?" (after 24h)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSavedForLater.ts` | Core state management hook |
| `src/components/cart/SavedForLaterShelf.tsx` | Saved items display in cart drawer |
| `src/components/cart/SavedItem.tsx` | Individual saved item row |
| `src/components/cart/CartItemActions.tsx` | Remove/Save confirmation overlay |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/cart/CartItem.tsx` | Add save-for-later confirmation flow |
| `src/components/cart/CartDrawer.tsx` | Integrate SavedForLaterShelf component |
| `src/hooks/useFavorites.ts` | Add `saved_from_cart` handling |
| `src/hooks/useCart.tsx` | Add `saveForLater` action |
| `src/components/header/Header.tsx` | Add saved badge indicator |

## Database Migration

```sql
-- Add saved_from_cart flag and cart context
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS saved_from_cart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cart_context JSONB DEFAULT '{}'::jsonb;

-- Index for fast saved-from-cart queries
CREATE INDEX IF NOT EXISTS idx_favorites_saved_from_cart 
ON public.favorites(user_id) 
WHERE saved_from_cart = true;

-- Update comment for documentation
COMMENT ON COLUMN public.favorites.saved_from_cart IS 'True if item was saved from cart removal flow';
COMMENT ON COLUMN public.favorites.cart_context IS 'Stores size, color, quantity from cart at save time';
```

---

## Guest User Experience

**localStorage Schema:**
```typescript
interface LocalStorageSavedItem {
  productId: string;
  savedAt: string;
  size?: string;
  color?: string;
  quantity: number;
  // Cached product data (for offline display)
  productName: string;
  productImage: string;
  productPrice: number;
  productSlug: string;
}

// Storage key: 'linea-saved-for-later'
```

**Migration on Auth:**
When user logs in, the hook will:
1. Read localStorage saved items
2. Upsert to favorites table with `saved_from_cart = true`
3. Clear localStorage
4. Show toast: "Saved items synced to your account"

---

## Optimistic Update Flow

**Save For Later:**
```
1. IMMEDIATE: Remove from cart state
2. IMMEDIATE: Add to savedItems state
3. IMMEDIATE: Trigger haptic + animation
4. BACKGROUND: Upsert to favorites table
5. ON ERROR: Rollback → add back to cart, remove from saved
```

**Move Back to Cart:**
```
1. IMMEDIATE: Add to cart state with saved size/color
2. IMMEDIATE: Remove from savedItems
3. IMMEDIATE: Success animation + haptic
4. BACKGROUND: Update favorites (saved_from_cart = false)
5. ON ERROR: Rollback → remove from cart, add back to saved
```

---

## Animation Specifications

**Save Animation:**
- Item slides left (200ms ease-out)
- "Saved!" text fades in with check icon
- Item shrinks and moves to saved section (300ms spring)
- Saved count badge bounces

**Move to Cart Animation:**
- Item expands slightly (100ms)
- Slides right toward cart area (200ms)
- Fades out
- Cart count badge bounces
- New cart item appears with "Just added" highlight

**Reduced Motion:**
- All animations become instant opacity transitions
- Use `useReducedMotion` hook consistently

---

## Analytics Events

| Event | Properties | Trigger |
|-------|------------|---------|
| `cart_item_saved` | product_id, size, color, quantity | User saves item |
| `saved_item_moved_to_cart` | product_id, size, time_saved | User moves back |
| `saved_item_removed` | product_id, time_saved | User hard-deletes |
| `saved_items_view` | count | Shelf expands |
| `saved_add_all` | count, total_value | "Add All" clicked |

---

## Acceptance Criteria

- [ ] Removing cart item shows save option (not immediate delete)
- [ ] Saved items persist in localStorage for guests
- [ ] Saved items sync to favorites for authenticated users
- [ ] Size/color preserved from cart removal
- [ ] One-tap move back to cart with preserved variant
- [ ] "X items waiting" messaging in cart drawer
- [ ] Saved count badge on cart icon (or indicator)
- [ ] Guest-to-auth migration works seamlessly
- [ ] Animations respect reduce-motion preference
- [ ] Works offline with localStorage fallback
- [ ] No visual layout changes (design locked)

---

## Performance Considerations

- SavedForLaterShelf lazy-loads only when cart drawer opens
- Product images use `loading="lazy"`
- Saved items count badge uses local state (no fetch on render)
- React Query caching for favorites prevents re-fetches
- localStorage reads are memoized

---

## Edge Cases Handled

1. **Product no longer exists** → Show "Item unavailable" with remove option
2. **Saved size is now OOS** → Show warning, offer size picker on move
3. **Price changed since save** → Show strikethrough original with new price
4. **Max saved items (20)** → Auto-remove oldest when limit reached
5. **Network offline** → All operations work via localStorage, sync later
