

# UI/UX Stress Test -- Bug Report and Fix Plan

## Critical Findings

### BUG 1: Mobile Nav -- Background Scroll Not Locked
**Component:** `MobileMenu.tsx`
**Severity:** High
**Issue:** The MobileMenu does NOT set `document.body.style.overflow = 'hidden'` when open. The FullScreenNav does (line 115), the CartDrawer does (line 139), but MobileMenu has zero scroll lock. This means on mobile, when the hamburger menu slide-out is open, the user can scroll the page behind it -- the exact bug reported.
**Fix:** Add a `useEffect` that sets `document.body.style.overflow = 'hidden'` when `isOpen` is true, and cleans up on close (identical to FullScreenNav lines 113-127).

---

### BUG 2: MobileMenu Missing Escape Key Handler
**Component:** `MobileMenu.tsx`
**Severity:** Medium
**Issue:** FullScreenNav has keyboard escape handling (line 133). CartDrawer has it (line 134). AuthModal relies on Radix. But MobileMenu has zero keyboard handling -- pressing Escape does nothing when the slide-out is open. This is both a UX gap and an accessibility violation.
**Fix:** Add `useEffect` with `keydown` listener for Escape, calling `onClose()`.

---

### BUG 3: FavoritesDrawer Missing Body Scroll Lock
**Component:** `FavoritesDrawer.tsx`
**Severity:** High
**Issue:** Same as MobileMenu -- no `document.body.style.overflow = 'hidden'` when open. Background content is scrollable behind the drawer.
**Fix:** Add the same scroll-lock `useEffect` pattern used by CartDrawer.

---

### BUG 4: FavoritesDrawer Missing Escape Key Handler
**Component:** `FavoritesDrawer.tsx`
**Severity:** Medium
**Issue:** No keyboard escape handling. User must click the X button or backdrop to close.
**Fix:** Add `keydown` listener for Escape.

---

### BUG 5: AuthModal Missing Body Scroll Lock
**Component:** `AuthModal.tsx`
**Severity:** High
**Issue:** Same pattern -- no scroll lock. Background scrolls when the auth panel is open.
**Fix:** Add scroll-lock `useEffect`.

---

### BUG 6: AuthModal Missing Escape Key Handler
**Component:** `AuthModal.tsx`
**Severity:** Medium
**Issue:** No keyboard escape handling.
**Fix:** Add `keydown` listener for Escape.

---

### BUG 7: SearchOverlay (Mobile) Missing Body Scroll Lock
**Component:** `SearchOverlay.tsx`
**Severity:** Medium
**Issue:** The mobile full-screen search overlay does not lock body scroll. Since it covers the full screen visually, the impact is lower, but on iOS elastic scroll can pull the background content into view behind the overlay.
**Fix:** Add scroll-lock `useEffect` when `isOpen`.

---

### BUG 8: Multiple Overlays Can Stack Without Cleanup
**Component:** `Navigation.tsx`
**Severity:** Medium
**Issue:** It is possible to have the cart drawer open, then trigger the favorites drawer (via the "View Favorites" button inside CartDrawer), resulting in two overlays stacked. While the cart closes first via `closeCart()`, the timing with `setTimeout` can cause brief flash states. Similarly, opening auth from mobile menu uses `setTimeout(onAuthOpen, 300)` which can race.
**Fix:** Add mutual exclusion logic in Navigation.tsx -- when any overlay opens, close all others first synchronously (not via setTimeout). Consider a single `activeOverlay` state enum instead of multiple booleans.

---

### BUG 9: MobileStickyATC and MobileStickyBar Z-Index Collision
**Component:** `MobileStickyATC.tsx` (z-50), `MobileStickyBar.tsx` (z-40)
**Severity:** Low
**Issue:** On the homepage, `MobileStickyBar` appears at z-40. On PDP, `MobileStickyATC` appears at z-50. If a user navigates from homepage to PDP quickly, both can briefly render during page transition. The z-index difference prevents visual overlap, but the safe-area-bottom padding is only applied to MobileStickyBar (via `safe-area-bottom` class) and NOT to MobileStickyATC. On iPhones with home indicators, the MobileStickyATC "Add to Bag" button can overlap the home bar.
**Fix:** Add `pb-[env(safe-area-inset-bottom)]` to MobileStickyATC's container.

---

### BUG 10: CartDrawer "Proceed to Checkout" Uses `asChild` with `onClick`
**Component:** `CartDrawer.tsx` (line 462-471)
**Severity:** Low
**Issue:** The `Button` component uses `asChild` to render as a `Link`, but also has `onClick={closeCart}`. With Radix Slot (`asChild`), the `onClick` is on the `Button` wrapper, not the `Link`. This can cause the cart to close but navigation to not fire on some mobile browsers where the event propagation differs.
**Fix:** Move `onClick={closeCart}` to the `Link` component directly, or remove `asChild` and use `useNavigate` instead.

---

### BUG 11: MegaMenu Image Label Hover Animation
**Component:** `MegaMenu.tsx` (line 206-210)
**Severity:** Low (cosmetic)
**Issue:** The image label uses `whileHover` on a `motion.div` inside a `Link`, but the parent already has a `whileHover` for image scale. The label `initial={{ opacity: 0, y: 10 }}` means it starts invisible and only appears on hover -- but the `whileHover` is on the label div itself, not the parent Link. The label never becomes visible because the label div is too small to hover over when it starts at opacity 0.
**Fix:** Move the label visibility logic to the parent Link's hover state using a CSS `group-hover` pattern (which is already partially there via `group-hover:opacity-100` on the gradient).

---

## Implementation Summary

| File | Fixes | Lines Changed |
|------|-------|---------------|
| `MobileMenu.tsx` | Add scroll lock + escape handler | ~15 lines |
| `FavoritesDrawer.tsx` | Add scroll lock + escape handler | ~15 lines |
| `AuthModal.tsx` | Add scroll lock + escape handler | ~15 lines |
| `SearchOverlay.tsx` | Add scroll lock | ~8 lines |
| `MobileStickyATC.tsx` | Add safe-area-bottom padding | ~2 lines |
| `CartDrawer.tsx` | Fix asChild onClick propagation | ~3 lines |
| `MegaMenu.tsx` | Fix label hover visibility | ~5 lines |
| `Navigation.tsx` | Consolidate overlay state management | ~20 lines |

### Priority Order
1. **MobileMenu scroll lock** (the exact reported bug)
2. **FavoritesDrawer scroll lock**
3. **AuthModal scroll lock**
4. **Escape key handlers** (MobileMenu, FavoritesDrawer, AuthModal)
5. **SearchOverlay scroll lock**
6. **MobileStickyATC safe area**
7. **CartDrawer onClick propagation**
8. **MegaMenu label hover**
9. **Navigation overlay state consolidation**

### Implementation Pattern (Reusable)
Each scroll-lock + escape fix follows this exact pattern:
```typescript
useEffect(() => {
  if (!isOpen) return;
  document.body.style.overflow = 'hidden';
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen, onClose]);
```

