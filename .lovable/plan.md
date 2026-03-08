

# Performance & Polish Audit: Round 3 — Remaining Cheap Patterns

## Findings

After two rounds of spring-to-tween and pulse removal, there are still several cheap patterns that undermine premium perception across checkout, product, and utility surfaces.

### 1. OrderStatsBadge — Fake Social Proof (Dark Pattern)
**File:** `src/components/checkout/OrderStatsBadge.tsx`
This component generates random fake numbers ("87 orders today", "12 viewing now") with a pulsing green dot. This is a textbook dark pattern — fabricated social proof. It violates the ethical design principles and reads as TEMU/Wish-tier manipulation.

**Fix:** Remove the entire component. If it's referenced in checkout, remove the import and usage. Real social proof should come from actual data or not be shown at all.

### 2. UrgencyTimer — Pulsing Clock Icon
**File:** `src/components/checkout/UrgencyTimer.tsx` (line 49)
`animate-pulse` on the Clock icon when time is low. Same cheap urgency pattern as previously removed elements.

**Fix:** Remove `animate-pulse` from the Clock icon. The amber color shift already signals urgency without needing to pulse.

### 3. CheckoutProgress — Pulsing Current Step
**File:** `src/components/checkout/CheckoutProgress.tsx` (line 29)
`animate-pulse` on the current step indicator. A pulsing step indicator looks cheap and distracting during a critical payment flow.

**Fix:** Remove `animate-pulse`. The solid `bg-foreground text-background` already distinguishes the active step.

### 4. FlashSaleTimer — Remaining Flame `animate-pulse`
**File:** `src/components/product/FlashSaleTimer.tsx` (line 140)
The default variant still has `animate-pulse` on the Flame icon when `isUrgent`. Previous round only removed the badge/compact variants.

**Fix:** Remove `!prefersReducedMotion && isUrgent && "animate-pulse"` from the Flame icon className.

### 5. AvatarCreationCTA — Sparkles `animate-pulse`
**File:** `src/components/try-on/avatar-creator/AvatarCreationCTA.tsx` (line 21)
`animate-pulse` on a Sparkles icon. Pulsing sparkles look like a free template effect.

**Fix:** Remove `animate-pulse` from the Sparkles icon. A static sparkle is sufficient.

---

## Summary

| File | Change |
|------|--------|
| `src/components/checkout/OrderStatsBadge.tsx` | Delete component (fake social proof = dark pattern) |
| Checkout page referencing OrderStatsBadge | Remove import and usage |
| `src/components/checkout/UrgencyTimer.tsx` | Remove `animate-pulse` from Clock icon |
| `src/components/checkout/CheckoutProgress.tsx` | Remove `animate-pulse` from active step |
| `src/components/product/FlashSaleTimer.tsx` | Remove remaining `animate-pulse` from Flame icon |
| `src/components/try-on/avatar-creator/AvatarCreationCTA.tsx` | Remove `animate-pulse` from Sparkles |

## What Is NOT Changed
- `animate-pulse` on Skeleton components — this is standard loading-state UX, not urgency
- `animate-pulse` on loading states ("Adding...", "...") — acceptable for inline feedback
- `animate-pulse` on loading placeholders in Lookbook/FitGuide/ProductDetail — standard skeleton pattern
- All spring animations on micro-interactions (hover, check icons, swipe) — appropriate for those contexts
- All functional logic preserved exactly

