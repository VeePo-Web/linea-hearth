

# Lookbook Swipe Interface - Mobile-First Tinder-Style Shopping

## Overview

Build a world-class, mobile-optimized swipe-to-shop interface that transforms the lookbook experience into a gamified, friction-free shopping session. Users swipe right to add products to their bag, left to skip, with running totals, haptic feedback, and satisfying micro-animations throughout.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SwipeLookbook.tsx                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    SwipeCard Stack (framer-motion)                      ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │                      Current Product Card                           │││
│  │  │  ┌───────────────────────────────────────────────────────────────┐  │││
│  │  │  │  Product Image (full-bleed)                                   │  │││
│  │  │  │  ┌─────────────┐                           ┌─────────────┐   │  │││
│  │  │  │  │ Position    │                           │ Low Stock   │   │  │││
│  │  │  │  │ Badge (TOP) │                           │ Indicator   │   │  │││
│  │  │  │  └─────────────┘                           └─────────────┘   │  │││
│  │  │  │                                                               │  │││
│  │  │  │                    ← SKIP │ ADD →                             │  │││
│  │  │  │              (visual swipe direction hints)                   │  │││
│  │  │  │                                                               │  │││
│  │  │  └───────────────────────────────────────────────────────────────┘  │││
│  │  │  ┌───────────────────────────────────────────────────────────────┐  │││
│  │  │  │  Product Name + Price                    Size: M (remembered) │  │││
│  │  │  └───────────────────────────────────────────────────────────────┘  │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                         ││
│  │  ┌────────── Swipe Direction Indicators ──────────┐                    ││
│  │  │    ✕ SKIP    ←  [swipe zone]  →    ✓ ADD      │                    ││
│  │  └────────────────────────────────────────────────┘                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      Running Total Bar (sticky)                         ││
│  │  ┌───────────────────────────────────────────────────────────────────┐  ││
│  │  │  3 items • €180                          [View Bag →]             │  ││
│  │  │  ████████████████░░░░░░░░ €30 to free shipping                   │  ││
│  │  └───────────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         Action Buttons (a11y)                           ││
│  │              [← Skip]              [Add →]                              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. New Files to Create

| File | Purpose |
|------|---------|
| `src/components/lookbook/SwipeLookbook.tsx` | Main swipe interface container |
| `src/components/lookbook/SwipeCard.tsx` | Individual draggable product card |
| `src/components/lookbook/SwipeActions.tsx` | Skip/Add button controls |
| `src/components/lookbook/SwipeProgress.tsx` | Running total bar with progress |
| `src/hooks/useSwipeSession.ts` | Session state management |

### 2. Core State Management: `useSwipeSession`

```typescript
interface SwipeSessionState {
  // Current look context
  lookId: string;
  lookName: string;
  products: LookProduct[];
  
  // Swipe state
  currentIndex: number;
  addedProducts: LookProduct[];
  skippedProducts: LookProduct[];
  
  // Session progress
  totalValue: number;
  itemCount: number;
  isComplete: boolean;
  
  // Actions
  handleSwipeRight: (product: LookProduct) => void;
  handleSwipeLeft: (product: LookProduct) => void;
  undoLastSwipe: () => void;
  reset: () => void;
}
```

**Key behaviors:**
- Integrates with existing `useQuickAdd` for size memory
- Syncs with `useCart` for cart operations
- Triggers haptic feedback on swipe completion
- Auto-shows size picker if no remembered size

### 3. SwipeCard Component (Framer Motion Drag)

```typescript
// Gesture physics configuration
const dragConstraints = {
  left: -window.innerWidth * 0.6,
  right: window.innerWidth * 0.6,
  top: 0,
  bottom: 0,
};

const swipeThreshold = window.innerWidth * 0.25; // 25% of screen = commit
const throwVelocity = 500; // px/s to auto-commit swipe

// Card stack transforms
const cardVariants = {
  current: { scale: 1, y: 0, opacity: 1 },
  upcoming: { scale: 0.92, y: 24, opacity: 0.6 },
  hidden: { scale: 0.85, y: 48, opacity: 0 },
  exitLeft: { x: -400, rotate: -15, opacity: 0 },
  exitRight: { x: 400, rotate: 15, opacity: 0 },
};
```

**Swipe mechanics:**
- Full-bleed product images with position badges (TOP, BOTTOM, etc.)
- Real-time rotation/tilt as user drags
- Direction indicators appear during drag
- Velocity-aware "throw" detection
- Spring-back if below threshold
- Stacked card preview (next 2 cards visible behind)

### 4. Visual Feedback System

**During drag:**
- Card tilts up to ±15° based on x-offset
- Background shifts: left = red tint, right = green tint
- "SKIP" / "ADD" labels fade in at edges
- Haptic pulse at 50% threshold (soft warning)

**On commit:**
- Card flies out with physics-based animation
- Strong haptic pulse (50ms vibrate)
- Success: green flash + check icon overlay
- Skip: fade out with subtle X

**Reduced motion mode:**
- Instant transitions, no physics
- Button-only navigation (no swipe required)

### 5. Running Total Bar (Sticky)

```typescript
interface SwipeProgressProps {
  addedCount: number;
  totalValue: number;
  freeShippingThreshold: number;
  onViewBag: () => void;
}
```

**Features:**
- Always visible at bottom of viewport
- Shows: "X items • €XXX"
- Free shipping progress bar
- Pulses when item added
- "View Bag" CTA opens cart drawer
- Bundle discount preview if eligible

### 6. Entry Point Integration

**Option A: Dedicated route** `/lookbook/swipe/:lookId`
- Full-screen immersive experience
- Link from LookSection "Swipe to Shop" button

**Option B: Bottom sheet from existing lookbook**
- Trigger from mobile ShopTheLook component
- Drawer opens as swipe interface

**Recommended: Option B** - keeps user in lookbook context, reduces navigation friction.

### 7. Mobile UX Optimizations

| Aspect | Implementation |
|--------|----------------|
| Touch targets | Minimum 48x48px for all buttons |
| Thumb zone | All primary actions in bottom 60% |
| Swipe sensitivity | 25% of screen width to commit |
| Velocity detection | >500px/s auto-commits swipe |
| Undo support | "Undo" toast for 3s after each swipe |
| Safe area | Respect `env(safe-area-inset-*)` on iOS |
| Scroll lock | Prevent body scroll during swipe session |
| Touch-action | `pan-y` only on card, allow vertical scroll elsewhere |

### 8. Accessibility Requirements

```tsx
// SwipeCard.tsx accessibility
<motion.div
  role="button"
  tabIndex={0}
  aria-label={`${product.name}, ${formatPrice(product.price)}. 
    Swipe right or press Enter to add to bag. 
    Swipe left or press Escape to skip.`}
  aria-describedby={`swipe-instructions-${product.id}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight') handleAddToBag();
    if (e.key === 'Escape' || e.key === 'ArrowLeft') handleSkip();
  }}
>
```

- Full keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader announcements for swipe actions
- High contrast mode support
- Reduce-motion fallback to button-only mode

---

## Integration Points

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Lookbook.tsx` | Conditional render SwipeLookbook on mobile |
| `src/components/lookbook/LookSection.tsx` | Add "Swipe to Shop" CTA for mobile |
| `src/components/lookbook/ShopTheLook.tsx` | Add trigger for swipe mode |

### Hook Dependencies

```typescript
// useSwipeSession.ts imports
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useCart } from '@/hooks/useCart';
import { useSizeMemory } from '@/hooks/useSizeMemory';
import { useBundleDiscounts } from '@/hooks/useBundleDiscounts';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { triggerHapticFeedback } from '@/lib/cartUtils';
```

---

## Session Flow

```text
1. User enters swipe mode (taps "Swipe to Shop" on mobile)
   ↓
2. Full-screen swipe interface opens (bottom sheet)
   ↓
3. First product card displayed with stacked preview behind
   ↓
4. User swipes right → useQuickAdd.handleQuickAdd() called
   │  ├─ If remembered size exists → instant add + haptic
   │  └─ If no size → inline picker appears on card
   ↓
5. Card animates out, next card springs forward
   ↓
6. Running total updates with pulse animation
   ↓
7. Repeat until all products swiped
   ↓
8. "All Done!" completion screen with:
   ├─ Summary: "4 items added • €240"
   ├─ Bundle discount: "10% off complete look!"
   ├─ CTA: "View Bag" or "Continue Browsing"
   └─ Share: "Share Your Picks"
```

---

## Micro-Interactions Detail

### Card Drag Physics

```typescript
const dragConfig = {
  drag: 'x',
  dragConstraints: { left: 0, right: 0 },
  dragElastic: 0.9,
  onDrag: (event, info) => {
    // Real-time rotation
    const rotation = info.offset.x / 15;
    // Direction indicator opacity
    const addOpacity = Math.min(1, info.offset.x / 100);
    const skipOpacity = Math.min(1, -info.offset.x / 100);
  },
  onDragEnd: (event, info) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Commit swipe if:
    // - Dragged past threshold (25% of viewport)
    // - OR velocity exceeds throw threshold
    if (offset > swipeThreshold || velocity > throwVelocity) {
      handleSwipeRight();
    } else if (offset < -swipeThreshold || velocity < -throwVelocity) {
      handleSwipeLeft();
    } else {
      // Spring back to center
      animateSpringBack();
    }
  },
};
```

### Haptic Feedback Pattern

| Event | Haptic | Duration |
|-------|--------|----------|
| Swipe past 50% threshold | Soft pulse | 10ms |
| Swipe committed (add) | Strong pulse | 50ms |
| Swipe committed (skip) | None | - |
| Undo triggered | Double tap | 10ms + 10ms |
| Session complete | Celebration | 50ms + 30ms + 50ms |

### Success Animation

```typescript
const successVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 25 }
  },
  exit: { 
    scale: 1.2, 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};
```

---

## Performance Considerations

1. **Image optimization**: Preload next 2 cards in stack
2. **Animation**: GPU-accelerated transforms only (`transform`, `opacity`)
3. **No layout thrashing**: Use `motion.div` with fixed dimensions
4. **Event throttling**: Throttle drag callbacks to 60fps
5. **Memory**: Unmount swiped cards after animation

---

## Analytics Events

| Event | Properties |
|-------|------------|
| `swipe_session_start` | `look_id`, `product_count` |
| `swipe_right` | `product_id`, `size`, `value`, `index` |
| `swipe_left` | `product_id`, `index` |
| `swipe_undo` | `product_id`, `action` |
| `swipe_session_complete` | `added_count`, `skipped_count`, `total_value`, `duration_ms` |

---

## Deliverables Summary

### New Files (5)
1. `src/components/lookbook/SwipeLookbook.tsx` - Container component
2. `src/components/lookbook/SwipeCard.tsx` - Draggable card with gesture handling
3. `src/components/lookbook/SwipeActions.tsx` - Skip/Add buttons (a11y)
4. `src/components/lookbook/SwipeProgress.tsx` - Running total bar
5. `src/hooks/useSwipeSession.ts` - Session state management

### Modified Files (2)
1. `src/pages/Lookbook.tsx` - Add mobile swipe mode toggle
2. `src/components/lookbook/ShopTheLook.tsx` - Add "Swipe to Shop" trigger

### Dependencies
- All existing: `framer-motion`, `lucide-react`, `vaul` (drawer)
- No new packages required

---

## Acceptance Criteria

- Swipe right adds product to cart with remembered size (or shows picker)
- Swipe left skips product with no action
- Running total updates in real-time with pulse animation
- Haptic feedback on all swipe commits (mobile)
- Full keyboard navigation for accessibility
- Reduced motion mode uses buttons instead of swipe
- Session completes with summary and bag CTA
- Bundle discount preview visible when applicable
- Performance: <16ms frame time during swipe animations

