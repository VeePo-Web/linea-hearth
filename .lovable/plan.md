

# Haptic Feedback for "View Cart" Button - Implementation Plan

## Overview

Add a tactile vibration when the "View Cart" button is tapped in the AddedToCartToast component, providing immediate physical confirmation that the action was registered.

---

## TEMU Conversion Psychology

**Why haptic on button tap matters:**
- **Action confirmation loop**: User taps → feels vibration → knows action registered before cart opens
- **Reduces "did I tap it?" anxiety**: Physical feedback eliminates doubt
- **Creates premium native app feel**: Matches iOS/Android shopping apps (TEMU, Shein, Amazon)
- **Differentiated from toast appearance haptic**: Toast shows (10ms) → user taps View Cart (different 10ms) → distinct tactile signatures

**Pulse Duration Selection:**
The toast appearance already uses 10ms. For the View Cart tap:
- **Recommended: 10ms** — consistent with existing button tap patterns
- Short enough to feel responsive, not jarring
- Matches the "navigate to cart" action weight

---

## Current State Analysis

The `handleViewCart` function currently:
1. Stops event propagation
2. Dismisses the toast
3. Calls `onViewCart()` to open the cart drawer

```typescript
const handleViewCart = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (toastId) sonnerToast.dismiss(toastId);
  onViewCart?.();
};
```

---

## Implementation

### File: `src/components/cart/AddedToCartToast.tsx`

**Changes:**
Add haptic feedback to the `handleViewCart` function, respecting reduced motion preferences.

**Updated function:**
```typescript
const handleViewCart = (e: React.MouseEvent) => {
  e.stopPropagation();
  
  // Haptic feedback on button tap (mobile)
  if (!prefersReducedMotion && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
  
  if (toastId) sonnerToast.dismiss(toastId);
  onViewCart?.();
};
```

---

## Technical Considerations

### Why Separate from Toast Appearance Haptic?

The toast has two distinct user moments:
1. **Toast appears** → 10ms haptic confirms "item added"
2. **User taps View Cart** → 10ms haptic confirms "navigating to cart"

These are ~500ms+ apart in user experience, so they create distinct tactile checkpoints, not a confusing double-buzz.

### Reduced Motion Handling

We already have `prefersReducedMotion` from the `useReducedMotion()` hook. The same check applies to the button tap haptic — users who prefer reduced motion likely prefer reduced haptic feedback too.

### Browser Compatibility

- `'vibrate' in navigator` check handles unsupported browsers gracefully
- Works on Android Chrome, Firefox Mobile
- iOS Safari does NOT support `navigator.vibrate` (no-op, no error)
- Desktop browsers will simply skip the vibration

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/cart/AddedToCartToast.tsx` | Add haptic trigger inside `handleViewCart` function |

---

## Acceptance Criteria

- [ ] View Cart button triggers 10ms haptic pulse on tap (mobile)
- [ ] No haptic if `prefers-reduced-motion` is enabled
- [ ] No JavaScript errors on devices without `navigator.vibrate`
- [ ] Haptic fires before toast dismissal (user feels tap confirmation)
- [ ] Works on Android Chrome and Firefox Mobile
- [ ] Gracefully no-ops on iOS Safari (no errors)

---

## Code Diff Preview

```diff
  const handleViewCart = (e: React.MouseEvent) => {
    e.stopPropagation();
+   
+   // Haptic feedback on button tap (mobile)
+   if (!prefersReducedMotion && 'vibrate' in navigator) {
+     navigator.vibrate(10);
+   }
+   
    if (toastId) sonnerToast.dismiss(toastId);
    onViewCart?.();
  };
```

