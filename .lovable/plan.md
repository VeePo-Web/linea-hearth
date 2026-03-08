

# Performance & Polish Audit: Cart, Bag, Add-to-Cart, and Cheap Detail Removal

## Issues Found

### 1. Cart Drawer Uses Bouncy Spring Animation (Cheap Feel)
**File:** `src/components/cart/CartDrawer.tsx` (lines 33-51)
The drawer slide-in/out uses `spring` with `stiffness: 300, damping: 30`. This creates a bouncy, app-like feel that contradicts the editorial tween standard established for the header. The cart is the most critical conversion surface -- it must feel premium.

**Fix:** Replace both `drawerVariants` spring transitions with editorial tween:
```
transition: {
  type: "tween",
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94]
}
```

### 2. Mobile Sticky ATC Uses Spring (Inconsistent)
**File:** `src/components/product/MobileStickyATC.tsx` (lines 91-95)
The mobile sticky add-to-cart bar slides in with `spring, stiffness: 400, damping: 30`. This bounces on mobile -- feels cheap on a high-intent surface.

**Fix:** Replace with editorial tween matching the header standard.

### 3. Empty Cart State Spring Animation
**File:** `src/components/cart/CartDrawer.tsx` (line 216)
The empty bag icon uses `spring, stiffness: 300, damping: 20` for a scale-in effect. This bounces a shopping bag icon -- a small detail that undermines the premium tone.

**Fix:** Replace with a simple tween fade-in.

### 4. MobileStickyBar Gradient Fade Looks Cheap
**File:** `src/components/homepage/MobileStickyBar.tsx` (line 49)
`h-6 bg-gradient-to-t from-stone-900 to-transparent` creates a visible dark gradient above the sticky bar. This looks like a cheap overlay effect rather than a clean editorial transition.

**Fix:** Remove the gradient div entirely. The `backdrop-blur-sm` + solid background on the bar itself is sufficient.

### 5. AffirmationStrip Italic Copy Reads Template-Like
**File:** `src/components/cart/AffirmationStrip.tsx`
"Every piece is crafted with intention and purpose" in italics feels generic and template-like -- the kind of copy a Shopify theme generator would produce.

**Fix:** Replace with brand-specific, non-italic, uppercase tracking copy that matches the editorial voice: `"ANOINTED — WORN WITH PURPOSE"` or similar. Use `tracking-[0.2em] uppercase font-medium text-[10px]` instead of italic.

### 6. FlashSaleTimer "Hurry!" Text + animate-pulse (Cheap Urgency)
**File:** `src/components/product/FlashSaleTimer.tsx` (line 184)
`animate-pulse` on "Hurry!" text is a TEMU/Wish pattern that directly undermines premium perception. Flash sale timers with pulsing elements look desperate.

**Fix:** Remove the "Hurry!" text entirely. The countdown numbers alone create sufficient urgency for a premium brand without shouting.

### 7. Cart Item "emerald-500" Green Left Border for Just-Added
**File:** `src/components/cart/CartItem.tsx` (line 90)
`border-l-2 border-emerald-500` creates a bright green stripe on recently added items. This is a functional signal but the color is loud and clashes with the muted editorial palette.

**Fix:** Change to `border-l-2 border-foreground/30` -- a subtle, brand-neutral indicator that still communicates "just added" without screaming.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/components/cart/CartDrawer.tsx` | Replace spring with editorial tween on drawer slide; replace spring on empty bag icon |
| `src/components/product/MobileStickyATC.tsx` | Replace spring with editorial tween on sticky bar |
| `src/components/homepage/MobileStickyBar.tsx` | Remove cheap gradient overlay div |
| `src/components/cart/AffirmationStrip.tsx` | Replace generic italic copy with uppercase editorial microcopy |
| `src/components/product/FlashSaleTimer.tsx` | Remove "Hurry!" pulsing text |
| `src/components/cart/CartItem.tsx` | Soften just-added border color from emerald to muted foreground |

## What Is NOT Changed
- All functional logic (cart add/remove, quantity, checkout flow) -- preserved exactly
- Admin dashboard -- already uses standard HTML with no animation issues
- All existing hook logic, state management, Supabase queries -- untouched
- All accessibility features, reduced motion support -- preserved

