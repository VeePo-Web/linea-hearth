

# Performance & Polish Audit: Round 5 — Emerald Color Bleeding, Remaining Cheap Patterns

## Findings

### 1. HighIntentPrompt — Behavioral Surveillance Copy (Dark Pattern)
**File:** `src/components/product/HighIntentPrompt.tsx`
"You've viewed this 5 times" is surveillance-style messaging that tells users they're being tracked. Combined with "Ready to buy?" it reads as pushy and manipulative. This violates user autonomy principles.

**Fix:** Delete the entire component and remove its import/usage from `src/pages/ProductDetail.tsx`. If a gentle nudge is needed in the future, it should not expose view counts.

### 2. CheckoutProgress — Emerald Completed Steps
**File:** `src/components/checkout/CheckoutProgress.tsx` (lines 27, 56)
Completed steps use `bg-emerald-500` and connector lines use `bg-emerald-500`. This bright green clashes with the editorial palette (stone/champagne). Checkout progress should use the brand's foreground color for completed steps, not a generic "success green."

**Fix:** Replace `bg-emerald-500 text-white` with `bg-foreground text-background` for completed steps. Replace `bg-emerald-500` connector with `bg-foreground` for completed connectors.

### 3. OrderConfirmation — Emerald Success Circle + animate-ping Confetti
**File:** `src/components/checkout/OrderConfirmation.tsx` (lines 54, 64-68, 93-94)
- `bg-emerald-500` success circle — should use `bg-foreground` for brand consistency
- `animate-ping` confetti rings — cheap "default template" celebration effect
- `"FREE ✓"` with emerald text — the checkmark emoji is unprofessional; just use "Free" in foreground color

**Fix:** Replace emerald success circle with `bg-foreground`, remove the ping confetti rings entirely, replace `"FREE ✓"` with `"Free"` in normal foreground text.

### 4. MissingProductCard — Emerald Hover States + Success Icon
**File:** `src/components/cart/MissingProductCard.tsx` (lines 241, 264)
- Success check uses `text-emerald-500` — should use `text-foreground`
- Add button hover uses `hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-600` — too many emerald variants for a cart component

**Fix:** Replace emerald success with `text-foreground`. Simplify hover to `hover:bg-foreground/5 hover:border-foreground/30 hover:text-foreground`.

### 5. Accessibility Page — animate-ping Compliance Dot
**File:** `src/pages/Accessibility.tsx` (lines 137-139)
`animate-ping` on a green status dot. The same cheap "live indicator" pattern used in the deleted `OrderStatsBadge`. A compliance badge should feel authoritative and static, not pulsing like a notification.

**Fix:** Remove the `animate-ping` span. Keep only the static `bg-emerald-500` dot (emerald is acceptable here as it's a genuine compliance indicator).

### 6. TestimonialSnippet — Hardcoded Fallback Review
**File:** `src/components/product/TestimonialSnippet.tsx` (lines 31-35)
When no featured review exists in the database, it falls back to a hardcoded fake review: `"Changed how I start my day. Wearing my faith boldly." — Marcus T., Calgary`. This is fabricated social proof — the same violation as the deleted `MiniTestimonial`.

**Fix:** If no review exists in the database, return `null` instead of showing a fake fallback. Real testimonials only.

---

## Summary

| File | Change |
|------|--------|
| `src/components/product/HighIntentPrompt.tsx` | Delete component (surveillance copy) |
| `src/pages/ProductDetail.tsx` | Remove HighIntentPrompt import and usage |
| `src/components/checkout/CheckoutProgress.tsx` | Replace emerald with foreground for completed steps |
| `src/components/checkout/OrderConfirmation.tsx` | Replace emerald circle, remove ping confetti, fix "FREE ✓" |
| `src/components/cart/MissingProductCard.tsx` | Replace emerald with foreground on success + hover |
| `src/pages/Accessibility.tsx` | Remove animate-ping from compliance dot |
| `src/components/product/TestimonialSnippet.tsx` | Return null instead of fake fallback review |

## What Is NOT Changed
- Emerald in `SearchOverlay` / `SearchQuickAdd` success states — these are micro-interaction confirmations, acceptable
- Emerald in `QuickViewModal` added overlay — transient feedback, acceptable
- Emerald in `ContactForm` success — genuine form submission confirmation
- Emerald in `InfoCard` icon color prop — used only on Accessibility page for compliance indicators
- All functional logic, cart behavior, checkout flow preserved exactly

