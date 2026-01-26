
# Save For Later - World-Class Implementation Plan

## Overview

Transform cart removal from a conversion dead-end into a retention opportunity. When users attempt to remove items, we intercept with a "Save for Later" option that:

- **Preserves intent** - Items move to a shelf instead of being deleted
- **Syncs with favorites** - For authenticated users, uses the existing favorites infrastructure  
- **Works offline** - Guest users get localStorage persistence
- **Enables one-tap recovery** - Saved size/color for instant move-back-to-cart

---

## Architecture Decision: Dual-Layer Approach

### For Authenticated Users
Extend the existing `favorites` table with two new columns:
- `saved_from_cart` (boolean) - Flags items originating from cart removal
- `cart_context` (JSONB) - Stores `{ size, color, quantity }` at removal time

**Benefits:**
- Reuses existing RLS policies
- Reuses React Query setup with optimistic updates
- Single source of truth (no sync conflicts)

### For Guest Users
LocalStorage-based shelf at `linea-saved-for-later` that:
- Persists across sessions
- Migrates to favorites on authentication
- Stores full product data for offline display

---

## Implementation Phases

### Phase 1: Database Schema Extension

**SQL Migration:**
```sql
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS saved_from_cart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cart_context JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_favorites_saved_from_cart 
ON public.favorites(user_id) 
WHERE saved_from_cart = true;
```

### Phase 2: Core Hook - useSavedForLater

**New File:** `src/hooks/useSavedForLater.ts`

**Interface:**
```typescript
interface SavedItem {
  id: string;              // Product ID
  productId: string;       // For cart matching
  savedAt: string;         // ISO timestamp
  savedSize?: string;      // Size at removal
  savedColor?: string;     // Color at removal
  savedQuantity: number;   // Quantity at removal
  product: {               // Product details
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
  moveToCart: (item: SavedItem) => void;
  moveAllToCart: () => void;
  
  // UI Helpers
  isSaved: (productId: string) => boolean;
  waitingMessage: string | null;
}
```

**Core Logic:**
1. **Guest users**: Read/write to localStorage `linea-saved-for-later`
2. **Authenticated users**: Query favorites where `saved_from_cart = true`
3. **On auth change**: Migrate localStorage items to favorites table
4. **On save**: Remove from cart immediately, add to saved state, sync to storage

### Phase 3: Cart Item Enhancement

**Modified File:** `src/components/cart/CartItem.tsx`

**Changes:**
- Replace immediate removal with confirmation overlay
- Two action buttons: "Remove" (destructive) and "Save for Later" (primary)
- Slide animation when confirming action
- Auto-collapse after 3 seconds if no action taken

**Flow:**
```text
User taps X → Show overlay with options
├─ "Remove" → Hard delete from cart
└─ "Save for Later" → Move to saved shelf + success feedback
```

### Phase 4: Saved For Later Shelf Component

**New File:** `src/components/cart/SavedForLaterShelf.tsx`

**Position in CartDrawer:** Below cart items, above SmartUpsell

**Features:**
- Collapsible header showing count: "Saved for Later (3)"
- Waiting message: "3 items waiting for you"
- Individual saved items with:
  - Product thumbnail
  - Name + saved size/color
  - Price
  - "Add to Bag" button (uses saved variant)
  - Remove option (X button)
- "Add All to Bag" button at bottom

**New File:** `src/components/cart/SavedItem.tsx`

Compact row component for individual saved items.

### Phase 5: CartDrawer Integration

**Modified File:** `src/components/cart/CartDrawer.tsx`

**Changes:**
- Import and render `SavedForLaterShelf` after cart items
- Pass `onViewFavorites` for deep-link when appropriate
- Saved count badge integration

### Phase 6: Header Badge Update

**Modified File:** `src/components/header/Header.tsx`

**Enhancement:**
- Show secondary indicator when saved items exist
- Format: Main badge for cart count, subtle dot/indicator for saved items
- Optional: "3 + 2 saved" tooltip on hover

---

## State Flow Diagrams

### Save For Later Flow
```text
┌─────────────────────────────────────────────────────────┐
│                  SAVE FOR LATER                         │
├─────────────────────────────────────────────────────────┤
│ 1. User taps "Save for Later"                           │
│ 2. IMMEDIATE: Remove from cart state                    │
│ 3. IMMEDIATE: Add to savedItems (optimistic)            │
│ 4. IMMEDIATE: Haptic feedback + animation               │
│ 5. BACKGROUND:                                          │
│    ├─ Guest: Save to localStorage                       │
│    └─ Auth: Upsert to favorites with saved_from_cart    │
│ 6. ON ERROR: Rollback (add back to cart)                │
└─────────────────────────────────────────────────────────┘
```

### Move Back to Cart Flow
```text
┌─────────────────────────────────────────────────────────┐
│                  MOVE TO CART                           │
├─────────────────────────────────────────────────────────┤
│ 1. User taps "Add to Bag" on saved item                 │
│ 2. IMMEDIATE: Add to cart with saved size/color         │
│ 3. IMMEDIATE: Remove from savedItems                    │
│ 4. IMMEDIATE: Success animation                         │
│ 5. BACKGROUND:                                          │
│    ├─ Guest: Remove from localStorage                   │
│    └─ Auth: Delete from favorites OR clear flag         │
│ 6. ON ERROR: Rollback                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useSavedForLater.ts` | Core state management hook |
| `src/components/cart/SavedForLaterShelf.tsx` | Saved items section in drawer |
| `src/components/cart/SavedItem.tsx` | Individual saved item row |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/cart/CartItem.tsx` | Add removal confirmation overlay with save option |
| `src/components/cart/CartDrawer.tsx` | Integrate SavedForLaterShelf component |
| `src/hooks/useCart.tsx` | Add optional `saveForLater` action passthrough |
| `src/hooks/useFavorites.ts` | Handle `saved_from_cart` and `cart_context` columns |

---

## Conversion Messaging

**Waiting Message Logic:**
```typescript
const getWaitingMessage = (count: number): string | null => {
  if (count === 0) return null;
  if (count === 1) return "1 item waiting for you";
  if (count <= 3) return `${count} items waiting for you`;
  return `${count} items waiting—complete your collection?`;
};
```

---

## Animation Specifications

**Save Animation (200ms):**
- Item slides left with fade
- "Saved!" confirmation appears briefly
- Item shrinks and flows to saved section

**Move to Cart Animation (200ms):**
- Item expands slightly
- Slides toward cart area
- Cart badge bounces

**Reduced Motion:**
- All animations become instant opacity transitions
- Uses existing `useReducedMotion` hook

---

## Guest-to-Auth Migration

When user authenticates:
1. Read `linea-saved-for-later` from localStorage
2. For each item, upsert to favorites with `saved_from_cart = true`
3. Clear localStorage
4. Show toast: "Saved items synced to your account"

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Product deleted | Show "Item unavailable" with remove option |
| Saved size OOS | Show warning, offer to pick new size on move |
| Price changed | Show original (strikethrough) + new price |
| Max saved (20) | Auto-remove oldest when limit reached |
| Offline | All operations work via localStorage |

---

## Acceptance Criteria

- [ ] Removing cart item shows save confirmation (not immediate delete)
- [ ] Saved items persist in localStorage for guests
- [ ] Saved items sync to favorites for authenticated users
- [ ] Size/color preserved from cart at removal time
- [ ] One-tap "Add to Bag" uses preserved variant
- [ ] "X items waiting" messaging in cart drawer
- [ ] Guest-to-auth migration works seamlessly
- [ ] Animations respect reduce-motion preference
- [ ] Works offline with localStorage fallback
- [ ] No visual layout changes (design locked)

---

## Technical Notes

- Uses existing React Query caching from useFavorites
- Optimistic updates for <100ms perceived latency
- Product images use `loading="lazy"`
- Hook memoizes localStorage reads
- SavedForLaterShelf lazy-loads when drawer opens
