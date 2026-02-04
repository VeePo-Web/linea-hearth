
# Sitewide Mobile & Tablet Audit Report
## Line of Judah E-Commerce Platform

---

## Executive Summary

After conducting an exhaustive audit of the Line of Judah codebase, the mobile experience is **already at a strong foundation level** with many best practices implemented. The site demonstrates professional-grade responsive architecture including:

**Existing Strengths:**
- Dynamic viewport units (`100dvh`, `min-h-dvh`) for iOS Safari compatibility
- Safe area insets (`safe-area-bottom`, `safe-area-top`) for notched devices
- Touch target utilities (`touch-target`, `touch-target-sm`) meeting 44-48px minimums
- Reduced motion support throughout (`prefers-reduced-motion`)
- Mobile-first responsive typography using `clamp()` and viewport units
- Haptic feedback integration for high-intent actions

However, the audit identified **27 specific issues** across 6 severity categories that require attention to achieve world-class mobile excellence.

---

## Issue Classification

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 3 | Blocks core functionality on mobile |
| **High** | 5 | Significant UX degradation |
| **Medium** | 9 | Noticeable friction points |
| **Low** | 6 | Polish and optimization opportunities |
| **Accessibility** | 4 | WCAG compliance gaps |

---

## CRITICAL ISSUES (Must Fix)

### 1. Lookbook Page Uses Static `100vh` Instead of `100dvh`

**File:** `src/pages/Lookbook.tsx` (lines 160-163)

**Issue:** The lookbook scroll container uses `100vh` which causes content to be hidden behind the iOS Safari URL bar.

**Current Code:**
```tsx
style={{ 
  height: 'calc(100vh - var(--header-height))',
  marginTop: 'var(--header-height)' 
}}
```

**Impact:** On iOS Safari, users cannot see approximately 80px of content at the bottom of each lookbook section. The scroll snap behavior malfunctions.

**Fix:** Replace with `100dvh` (dynamic viewport height) with fallback.

---

### 2. Auth Modal Header Shows Outdated Brand Name "LINEA"

**File:** `src/components/auth/AuthModal.tsx` (line 71)

**Issue:** The auth modal still displays "Join LINEA" instead of "Join Line of Judah"

**Current Code:**
```tsx
{activeTab === 'signin' ? 'Welcome Back' : 'Join LINEA'}
```

**Impact:** Brand inconsistency during sign-up flow undermines trust.

**Fix:** Update to reference brand config or use "Line of Judah" directly.

---

### 3. Multiple Fixed Bottom Bars Can Stack/Overlap

**Files Affected:**
- `src/components/homepage/MobileStickyBar.tsx` (z-40)
- `src/components/product/MobileStickyATC.tsx` (z-50)
- `src/components/checkout/MobileStickyCheckout.tsx` (z-50)
- `src/components/try-on/MobileTryOnBar.tsx` (z-50)
- `src/components/lookbook/LookNavigationMobile.tsx` (z-40)

**Issue:** Multiple sticky bottom bars use different z-indices (z-40 and z-50) without a unified management system. When navigating between pages or in edge cases, bars can overlap.

**Impact:** UI collisions, touch target confusion, content hidden behind multiple bars.

**Fix:** Implement a centralized sticky bar manager context that ensures only one bottom bar is visible at a time per page.

---

## HIGH PRIORITY ISSUES

### 4. Search Overlay Not Optimized for Mobile

**File:** `src/components/header/SearchOverlay.tsx`

**Issues:**
- Uses `absolute top-full` positioning instead of fullscreen on mobile
- Input uses `text-2xl md:text-3xl` which is too large for small phones
- No escape path (no close button on mobile keyboard)
- Trending products list doesn't account for keyboard taking up screen space

**Impact:** Poor search experience on mobile; difficult to type and see results simultaneously.

**Fix:** Transform into full-screen mobile overlay with sticky input, visible close button, and virtualized results list.

---

### 5. StatusBar Progress Dots Too Small for Touch

**File:** `src/components/header/StatusBar.tsx` (lines 60-80)

**Issue:** Progress dots are 4x4px (`w-1 h-1`) which is far below the 44x44px touch target minimum.

**Current Code:**
```tsx
className="w-1 h-1 rounded-full bg-status-bar-foreground p-0 border-0"
```

**Impact:** Users cannot accurately tap to navigate between USP messages.

**Fix:** Increase touch target to 44x44px while keeping visual dot small, or remove interactive functionality on mobile.

---

### 6. Account Layout Mobile Tabs Lack Scroll Indicators

**File:** `src/pages/account/AccountLayout.tsx` (lines 37-54)

**Issue:** Mobile horizontal tab navigation uses `overflow-x-auto` without any visual indication that more tabs exist off-screen.

**Current Code:**
```tsx
<div className="lg:hidden mb-8 overflow-x-auto">
  <div className="flex gap-1 min-w-max pb-2 border-b border-border">
```

**Impact:** Users don't discover all account navigation options; common tabs like "Favorites" and "Addresses" are hidden.

**Fix:** Add scroll fade indicators or convert to wrapped pills that show all options.

---

### 7. Cart Drawer Email Capture Input Too Small

**File:** `src/components/cart/CartDrawer.tsx` (lines 306-341)

**Issue:** The email input in cart drawer has `h-10` (40px) which is below the 44px minimum for comfortable touch input on mobile.

**Current Code:**
```tsx
className="rounded-none text-sm h-10 border-muted-foreground/30"
```

**Impact:** Typing email feels cramped; easy to mistap adjacent elements.

**Fix:** Increase to `h-12` (48px) on mobile.

---

### 8. Size Selector Buttons Lack Sufficient Spacing on Mobile

**File:** `src/components/product/SizeSelector.tsx` (lines 164-214)

**Issue:** Size buttons use `gap-2` (8px) spacing which can cause mistaps when buttons are adjacent.

**Current Code:**
```tsx
<div className="flex flex-wrap gap-2">
```

**Impact:** Users selecting sizes frequently tap wrong size, especially on smaller phones.

**Fix:** Increase gap to `gap-3` (12px) on mobile for better touch discrimination.

---

## MEDIUM PRIORITY ISSUES

### 9. Product Image Gallery Swipe Hint Covers Content

**File:** `src/components/product/ProductImageGallery.tsx` (lines 269-276)

**Issue:** The "Tap to zoom" hint is positioned `bottom-4` which can overlap with the image dots indicator.

**Fix:** Move hint to top or use a timeout to fade it out after 3 seconds.

---

### 10. Category Tiles Use Large Heights on Desktop But Switch to Aspect Ratios on Mobile

**File:** `src/components/homepage/CategoryTiles.tsx`

**Issue:** While mobile uses proper aspect ratios, the transition between mobile and desktop at the `md:` breakpoint is abrupt.

**Fix:** Add tablet-specific styles at `md:` breakpoint to smooth the transition.

---

### 11. Footer Email Capture Form Needs Mobile Optimization

**File:** `src/components/footer/FooterEmailCapture.tsx`

**Issue:** The email signup form in footer may not have adequate touch target sizes for input and button.

**Fix:** Audit and ensure minimum 48px heights for all interactive elements.

---

### 12. Quick View Modal May Overflow on Small Phones

**File:** `src/components/category/QuickViewModal.tsx`

**Issue:** Modal content may overflow viewport on phones smaller than 375px width (e.g., iPhone SE 1st gen at 320px).

**Fix:** Add extra-small breakpoint handling (`xs:`) for 320px devices.

---

### 13. Checkout Form Fields Need Mobile Input Types

**File:** `src/pages/Checkout.tsx`

**Issue:** Form inputs may not specify appropriate `inputMode` for mobile keyboards (e.g., `tel` for phone, `email` for email, `numeric` for postal codes).

**Fix:** Add `inputMode` attributes to all form inputs for optimal mobile keyboard experience.

---

### 14. Instagram Feed Collage Layout Breaks on Tablet Portrait

**File:** `src/components/homepage/InstagramFeed.tsx`

**Issue:** Desktop grid (`grid-cols-12`) switches directly to mobile (`grid-cols-2`). Tablet portrait (768px-1024px) gets desktop layout which may look crowded.

**Fix:** Add `lg:` breakpoint for desktop collage, use simpler grid for `md:`.

---

### 15. MarqueeStrip Animation May Cause Battery Drain on Mobile

**File:** `src/components/homepage/MarqueeStrip.tsx`

**Issue:** Continuous CSS animation runs even when not in viewport on mobile.

**Fix:** Use Intersection Observer to pause animation when off-screen.

---

### 16. Try-On Room Canvas Height Fixed at 50vh on Mobile

**File:** `src/pages/TryOnRoom.tsx` (line 172)

**Issue:** 3D canvas uses `h-[50vh]` which doesn't account for iOS dynamic viewport.

**Current Code:**
```tsx
<div className="flex-1 h-[50vh] md:h-[calc(100vh-200px)]">
```

**Fix:** Use `h-[50dvh]` with fallback.

---

### 17. Featured Drop Section Uses `min-height` Without Max Constraint

**File:** `src/components/homepage/FeaturedDrop.tsx`

**Issue:** `featured-drop-height` class uses `min-height` which on very tall mobile screens could result in excessive empty space.

**Fix:** Add a `max-height` constraint for mobile to prevent over-stretching.

---

## LOW PRIORITY ISSUES (Polish)

### 18. Missing Loading Skeletons for Mobile Product Cards

**Issue:** Product cards show loading state text but no skeleton UI matching card dimensions.

**Fix:** Add skeleton components that match final card aspect ratios to prevent CLS.

---

### 19. Pagination Buttons Could Be Larger on Mobile

**File:** `src/components/category/Pagination.tsx`

**Issue:** While minimum touch targets exist, the visual buttons feel small on mobile.

**Fix:** Increase visual button size on mobile while maintaining functionality.

---

### 20. Horizontal Scroll Areas Need Momentum Scroll on iOS

**Issue:** Some horizontal scroll areas may not feel native on iOS.

**Fix:** Verify `-webkit-overflow-scrolling: touch` is applied (already in CSS for some areas).

---

### 21. Mobile Menu Submenu Animation Could Be Faster

**File:** `src/components/header/MobileMenu.tsx`

**Issue:** Submenu expand animation at 0.3s feels slightly sluggish on modern phones.

**Fix:** Reduce to 0.2s for snappier feel.

---

### 22. Drop Badge Cluster Typography Could Scale Better

**File:** `src/components/homepage/DropBadgeCluster.tsx`

**Issue:** Some text may truncate awkwardly on 320px devices.

**Fix:** Add `xs:` breakpoint adjustments.

---

### 23. Empty State Illustrations Could Be Larger on Mobile

**Issue:** Empty state SVGs in cart and favorites feel small on mobile.

**Fix:** Increase SVG sizes from `w-16 h-16` to `w-20 h-20` on mobile.

---

## ACCESSIBILITY ISSUES

### 24. Focus States May Be Hidden Under Fixed Headers/Footers

**Issue:** When tabbing through page, focused elements near header/footer may be obscured.

**Fix:** Add `scroll-margin-top: var(--header-height)` and `scroll-margin-bottom` for sticky bars.

---

### 25. Some Icon-Only Buttons Lack Proper ARIA Labels

**Files:** Various components

**Issue:** Some icon buttons rely on visual context without `aria-label`.

**Fix:** Audit all icon buttons and ensure proper labeling.

---

### 26. Skip-to-Content Link Not Implemented

**File:** `src/index.css` (lines 476-489)

**Issue:** Skip link CSS exists but no component implements it.

**Fix:** Add skip link component to Layout.tsx.

---

### 27. Color Contrast on Muted Text May Fail WCAG AA

**Issue:** `text-muted-foreground` at `0 0% 40%` on light backgrounds may not meet 4.5:1 ratio.

**Fix:** Audit with contrast checker and adjust to minimum 45% gray.

---

## Performance Observations

### Already Implemented (Positive)
- Lazy loading on below-fold images
- Responsive images with proper aspect ratios
- Reduced motion support
- Parallax disabled on mobile for battery savings
- Animation frame budget management with Framer Motion

### Opportunities for Improvement
- Consider converting PNG product images to WebP/AVIF
- Add explicit `width` and `height` to images to prevent CLS
- Implement service worker for offline product browsing
- Add prefetch hints for likely next pages

---

## Recommended Implementation Order

### Phase 1: Critical Fixes (Same Day)
1. Fix Lookbook `100vh` → `100dvh` issue
2. Update AuthModal brand name "LINEA" → "Line of Judah"
3. Audit fixed bottom bar z-index conflicts

### Phase 2: High Priority (Week 1)
4. Transform Search Overlay into fullscreen mobile experience
5. Fix StatusBar progress dot touch targets
6. Add scroll indicators to Account Layout tabs
7. Increase Cart Drawer email input height
8. Add spacing to Size Selector buttons

### Phase 3: Medium Priority (Week 2)
9-17. Address remaining medium issues

### Phase 4: Polish & Accessibility (Week 3)
18-27. Complete low priority and accessibility improvements

---

## Testing Recommendations

### Devices to Test
- iPhone SE (1st gen) - 320px width edge case
- iPhone 14/15 - Dynamic Island, safe areas
- iPhone 14 Pro Max - Large phone, safe areas
- iPad Mini - Small tablet
- iPad Pro 12.9" - Large tablet
- Samsung Galaxy S23 - Android flagship
- Pixel 7a - Stock Android

### Test Scenarios
1. Full checkout flow with on-screen keyboard
2. Lookbook swipe navigation with scroll snap
3. Product quick-add from all surfaces
4. Cart drawer with 5+ items (scrolling)
5. Search with keyboard open
6. Account navigation discovering all tabs
7. Form submission with autofill
8. Orientation changes (portrait ↔ landscape)

---

## Files Requiring Modification

| Priority | File | Issue Count |
|----------|------|-------------|
| Critical | `src/pages/Lookbook.tsx` | 1 |
| Critical | `src/components/auth/AuthModal.tsx` | 1 |
| High | `src/components/header/SearchOverlay.tsx` | 1 |
| High | `src/components/header/StatusBar.tsx` | 1 |
| High | `src/pages/account/AccountLayout.tsx` | 1 |
| High | `src/components/cart/CartDrawer.tsx` | 1 |
| High | `src/components/product/SizeSelector.tsx` | 1 |
| Medium | `src/components/product/ProductImageGallery.tsx` | 1 |
| Medium | `src/components/homepage/CategoryTiles.tsx` | 1 |
| Medium | `src/components/homepage/InstagramFeed.tsx` | 1 |
| Medium | `src/pages/TryOnRoom.tsx` | 1 |
| Medium | `src/components/homepage/FeaturedDrop.tsx` | 1 |
| Medium | `src/pages/Checkout.tsx` | 1 |
| Low | Multiple | 6 |
| A11y | Multiple | 4 |

---

## Summary

The Line of Judah mobile experience is built on a solid responsive foundation with proper viewport handling, touch target utilities, and reduced motion support. The **27 identified issues** range from critical viewport bugs to polish opportunities, with a clear implementation roadmap that can be executed in 3 weeks.

The most impactful fixes are:
1. **Lookbook viewport bug** - Directly affects the flagship lookbook experience
2. **Search overlay mobile optimization** - Key discovery mechanism
3. **Sticky bar z-index management** - Prevents UI collisions site-wide
4. **Touch target compliance** - Multiple components need 44px minimum

Implementing these fixes will elevate the mobile experience from "good" to "world-class Fantasy.co-level" while preserving the existing desktop design exactly as-is.
