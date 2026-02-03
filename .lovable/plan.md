
# World-Class Mobile Swipe-to-Add Feature for Lookbook Cards

## Executive Summary

This plan adds a **direct swipe-right-to-add-to-cart gesture** on the Lookbook look cards on mobile, eliminating the need to open a separate drawer. When a user swipes right on any look section's image, **the entire outfit (complete look)** is added to their cart with size memory integration, haptic feedback, and beautiful visual confirmation. This creates a Tinder-like shopping experience that's intuitive, fast, and delightful.

---

## Feature Architecture

```text
LookSection (Mobile Only Enhancement)
├── Swipeable Image Container
│   ├── Horizontal swipe gesture detection
│   ├── Visual drag feedback (rotation, opacity indicators)
│   ├── Direction indicators ("Add Look" / "Skip")
│   ├── Haptic feedback at threshold
│   └── Spring-back on incomplete swipe
├── Success Overlay (on add)
│   ├── Animated checkmark (DrawCheckIcon)
│   ├── "Look Added" confirmation
│   ├── Bundle discount badge (if applicable)
│   └── Auto-dismiss after 2s
├── Size Selection (if needed)
│   ├── Bottom sheet with sizes
│   └── Size memory for future swipes
└── Visual Affordance
    ├── Swipe hint indicator on first visit
    └── Subtle pulsing edge glow
```

---

## Component Design

### New Component: `SwipeableLookCard.tsx`

A wrapper component that adds horizontal swipe gesture handling to the LookSection image side on mobile.

**Key Features:**
1. **Framer Motion Pan Gestures** — Uses `onPan`, `onPanEnd` for silky-smooth 60fps swipe detection
2. **Elastic Drag Feel** — `dragElastic: 0.7` for natural resistance
3. **Rotation Transform** — Subtle rotation (±8°) on drag for card-like feel
4. **Direction Indicators** — "Add Look" and "Skip" badges appear based on swipe direction
5. **Threshold Detection** — Commits at 30% screen width or velocity > 400px/s
6. **Haptic Feedback** — Pulse at 50% threshold, strong pulse on commit

**Physics Constants:**
```typescript
const SWIPE_THRESHOLD = Math.min(window.innerWidth * 0.3, 120);
const THROW_VELOCITY = 400;
const MAX_ROTATION = 8;
const DRAG_ELASTIC = 0.7;
```

---

### Integration with Size Memory

The swipe action integrates with the existing `useQuickAdd` hook for size memory:

1. **If user has saved size preference** → Instant add with remembered size
2. **If no size preference** → Show compact size picker overlay
3. **After size selection** → Save to size memory for future swipes

---

### Visual Feedback Hierarchy

**During Drag:**
- Card rotates ±8° based on drag direction
- "Add Look" badge fades in (right swipe) — green background
- "Skip" badge fades in (left swipe) — subtle gray
- Edge glow intensifies toward commit threshold

**At 50% Threshold:**
- Haptic pulse (10ms vibration)
- Badge fully visible
- Slight scale increase (1.02)

**On Commit (Right Swipe = Add):**
1. Strong haptic (50ms)
2. Card flies off-screen to right (400px, 15° rotation)
3. Success overlay fades in:
   - Animated checkmark (DrawCheckIcon)
   - "Look Added to Bag"
   - Item count + total value
   - Bundle discount badge if applicable
4. Auto-dismiss after 1.8s OR tap to dismiss

**On Commit (Left Swipe = Skip):**
- Light haptic (5ms)
- Card returns to center with subtle bounce
- No visual change (skip is just "not now")

---

## UI/UX Details

### Swipe Hint (First-Time User)

On first lookbook visit (checked via localStorage), show a subtle animated hint:

```tsx
<motion.div 
  className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/60"
  animate={{ x: [0, 20, 0] }}
  transition={{ repeat: 3, duration: 1.5 }}
>
  <span className="text-sm">Swipe right to add look</span>
  <ShoppingBag className="w-4 h-4" />
</motion.div>
```

Hidden after first swipe or tap, stored in `localStorage.setItem('lookbook-swipe-hint-shown', 'true')`.

---

### Success Overlay Design

```text
┌─────────────────────────────────┐
│                                 │
│     ✓ (animated checkmark)      │
│                                 │
│       LOOK ADDED                │
│                                 │
│   4 items • $268 CAD            │
│                                 │
│   ┌─────────────────────┐       │
│   │ 🎉 15% Bundle Saved │       │
│   └─────────────────────┘       │
│                                 │
│   [View Bag]  [Keep Browsing]   │
│                                 │
└─────────────────────────────────┘
```

Colors:
- Background: `bg-green-600/95` with `backdrop-blur-md`
- Checkmark: White, animated draw
- Text: White
- Bundle badge: `bg-amber-500/20 text-amber-400`

---

### Size Picker (When Needed)

If the user hasn't saved a size preference, show a compact bottom-anchored picker:

```text
┌─────────────────────────────────┐
│                                 │
│  Select your size for all items │
│                                 │
│  [XS] [S] [M*] [L] [XL] [2XL]  │
│                                 │
│  * Your saved size              │
│                                 │
│     [Apply to Look]             │
│                                 │
└─────────────────────────────────┘
```

- Single size applies to all items in look (simplified UX)
- Size is saved to memory for future swipes
- Positioned at bottom of card with `pb-safe` for iOS

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/lookbook/SwipeableLookCard.tsx` | Main swipeable wrapper component |
| `src/hooks/useLookSwipe.ts` | Hook managing swipe state, cart integration, size memory |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/lookbook/LookSection.tsx` | Wrap image side with SwipeableLookCard on mobile |
| `src/hooks/useSwipeSession.ts` | Add `addEntireLook()` function for batch cart add |

---

### Hook: `useLookSwipe.ts`

```typescript
interface UseLookSwipeReturn {
  // State
  isAdding: boolean;
  showSuccess: boolean;
  showSizePicker: boolean;
  
  // Size memory
  rememberedSize: string | null;
  hasRememberedSize: boolean;
  
  // Actions
  handleSwipeComplete: (direction: 'left' | 'right') => void;
  handleSizeSelect: (size: string) => void;
  dismissSuccess: () => void;
  
  // Cart info
  itemsAdded: number;
  totalValue: number;
  bundleDiscountPercent: number;
}
```

**Cart Addition Logic:**
```typescript
const handleSwipeComplete = (direction: 'left' | 'right') => {
  if (direction === 'left') return; // Skip = no action
  
  if (!rememberedSize) {
    setShowSizePicker(true);
    return;
  }
  
  // Add all products in look to cart
  products.forEach(product => {
    addItem({
      id: productIdToCartId(product.id),
      name: product.name,
      price: getPrice(product),
      image: getPrimaryImage(product),
      size: rememberedSize,
      lookId: look.id,
      lookName: look.name,
    });
  });
  
  // Haptic celebration
  triggerHapticFeedback();
  setShowSuccess(true);
  
  // Auto-dismiss after 1.8s
  setTimeout(() => setShowSuccess(false), 1800);
};
```

---

### SwipeableLookCard Component

```tsx
<motion.div
  className="relative w-full h-full touch-none"
  style={{ x, rotate }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.7}
  onDrag={handleDrag}
  onDragEnd={handleDragEnd}
>
  {/* Original Image Content */}
  {children}
  
  {/* Direction Indicators */}
  <motion.div style={{ opacity: addOpacity }} className="...">
    <ShoppingBag /> Add Look
  </motion.div>
  
  <motion.div style={{ opacity: skipOpacity }} className="...">
    Skip
  </motion.div>
  
  {/* Success Overlay */}
  <AnimatePresence>
    {showSuccess && <LookAddedOverlay ... />}
  </AnimatePresence>
  
  {/* Size Picker */}
  <AnimatePresence>
    {showSizePicker && <LookSizePicker ... />}
  </AnimatePresence>
  
  {/* First-time hint */}
  {showHint && <SwipeHint />}
</motion.div>
```

---

## Accessibility

1. **Screen Reader Alternative** — "Add Complete Look" button remains visible as non-swipe fallback
2. **Reduced Motion** — Disable rotation/spring animations when `prefers-reduced-motion` is set
3. **Keyboard** — Arrow keys work: Right = add, Left = skip (when card is focused)
4. **Touch Target** — Entire image area is swipeable (generous 50%+ of screen)

---

## Performance Considerations

1. **GPU Acceleration** — Use `will-change: transform` on swipeable element
2. **Layout Containment** — Prevent overlay animations from triggering reflow
3. **Lazy Haptics** — Check `navigator.vibrate` once on mount
4. **Debounced Success** — Prevent double-add with `isAdding` guard

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| All items already in cart | Show "Already in Bag" instead of success |
| Partial items in cart | Add remaining items only, show "X more added" |
| Out of stock product | Skip that item, add others, show "3 of 4 added" |
| Network error | Show toast error, items remain in local state for retry |
| Quick successive swipes | Debounce with 300ms cooldown |

---

## Mobile-Only Activation

This feature is **mobile-only** (< 768px). On desktop:
- Swipe gestures are disabled
- Hover interactions remain
- "Shop the Look" section is primary interaction

Detection via existing `useIsMobile()` hook.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Swipe FPS | 60fps consistent |
| Add-to-cart latency | < 100ms perceived |
| Haptic timing | 50% threshold = 10ms, commit = 50ms |
| Success overlay duration | 1.8s |
| First-swipe hint visibility | 3 oscillations over 4.5s |

---

## Files Summary

**New Files:**
- `src/components/lookbook/SwipeableLookCard.tsx`
- `src/hooks/useLookSwipe.ts`

**Modified Files:**
- `src/components/lookbook/LookSection.tsx` — Wrap image in SwipeableLookCard on mobile
- `src/components/lookbook/ShopTheLook.tsx` — Add "in cart" state awareness for partial adds

---

## Implementation Priority

1. **Phase 1: Core Swipe Gesture** — SwipeableLookCard with drag physics
2. **Phase 2: Cart Integration** — useLookSwipe hook with batch add
3. **Phase 3: Visual Feedback** — Direction indicators, success overlay
4. **Phase 4: Size Memory** — Integration with existing size memory system
5. **Phase 5: Polish** — Haptics, hints, edge cases

---

## Non-Goals (Preserved)

- Desktop layout remains unchanged
- Existing "Swipe to Shop" drawer continues to work
- Individual product quick-add buttons still functional
- No changes to lookbook navigation or scroll behavior
