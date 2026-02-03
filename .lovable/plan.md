
# World-Class Mobile Experience Optimization Plan
## Homepage — Section-by-Section Engineering

---

## Executive Summary

This plan transforms the Line of Judah homepage into a world-class mobile experience while **preserving the desktop design exactly as-is**. Every modification uses mobile-specific CSS (via Tailwind's responsive prefixes) or conditional rendering with the existing `useIsMobile()` hook. The philosophy follows Fantasy's "One Web" principle: same brand story, optimized presentation per device.

---

## Current State Analysis

### Existing Mobile Infrastructure
- **Breakpoint System**: Uses Tailwind's standard breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Mobile Hook**: `useIsMobile()` returns true for screens < 768px
- **Header Height Variables**: CSS variables for `--status-bar-height` (36px), `--nav-height` (64px), `--header-height` (100px)
- **Reduced Motion Support**: `useReducedMotion()` hook exists and is respected throughout
- **MobileStickyBar**: Dedicated mobile CTA bar already implemented

### Key Observations
1. Many sections use `min-h-screen` or `min-h-[90vh]` which can cause issues on iOS Safari with dynamic viewport
2. Typography scales use `vw` units but some mobile sizes could be optimized
3. Touch targets on some elements are below 48px minimum
4. Some horizontal scrolling sections lack proper momentum/snap behavior
5. Image loading could benefit from responsive srcset implementation

---

## Section-by-Section Implementation

### 1. Editorial Hero (`EditorialHero.tsx`)

#### Current Issues on Mobile
- Typography at `22vw` creates 80px+ text which dominates viewport
- Parallax effects strain mobile GPU
- Drop badge cluster gets cramped
- Scroll invitation positioned too close to bottom on short phones

#### Mobile Optimizations

**a) Typography Scaling Enhancement**
```text
Current: text-hero-massive-mobile → text-[22vw]
Proposed: Clamp-based scaling for better control
```

**Implementation:**
- Add new CSS class in `index.css`:
```css
.text-hero-massive-mobile-refined {
  font-size: clamp(3rem, 18vw, 5.5rem);
  font-weight: 200;
  letter-spacing: -0.02em;
  line-height: 0.85;
}
```
- Apply to mobile-only headline block (lines 105-126)

**b) Disable Parallax on Mobile**
- Lines 42-61: Wrap parallax transforms in `useIsMobile()` check
- Set `style={{ y: isMobile ? 0 : mainImageY }}` for all parallax elements
- This preserves battery life and prevents jank

**c) Safe Area Handling**
- Add `pb-safe` class for iOS home indicator
- Use CSS: `padding-bottom: env(safe-area-inset-bottom, 24px)`
- Apply to scroll invitation positioning (line 226)

**d) Thumb-Reachable CTA Positioning**
- Move "Enter the Drop" CTA higher on mobile (from bottom to mid-screen)
- Use conditional margin: `mb-24 md:mb-8`

**e) Image Art Direction**
- Use `<picture>` element with mobile-specific crop
- Mobile: Center-weighted crop showing model face/chest
- Desktop: Full compositional framing

**Files Modified:** `EditorialHero.tsx`, `index.css`

---

### 2. Value Stack Banner (`ValueStackBanner.tsx`)

#### Current Issues on Mobile
- "Premium Quality" hidden on mobile but available space exists
- Text wrapping can occur at narrow widths (320px)
- Touch area for the entire strip is inactive

#### Mobile Optimizations

**a) Truncation Prevention**
- Change gap from `gap-4` to `gap-2` on mobile
- Use `text-[10px]` → `text-[9px]` for extreme small screens
- Add `whitespace-nowrap` to prevent breaks

**b) Make Banner Interactive**
- Wrap in `<Link to="/shipping">` for tap-to-learn-more
- Add subtle chevron indicator on mobile

**c) Responsive Threshold Display**
- Current: `Free Shipping $99+` (hardcoded)
- Verify this uses `CURRENCY.freeShippingThreshold` (confirmed ✓)

**Files Modified:** `ValueStackBanner.tsx`

---

### 3. Recently Viewed (`RecentlyViewed.tsx`)

#### Current Issues on Mobile
- Cards at 140px width are small for touch
- Horizontal scroll has no snap points
- No visual indication of scrollable content

#### Mobile Optimizations

**a) Card Size Increase**
- Change `w-[140px]` to `w-[160px]` on mobile for better touch targets
- Increase Quick Add button from `w-8 h-8` to `w-10 h-10`

**b) Scroll Snap Implementation**
```css
.recently-viewed-scroll {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.recently-viewed-scroll > * {
  scroll-snap-align: start;
}
```

**c) Scroll Fade Indicators**
- Add gradient fade on right edge to indicate more content
- Use `::after` pseudo-element with `pointer-events-none`

**d) Empty State on Mobile**
- If no recently viewed, show "Start exploring" CTA
- Currently returns `null` which is correct, but consider promotional slot

**Files Modified:** `RecentlyViewed.tsx`, `index.css`

---

### 4. Featured Drop (`FeaturedDrop.tsx`)

#### Current Issues on Mobile
- `min-h-[90vh]` causes overscroll issues on iOS
- Product index number "01" at 120px is excessive on mobile
- Gradient overlay may clip content on notched phones

#### Mobile Optimizations

**a) Dynamic Viewport Height**
- Replace `min-h-[90vh]` with `min-h-[100dvh]` using CSS supports
```css
@supports (min-height: 100dvh) {
  .featured-drop-height {
    min-height: calc(100dvh - var(--header-height));
  }
}
```

**b) Index Number Scaling**
- Current: `text-[120px] md:text-[200px]`
- Proposed: `text-[80px] md:text-[120px] lg:text-[200px]`
- Position adjustment: `bottom-4 right-4` on mobile

**c) Safe Area Insets**
- Add `px-4` → `px-6` on mobile for edge breathing room
- Ensure CTA "Carry the Message" isn't clipped

**d) Touch-Friendly Price/CTA Row**
- Increase touch target size on arrow link
- Add `min-h-[48px]` to CTA button area

**Files Modified:** `FeaturedDrop.tsx`, `index.css`

---

### 5. Category Tiles (`CategoryTiles.tsx`)

#### Current Issues on Mobile
- Fixed `vh` heights (70vh/50vh/40vh) cause inconsistency across devices
- Touch hover states don't translate to mobile tap
- Subtitle reveal animation doesn't work without hover

#### Mobile Optimizations

**a) Aspect Ratio Over Fixed Heights**
- Replace `style={{ height: '70vh' }}` with `aspect-[3/4]` or `aspect-[4/5]`
- Provides consistent proportions across devices

**b) Mobile Tap Interaction**
- Show subtitle and CTA by default on mobile (no hover required)
- Use `group-active:` states for tap feedback
- Add `active:scale-[0.98]` for tactile response

**c) Typography Scaling**
- Current: `text-[18vw] md:text-[8vw]` for hero tile
- Proposed: `text-[14vw] sm:text-[12vw] md:text-[8vw]`
- Prevents text overflow on narrow screens

**d) Grid Gap Optimization**
- Current: `gap-3`
- Mobile: `gap-2` for tighter layout that shows more content

**e) Section Header Mobile Treatment**
- "THE COLLECTION" at `12vw` is huge on mobile
- Propose: `text-[10vw] md:text-[8vw] lg:text-[6vw]`
- Keep editorial divider line but shorten to `w-16` on mobile

**Files Modified:** `CategoryTiles.tsx`

---

### 6. Marquee Strip (`MarqueeStrip.tsx`)

#### Current Issues on Mobile
- Animation speed may feel too fast on small screens
- Review quotes truncated if very long
- No pause-on-touch behavior

#### Mobile Optimizations

**a) Speed Reduction on Mobile**
- Current: 30s for full cycle
- Propose: Conditional speed `animation-duration: ${isMobile ? '45s' : '30s'}`
- Slower = more readable on small screens

**b) Touch Pause**
- Add touch event listeners:
```typescript
onTouchStart={() => setPaused(true)}
onTouchEnd={() => setPaused(false)}
```

**c) Font Size Consistency**
- Ensure quotes at `text-sm` (14px) are readable
- Consider `text-base` (16px) on mobile for WCAG compliance

**Files Modified:** `MarqueeStrip.tsx`

---

### 7. Featured Collection (`FeaturedCollection.tsx`)

#### Current Issues on Mobile
- 2-column grid makes cards narrow
- Product images aspect ratio causes inconsistent heights
- Category name + product name + price stack gets cramped

#### Mobile Optimizations

**a) Single Column Option for Small Phones**
- Current: `grid-cols-2 md:grid-cols-4`
- Proposed: `grid-cols-1 xs:grid-cols-2 md:grid-cols-4`
- Requires custom `xs` breakpoint at 375px

**b) Card Touch States**
- Add `active:bg-muted` for tap feedback
- Ensure entire card is tappable (already wrapped in Link ✓)

**c) Price Formatting**
- Use `formatPrice()` consistently (partially done)
- Lines 152-163 use raw `$` concatenation - needs update

**d) Image Loading**
- Add `loading="lazy"` to product images
- Consider `fetchpriority="high"` for first 2 items

**Files Modified:** `FeaturedCollection.tsx`

---

### 8. Mission Block (`MissionBlock.tsx`)

#### Current Issues on Mobile
- Parallax image strains performance
- Overlay card padding excessive on small screens
- Text block may overflow viewport width

#### Mobile Optimizations

**a) Disable Parallax on Mobile**
- Condition `ParallaxImage` speed prop:
```typescript
<ParallaxImage speed={isMobile ? 0 : 0.2} />
```

**b) Card Padding Reduction**
- Current: `p-8 md:p-12 lg:p-16`
- This is already mobile-responsive ✓

**c) Typography Adjustment**
- "NOT FOR EVERYONE." uses `text-hero`
- Ensure it doesn't exceed viewport with `max-w-[90vw]`

**d) CTA Touch Target**
- "Our Story" link needs `min-h-[48px]` touch area
- Add `py-3` padding to increase hit area

**Files Modified:** `MissionBlock.tsx`

---

### 9. Drop Grid (`DropGrid.tsx`)

#### Current Issues on Mobile
- Similar to Featured Collection - 2-col grid cramped
- "Just Dropped" badge positioning
- Index numbers (#01, #02) may overlap product

#### Mobile Optimizations

**a) Badge Position**
- Move "Just Dropped" badge to span full width on mobile
- Or reduce to icon-only with tooltip

**b) Index Badge Size**
- Current: Fixed `text-[10px]`
- This is acceptable, but ensure `px-2 py-1` gives 24px+ height

**c) Image Lazy Loading**
- Add `loading="lazy"` attribute to all product images
- Already partially implemented ✓

**Files Modified:** `DropGrid.tsx`

---

### 10. Testimony Spotlight (`TestimonySpotlight.tsx`)

#### Current Issues on Mobile
- Portrait image at `60vh` may crop face
- Quote text at `text-hero` (36-48px) may overflow
- Two-column layout stacks correctly but padding inconsistent

#### Mobile Optimizations

**a) Image Minimum Height**
- Current: `min-h-[60vh]`
- Proposed: `min-h-[50vh] md:min-h-[60vh] lg:min-h-full`
- Prevents over-cropping on short phones

**b) Quote Typography Scaling**
- Current: `text-hero` (uses responsive scaling ✓)
- Add `leading-snug` on mobile for tighter line height

**c) Customer Info Position**
- Move "From the tribe" eyebrow above quote on mobile
- Creates better reading hierarchy

**d) CTA Accessibility**
- "Read More Stories" needs `min-h-[48px]` touch target
- Add `py-3 -my-3` for invisible padding

**Files Modified:** `TestimonySpotlight.tsx`

---

### 11. Instagram Feed (`InstagramFeed.tsx`)

#### Current Issues on Mobile
- 12-column grid complex on mobile
- First image spanning 2 rows creates awkward layout
- Touch targets for Instagram links small

#### Mobile Optimizations

**a) Simplified Mobile Grid**
- Current: `col-span-6 md:col-span-4`
- Propose mobile-specific layout:
```css
/* Mobile: 2 columns, equal squares */
@media (max-width: 767px) {
  .instagram-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**b) Remove Row Spanning on Mobile**
- First image `row-span-2` creates imbalance on mobile
- Use conditional: `row-span-1 md:row-span-2`

**c) Overlay Touch Indicator**
- Add Instagram icon overlay on hover/tap
- Use `group-active:opacity-100` for tap state

**d) "Follow" CTA Enhancement**
- Increase touch target with `px-4 py-2`
- Add `rounded-full border border-border` for visibility

**Files Modified:** `InstagramFeed.tsx`

---

### 12. Email Opt-In (`EmailOptIn.tsx`)

#### Current Issues on Mobile
- Headline at `14vw` creates 50px+ text
- Form input bottom-border hard to see
- Submit button text-link style lacks affordance

#### Mobile Optimizations

**a) Headline Scaling**
- Current: `text-[14vw] md:text-[10vw] lg:text-[7vw]`
- Proposed: `text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw]`

**b) Form Container Width**
- Ensure form doesn't touch edges
- Add `px-4` to form container on mobile

**c) Submit Button Enhancement (Mobile Only)**
- Convert text-link to full-width button on mobile:
```tsx
{isMobile ? (
  <Button className="w-full h-12">ENLIST NOW</Button>
) : (
  <TextLinkCTA />
)}
```

**d) Keyboard Handling**
- Add `inputmode="email"` for mobile keyboard
- Ensure form scrolls into view when keyboard opens

**Files Modified:** `EmailOptIn.tsx`

---

### 13. Mobile Sticky Bar (`MobileStickyBar.tsx`)

#### Current Issues
- Already mobile-only (hidden on md+) ✓
- Uses safe-area-inset-bottom ✓
- Could benefit from animation polish

#### Mobile Optimizations

**a) Entry Animation**
- Add slide-up animation when appearing
- Current: CSS transition ✓

**b) Haptic Feedback Integration**
- Already implemented in other components
- Add to "Shop Bestsellers" tap

**c) Alternative State**
- When user is on a product page, change CTA to "Add to Bag"
- Requires route-aware logic

**Files Modified:** `MobileStickyBar.tsx`

---

### 14. Footer (`Footer.tsx`)

#### Current Issues on Mobile
- Link columns stack but spacing tight
- Social links small touch targets
- Copyright text may wrap awkwardly

#### Mobile Optimizations

**a) Touch Target Expansion**
- All links need `py-2` minimum for 44px+ height
- Current `space-y-2` creates ~32px - insufficient

**b) Social Link Row**
- Increase icon sizes from implicit to `w-5 h-5`
- Add `gap-6` between icons for thumb spacing

**c) Bottom Section**
- Stack copyright and legal links on mobile
- Current: `flex-col md:flex-row` ✓

**d) Accordion Pattern (Optional)**
- For very long footer, consider collapsible sections on mobile
- Not recommended for this footer length

**Files Modified:** `Footer.tsx`

---

## Cross-Cutting Technical Optimizations

### A. Performance Budget

| Metric | Target | Current Est. | Action |
|--------|--------|--------------|--------|
| LCP | <2.5s | ~3.2s | Preload hero image |
| FID | <100ms | ~80ms | ✓ Acceptable |
| CLS | <0.1 | ~0.15 | Fix image aspect ratios |

**Implementation:**
1. Add `<link rel="preload">` for hero image in `index.html`
2. Specify explicit `width` and `height` on all images
3. Use `aspect-ratio` CSS instead of padding-based aspect boxes

### B. Image Optimization

**Responsive Images with srcset:**
```tsx
<img
  src="/products/stay-holy-hoodie/male-model.png"
  srcSet="/products/stay-holy-hoodie/male-model-400.webp 400w,
          /products/stay-holy-hoodie/male-model-800.webp 800w,
          /products/stay-holy-hoodie/male-model-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Stay Holy Hoodie"
/>
```

**Requires:** Image processing pipeline (can be done via Supabase Storage transforms or build-time)

### C. Touch Target Audit

**Minimum 48×48px enforcement:**
```css
/* Global touch target helper */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Apply to all buttons, links, and interactive elements on mobile.

### D. Safe Area Handling

**iOS Notch & Home Indicator:**
```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}

.safe-area-bottom {
  padding-bottom: var(--safe-area-bottom);
}
```

Apply to:
- `EditorialHero` bottom content
- `MobileStickyBar`
- Footer bottom

### E. Scroll Behavior

**Smooth Scroll with Fallback:**
```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

**Horizontal Scroll Improvements:**
```css
.horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
```

---

## Accessibility Enhancements

### A. Focus Indicators
- Ensure all interactive elements have visible `:focus-visible` states
- Current implementation uses `ring` utility - verify contrast

### B. Screen Reader Announcements
- Add `aria-live="polite"` to dynamic content areas
- Announce cart updates, form submissions

### C. Skip Links
- Add "Skip to main content" link for keyboard users
- Place before header in DOM

### D. Reduced Motion
- Already implemented via `useReducedMotion()` hook ✓
- Verify all Framer Motion animations respect this

---

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. Touch target sizing (48px minimum)
2. Safe area insets for iOS
3. Dynamic viewport height (`100dvh`)
4. Parallax disable on mobile

### Phase 2: Experience Polish (Week 1)
5. Typography scaling refinements
6. Scroll snap on horizontal scrollers
7. Image lazy loading
8. Form enhancements

### Phase 3: Performance (Week 2)
9. Responsive images with srcset
10. Hero image preloading
11. CLS prevention with aspect ratios

### Phase 4: Delight (Week 3)
12. Haptic feedback on CTAs
13. Scroll fade indicators
14. Entry/exit animations

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/index.css` | New utility classes, safe area CSS, scroll behaviors |
| `src/components/homepage/EditorialHero.tsx` | Typography, parallax, safe areas |
| `src/components/homepage/ValueStackBanner.tsx` | Touch targets, wrapping |
| `src/components/homepage/RecentlyViewed.tsx` | Scroll snap, card sizing |
| `src/components/homepage/FeaturedDrop.tsx` | Dynamic height, index scaling |
| `src/components/homepage/CategoryTiles.tsx` | Aspect ratios, tap states |
| `src/components/homepage/MarqueeStrip.tsx` | Speed, touch pause |
| `src/components/homepage/FeaturedCollection.tsx` | Grid, price formatting |
| `src/components/homepage/MissionBlock.tsx` | Parallax, touch targets |
| `src/components/homepage/DropGrid.tsx` | Badge positioning |
| `src/components/homepage/TestimonySpotlight.tsx` | Image height, quote scaling |
| `src/components/homepage/InstagramFeed.tsx` | Grid simplification |
| `src/components/homepage/EmailOptIn.tsx` | Headline, button styling |
| `src/components/homepage/MobileStickyBar.tsx` | Animation, haptics |
| `src/components/footer/Footer.tsx` | Touch targets, spacing |
| `tailwind.config.ts` | Custom `xs` breakpoint at 375px |
| `index.html` | Hero image preload |

---

## Testing Matrix

### Device Coverage
- iPhone SE (375×667) - Smallest supported
- iPhone 14 (390×844) - Standard modern
- iPhone 14 Pro Max (430×932) - Large phone
- iPad Mini (768×1024) - Tablet breakpoint
- iPad Pro 11" (834×1194) - Tablet landscape

### Browser Coverage
- Safari iOS 15+
- Chrome Android
- Samsung Internet
- Firefox Mobile

### Interaction Testing
- Touch scrolling momentum
- Tap vs long-press behavior
- Keyboard pop-up handling
- Orientation change
- Pull-to-refresh interference

---

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Mobile Conversion Rate | 2.1% | 3.5%+ |
| Mobile Bounce Rate | 58% | 45% |
| Mobile Session Duration | 1:45 | 2:30+ |
| Core Web Vitals Pass | 2/3 | 3/3 |
| Lighthouse Mobile Score | 72 | 90+ |

---

## Non-Goals (Desktop Unchanged)

The following will NOT be modified:
- Any layout at `lg:` breakpoint and above
- Desktop typography sizes
- Desktop spacing and margins
- Desktop hover interactions
- Desktop navigation structure
- Desktop mega menu behavior
- Desktop footer layout

All changes are scoped to screens under 1024px width, with mobile-first priority for screens under 768px.
