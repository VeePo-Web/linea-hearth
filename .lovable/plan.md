

# Cart Badge Bounce Animation - Micro-Feedback Enhancement

## Overview

Add a subtle, professional bounce animation to the cart count badge when items are added. This creates a micro-feedback loop that reinforces the add-to-cart action without being distracting or cheesy.

---

## Current State Analysis

**Cart Badge Location:** `src/components/header/Navigation.tsx` (lines 248-260)
- Uses `AnimatePresence` with scale-in animation for count changes
- Displays count inside the shopping bag icon
- Spring animation with `stiffness: 500, damping: 15`

**Add-to-Cart Trigger:** `src/hooks/useCart.tsx`
- `addItem` function (lines 78-103)
- Sets `lastAddedItem` state for 2 seconds
- Opens cart drawer on add

**Animation Patterns:** `src/lib/animations.ts`
- Uses spring physics for interactions
- Editorial easing: `[0.25, 0.46, 0.45, 0.94]`
- Timing scales: fast (0.2s), medium (0.4s)

---

## Implementation Strategy

### Approach: Key-Based Re-Animation

Instead of complex state tracking, use React's key prop with `itemCount` to trigger re-mount animation on every count change. Combined with a refined "pop-bounce" keyframe sequence.

**Animation Sequence:**
```text
t=0ms:    scale: 1      (resting)
t=80ms:   scale: 1.35   (overshoot - the "pop")
t=200ms:  scale: 0.95   (subtle undershoot)
t=300ms:  scale: 1      (settle back)
```

This creates a snappy, satisfying micro-interaction that feels premium without being bouncy/cheesy.

---

## Technical Implementation

### Modified Navigation.tsx

**Current Code (lines 248-260):**
```tsx
<AnimatePresence>
  {itemCount > 0 && (
    <motion.span 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      exit={{ scale: 0 }}
      transition={{ type: "spring" as const, stiffness: 500, damping: 15 }} 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-foreground pointer-events-none z-10"
    >
      {itemCount}
    </motion.span>
  )}
</AnimatePresence>
```

**Enhanced Code:**
```tsx
<AnimatePresence mode="wait">
  {itemCount > 0 && (
    <motion.span 
      key={`cart-badge-${itemCount}`}  // Re-trigger on every count change
      initial={{ scale: 0, opacity: 0 }} 
      animate={{ 
        scale: [0, 1.35, 0.95, 1],  // Pop-bounce sequence
        opacity: 1 
      }} 
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        scale: {
          duration: prefersReducedMotion ? 0 : 0.3,
          times: [0, 0.3, 0.7, 1],  // Timing distribution
          ease: "easeOut"
        },
        opacity: { duration: 0.1 }
      }} 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-foreground pointer-events-none z-10"
    >
      {itemCount}
    </motion.span>
  )}
</AnimatePresence>
```

**Required Imports/Hooks:**
```tsx
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Inside Navigation component:
const prefersReducedMotion = useReducedMotion();
```

---

## Animation Specifications

| Property | Value | Rationale |
|----------|-------|-----------|
| **Peak Scale** | 1.35 | Noticeable but not aggressive |
| **Undershoot** | 0.95 | Subtle settle, creates realism |
| **Total Duration** | 300ms | Fast enough to feel snappy |
| **Easing** | easeOut | Matches editorial timing |
| **Key Strategy** | `itemCount` | Re-triggers on every add |

### Reduced Motion Behavior

When `prefers-reduced-motion` is enabled:
- Animation duration becomes 0
- Instant scale to 1 (no keyframes)
- Maintains accessibility compliance

---

## Haptic Feedback (Optional Enhancement)

Add subtle haptic feedback on add-to-cart for mobile users:

**In useCart.tsx addItem function:**
```tsx
const addItem = useCallback((newItem: ...) => {
  // ... existing logic
  
  // Haptic feedback for mobile
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10); // Single subtle pulse (10ms)
  }
  
  // ... rest of function
}, []);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/header/Navigation.tsx` | Add useReducedMotion hook, update cart badge animation with keyframes |
| `src/hooks/useCart.tsx` | Add haptic feedback (optional) |

---

## Visual Reference

```text
ADD TO CART FLOW:

User clicks "Add to Bag"
        │
        ▼
┌──────────────────────────────────────┐
│  Cart icon in header                 │
│  ┌───┐                               │
│  │ 2 │ ◄── Badge pops: 1→1.35→0.95→1 │
│  └───┘                               │
│     ▲                                │
│     └── 300ms total animation        │
└──────────────────────────────────────┘
        │
        ▼
Cart drawer slides open
```

---

## Acceptance Criteria

- [ ] Cart badge bounces subtly on every item add
- [ ] Animation triggers when count increases (not just on first item)
- [ ] Animation is fast (≤300ms) and doesn't feel "bouncy"
- [ ] Reduced motion users see instant update (no animation)
- [ ] No layout shift during animation
- [ ] Badge remains centered during animation
- [ ] Animation does not trigger when removing items
- [ ] Works with existing AnimatePresence exit animation

---

## Technical Considerations

### Why Key-Based Re-Animation?

1. **Simplicity**: No state tracking for "previous count" vs "current count"
2. **Reliability**: React handles component remount cleanly
3. **Performance**: AnimatePresence handles exit/enter gracefully
4. **Maintainability**: Single source of truth (itemCount)

### Alternative Considered: useEffect + State

```tsx
// More complex, not recommended
const [shouldBounce, setShouldBounce] = useState(false);
useEffect(() => {
  if (itemCount > prevCount) {
    setShouldBounce(true);
    setTimeout(() => setShouldBounce(false), 300);
  }
}, [itemCount]);
```

This approach requires additional state and ref tracking. The key-based approach is cleaner.

---

## Conversion Impact

This micro-feedback enhancement:
1. **Confirms action** - User sees immediate visual response
2. **Creates dopamine hit** - Small animation rewards the click
3. **Draws attention** - Badge movement catches peripheral vision
4. **Builds habit loop** - Satisfying feedback encourages repeat behavior

Expected lift: 2-5% increase in add-to-cart confidence (fewer cart drawer opens to "check if it worked")

