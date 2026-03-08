

# Performance & Polish Audit: Round 2 — Cheap Details and Animation Inconsistencies

## Findings

### Critical: Spring Animations on Core Navigation Surfaces

The previous round fixed cart drawer and mobile ATC springs, but the **mobile menu** and **search overlay** — equally high-traffic surfaces — still use bouncy spring animations that contradict the editorial tween standard.

### 1. MobileMenu Panel Uses Spring (Bouncy Slide)
**File:** `src/components/header/MobileMenu.tsx` (lines 46-65, 68-77)
The mobile menu slide-in uses `spring, stiffness: 300, damping: 30` and nav items use `spring, stiffness: 300, damping: 25`. These bounce on entry, which feels app-like rather than editorial.

**Fix:** Replace panel and nav item transitions with editorial tween:
- Panel: `type: "tween", duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94]`
- Exit: `type: "tween", duration: 0.3, ease: [0.4, 0, 1, 1]`
- Nav items: `type: "tween", duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94]`

### 2. SearchOverlay Item Spring
**File:** `src/components/header/SearchOverlay.tsx` (line 43)
Popular search items use `spring, stiffness: 400, damping: 25`. Minor but inconsistent with the editorial standard on the same nav surface.

**Fix:** Replace with `type: "tween", duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94]`

### 3. HeroBlock Scroll Indicator Uses `animate-bounce`
**File:** `src/components/homepage/HeroBlock.tsx` (line 112)
`animate-bounce` is a default Tailwind animation — literally the most generic, template-looking animation possible. On a hero section it screams "default theme."

**Fix:** Remove the bouncing div entirely. The `ScrollInvitation` component already exists with a proper editorial animated line. Replace the entire scroll indicator block (lines 102-115) with a clean static chevron or remove it since the `ScrollInvitation` component is used on the landing page. For the homepage hero, use a simple CSS `translateY` keyframe with the editorial ease, or just a static arrow.

### 4. GuaranteeBadge Shield Icon Spring Bounce
**File:** `src/components/product/GuaranteeBadge.tsx` (line 78)
`type: "spring", stiffness: 400, damping: 15` — damping of 15 is intentionally bouncy. A shield icon bouncing in undermines trust messaging.

**Fix:** Replace with `type: "tween", duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94]`

### 5. ProductInfo Trust Signals Use Spring Hover
**File:** `src/components/product/ProductInfo.tsx` (lines 181-192, 515)
`staggerItemVariants` uses `spring, stiffness: 400, damping: 20` for trust signal icons, and `whileHover` on trust signals uses spring. Trust signals should feel stable, not bouncy.

**Fix:** Replace spring with tween in `staggerItemVariants` and remove the `whileHover={{ y: -2 }}` spring on trust signals — trust icons shouldn't bounce on hover.

### 6. BundleProgress `animate-pulse` Dot
**File:** `src/components/cart/BundleProgress.tsx` (line 209)
`animate-pulse` on the "1 item away" indicator dot. Same TEMU pattern as the removed "Hurry!" text.

**Fix:** Remove `animate-pulse` from the dot. A static colored dot is sufficient to draw attention.

### 7. FlashSaleTimer Badge Variant Still Has `animate-pulse`
**File:** `src/components/product/FlashSaleTimer.tsx` (line 79)
The badge variant still uses `animate-pulse` on the entire badge when `isVeryUrgent`. The "Hurry!" text was removed but the pulsing badge remains.

**Fix:** Remove `!prefersReducedMotion && isVeryUrgent && "animate-pulse"` from the badge variant (line 79) and the compact clock icon (line 105).

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/header/MobileMenu.tsx` | Replace spring with editorial tween on panel slide and nav items |
| `src/components/header/SearchOverlay.tsx` | Replace spring with tween on item variants |
| `src/components/homepage/HeroBlock.tsx` | Replace `animate-bounce` scroll indicator with static/editorial animation |
| `src/components/product/GuaranteeBadge.tsx` | Replace bouncy spring on shield icon with tween |
| `src/components/product/ProductInfo.tsx` | Replace spring on trust signal stagger; remove spring hover on trust icons |
| `src/components/cart/BundleProgress.tsx` | Remove `animate-pulse` from close-to-completion dot |
| `src/components/product/FlashSaleTimer.tsx` | Remove remaining `animate-pulse` from badge and compact variants |

## What Is NOT Changed
- All functional logic — preserved exactly
- FavoritesDrawer spring on check icon — acceptable for a micro-interaction confirmation
- ProductImageGallery spring on swipe — spring physics are appropriate for gesture-driven content
- CharacterReveal spring — appropriate for letter-by-letter text animation
- 25+ other files with spring on `whileHover` micro-interactions — these are low-impact and appropriate for small interactive feedback

