

# "Just Added" Toast Notification - Premium Micro-Feedback

## Overview

Implement a world-class "Just Added" toast notification that appears when items are added to cart. The design will be:
- **Premium editorial aesthetic** - matching the LINEA brand's high-fashion feel
- **Clean and minimal** - no cheap emojis, icons, or distracting elements
- **Product-focused** - featuring the product thumbnail and name
- **Brief and non-blocking** - appears for ~2.5 seconds, auto-dismisses
- **TEMU-tier functionality** - immediate feedback, haptic support, reduced motion aware

---

## Design Philosophy

**What makes it "TEMU-style" but classy:**
- Instant feedback (≤100ms perceived latency)
- Product thumbnail creates emotional connection
- Minimal text, maximum impact
- Slide-in from bottom (thumb-reachable on mobile)
- Subtle entrance/exit animations (not bouncy or flashy)
- Size confirmation for quick visual verification

**Anti-patterns to avoid:**
- No checkmark emoji (✓)
- No "Added to cart!" exclamation
- No bag/cart icons
- No green success colors
- No confetti or sparkles
- No bouncing animations

---

## Visual Design Specification

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────┐                                           │
│  │         │  Heavenly Crewneck                        │
│  │  [IMG]  │  Size M                                   │
│  │         │                                           │
│  └─────────┘                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

Position: Fixed bottom center, 16px margin
Width: Max 320px on mobile, auto-fit on desktop
Animation: Slide up + fade in, slide down + fade out
Duration: 2.5 seconds display, 0.3s entrance, 0.2s exit
```

**Color scheme:**
- Background: `bg-background` (theme-aware)
- Border: `border-border` (subtle 1px)
- Shadow: Refined drop shadow (`shadow-lg`)
- Text: `text-foreground` for name, `text-muted-foreground` for size

---

## Implementation Architecture

### Approach: Custom Toast Component + Sonner Integration

Rather than modifying the existing Radix toast system, we'll use **Sonner** (already installed) with a custom JSX renderer. This gives us:
1. Full control over the toast content/layout
2. Built-in positioning and stacking
3. Swipe-to-dismiss on mobile
4. Proper accessibility

### Phase 1: Create AddedToCartToast Component

**File:** `src/components/cart/AddedToCartToast.tsx`

A standalone component that renders the toast content with product thumbnail, name, and size.

```typescript
interface AddedToCartToastProps {
  productName: string;
  productImage: string;
  size?: string;
  color?: string;
}
```

**Component features:**
- 48x64px thumbnail (3:4 ratio, matching cart items)
- Product name (1 line, truncated)
- Size badge (subtle, muted)
- Optional color indicator
- Slide-in animation via Framer Motion
- Reduced motion support

### Phase 2: Create showAddedToast Utility

**File:** `src/lib/toastUtils.ts`

A utility function that wraps Sonner's `toast.custom()` with our styled component:

```typescript
export function showAddedToast({
  productName,
  productImage,
  size,
  color,
}: AddedToCartToastProps) {
  toast.custom(
    (t) => (
      <AddedToCartToast
        productName={productName}
        productImage={productImage}
        size={size}
        color={color}
        toastId={t}
      />
    ),
    {
      duration: 2500,
      position: 'bottom-center',
    }
  );
}
```

### Phase 3: Integration Points

**Update `useQuickAdd.ts` (lines 305-311):**

Replace the current generic toast with the new product-focused toast:

```typescript
// Before
if (showToast) {
  toast({
    title: `Added in size ${sizeToUse}`,
    description: product.name,
  });
}

// After
if (showToast) {
  showAddedToast({
    productName: product.name,
    productImage: primaryImage?.image_url || '/placeholder.svg',
    size: sizeToUse,
    color: color,
  });
}
```

**Update `useCart.tsx` (after line 97):**

For direct `addItem` calls that don't go through `useQuickAdd`, optionally trigger the toast:

```typescript
// The addItem function already sets lastAddedItem
// We can use this in a dedicated observer component
```

### Phase 4: Update Sonner Configuration

**Update `src/components/ui/sonner.tsx`:**

Adjust positioning for our custom toast to appear at bottom-center on mobile:

```typescript
<Sonner
  // ... existing props
  position="bottom-center"
  offset={16}
  gap={8}
/>
```

---

## Component Implementation Details

### AddedToCartToast.tsx

```tsx
import { motion } from 'framer-motion';
import { toast as sonnerToast } from 'sonner';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AddedToCartToastProps {
  productName: string;
  productImage: string;
  size?: string;
  color?: string;
  toastId?: string | number;
}

const AddedToCartToast = ({
  productName,
  productImage,
  size,
  color,
  toastId,
}: AddedToCartToastProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: [0.25, 0.46, 0.45, 0.94] // Editorial easing
      }}
      className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-lg max-w-[320px] w-full"
      role="status"
      aria-live="polite"
      onClick={() => toastId && sonnerToast.dismiss(toastId)}
    >
      {/* Product Thumbnail */}
      <div className="w-12 h-16 bg-muted/30 overflow-hidden flex-shrink-0 rounded">
        <img
          src={productImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-foreground truncate">
          {productName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {size && <>Size {size}</>}
          {size && color && <span className="mx-1">·</span>}
          {color && <>{color}</>}
          {!size && !color && <>Added to bag</>}
        </p>
      </div>
    </motion.div>
  );
};

export default AddedToCartToast;
```

### toastUtils.ts

```typescript
import { toast } from 'sonner';
import AddedToCartToast from '@/components/cart/AddedToCartToast';

interface ShowAddedToastOptions {
  productName: string;
  productImage: string;
  size?: string;
  color?: string;
  duration?: number;
}

export function showAddedToast({
  productName,
  productImage,
  size,
  color,
  duration = 2500,
}: ShowAddedToastOptions): string | number {
  return toast.custom(
    (t) => (
      <AddedToCartToast
        productName={productName}
        productImage={productImage}
        size={size}
        color={color}
        toastId={t}
      />
    ),
    {
      duration,
      position: 'bottom-center',
    }
  );
}
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/cart/AddedToCartToast.tsx` | CREATE | Custom toast component with product thumbnail |
| `src/lib/toastUtils.ts` | CREATE | `showAddedToast` utility function |
| `src/hooks/useQuickAdd.ts` | MODIFY | Replace generic toast with `showAddedToast` |
| `src/components/ui/sonner.tsx` | MODIFY | Adjust position to `bottom-center` |

---

## Animation Specification

| Phase | Property | Value | Duration |
|-------|----------|-------|----------|
| **Entrance** | opacity | 0 → 1 | 250ms |
| **Entrance** | y | 20px → 0 | 250ms |
| **Entrance** | scale | 0.95 → 1 | 250ms |
| **Display** | - | Static | 2500ms |
| **Exit** | opacity | 1 → 0 | 200ms |
| **Exit** | y | 0 → 10px | 200ms |
| **Exit** | scale | 1 → 0.98 | 200ms |

**Easing:** Editorial `[0.25, 0.46, 0.45, 0.94]`

**Reduced Motion:** All animations bypass to instant opacity change

---

## Accessibility

- `role="status"` for screen reader announcement
- `aria-live="polite"` for non-interruptive notification
- Tap-to-dismiss for touch users
- Auto-dismiss after 2.5s (no action required)
- Text content is readable and concise

---

## Performance Considerations

1. **Image loading:** Use `loading="eager"` since toast is visible immediately
2. **Animation:** Use GPU-accelerated transforms (translate, scale, opacity)
3. **Bundle size:** Reuses existing Sonner + Framer Motion (no new deps)
4. **Render:** Toast renders outside main app tree via Sonner portal

---

## Conversion Impact

| Mechanism | Expected Effect |
|-----------|-----------------|
| **Immediate feedback** | Confirms action, reduces anxiety |
| **Product image** | Emotional reinforcement of purchase |
| **Size confirmation** | Reduces "did I pick the right size?" doubt |
| **Non-blocking** | Doesn't interrupt shopping flow |
| **Bottom position** | Thumb-reachable, doesn't obscure header |

---

## Acceptance Criteria

- [ ] Toast appears within 100ms of add-to-cart
- [ ] Product thumbnail displays correctly (48x64px)
- [ ] Product name truncates gracefully if too long
- [ ] Size displays when available
- [ ] Color displays when available
- [ ] Auto-dismisses after 2.5 seconds
- [ ] Tap-to-dismiss works on mobile
- [ ] Animation is smooth and editorial
- [ ] Reduced motion users see instant appearance/disappearance
- [ ] Toast stacks correctly if multiple items added quickly
- [ ] No layout shift when toast appears/disappears
- [ ] Matches existing visual design language

