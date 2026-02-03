

# World-Class Mobile Experience Optimization Plan
## Shop/Category Pages — Section-by-Section Engineering

---

## Executive Summary

This plan transforms the Shop/Category pages into a world-class mobile e-commerce experience while **preserving the desktop design exactly as-is**. These pages are critical conversion surfaces where users browse, filter, and add products to cart. Mobile optimization focuses on: thumb-reachable filter controls, generous touch targets on product cards, optimized quick-add flows for one-handed shopping, and a sticky filter bar that stays accessible without obscuring products.

---

## Current State Analysis

### Page Architecture
```text
Category.tsx
├── Layout (wrapper)
│   ├── CollectionHero
│   │   ├── Pattern overlay
│   │   ├── Tagline + Title
│   │   └── Product count
│   ├── FilterSortBar
│   │   ├── Active filter chips
│   │   ├── Item count
│   │   ├── Filter button → Sheet
│   │   └── Sort dropdown
│   ├── ProductGrid
│   │   ├── ProductCard[] (2-col mobile, 4-col desktop)
│   │   │   ├── Image with hover swap
│   │   │   ├── Quick View / Quick Add buttons
│   │   │   ├── InlineQuickSizePicker
│   │   │   ├── CartQuantityBadge
│   │   │   └── Product info (name, price, colors)
│   │   ├── PLPTestimonialStrip
│   │   └── Pagination
│   └── QuickViewModal
```

### Current Mobile Observations
1. **CollectionHero**: Height `h-[40vh]` is good on mobile; typography could be refined
2. **FilterSortBar**: Sheet slides from right which is acceptable; filter chips need larger touch targets
3. **ProductGrid**: 2-column grid (`grid-cols-2`) works; gap could be tighter on mobile
4. **ProductCard**: Hover-based quick actions don't work on mobile; needs tap alternatives
5. **QuickViewModal**: Dialog layout needs mobile-first consideration; image/info split is problematic
6. **Pagination**: Touch targets at `min-w-8 h-8` (32px) are below 48px minimum
7. **InlineQuickSizePicker**: Button sizes at `min-w-[36px] h-9` could be larger for mobile

---

## Section-by-Section Implementation

### 1. Collection Hero (`CollectionHero.tsx`)

#### Current Issues on Mobile
- Height `h-[40vh]` is reasonable but could be reduced to show products faster
- Title at `text-4xl` (36px) on mobile is good ✓
- Tagline text is very small (`text-xs`) on mobile

#### Mobile Optimizations

**a) Hero Height Reduction on Mobile**
```text
Current: h-[40vh] md:h-[50vh] lg:h-[60vh]
Proposed: h-[35vh] md:h-[50vh] lg:h-[60vh]
```
- Shows product grid faster on mobile
- Users come to browse, not admire hero banners

**b) Use Dynamic Viewport Height**
```text
Current: h-[40vh]
Proposed: h-[35dvh] md:h-[50vh] lg:h-[60vh]
```
- Prevents iOS Safari address bar issues

**c) Tagline Typography Enhancement**
```text
Current: text-xs md:text-sm
Proposed: text-sm md:text-sm
```
- 14px minimum for readability on mobile

**d) Product Count Touch-Friendly**
```text
Current: text-sm md:text-base
This is acceptable ✓
```

**e) Bottom Gradient Safe Area**
- Current gradient `h-24` is good ✓
- Ensures smooth transition to content

**Files Modified:** `CollectionHero.tsx`

---

### 2. Filter/Sort Bar (`FilterSortBar.tsx`)

#### Current Issues on Mobile
- Filter chips at `px-3 py-1.5` (~28px height) are small touch targets
- "Clear all" link needs larger touch target
- Sort dropdown trigger may be hard to tap
- Filter Sheet needs mobile-specific enhancements
- Checkbox touch targets in filter sheet are small
- "Apply Filters" and "Clear All" buttons in sheet need touch optimization

#### Mobile Optimizations

**a) Active Filter Chips Touch Enhancement**
```text
Current: px-3 py-1.5 text-xs → ~28px height
Proposed: px-3 py-2 md:py-1.5 text-xs → 36px on mobile
```
- Add `min-h-[44px]` to badge wrapper
- Increase X icon area

**b) Clear All Link Touch Target**
```text
Current: text-xs text-muted-foreground hover:text-foreground hover:underline ml-2
Proposed: text-xs ... px-2 py-2 -mx-2 min-h-[44px] inline-flex items-center
```

**c) Filter Button Touch Enhancement**
```text
Current: variant="ghost" size="sm"
Proposed: Add min-h-[44px] and larger icon on mobile
```

**d) Sort Dropdown Mobile Optimization**
```text
Current: w-auto border-none bg-transparent
Proposed: Add min-h-[44px] touch target
```
- SelectTrigger needs `py-3 md:py-2`

**e) Filter Sheet Mobile Enhancements**
- Current width `w-80` is good ✓
- Add safe area bottom padding: `pb-safe`
- Increase checkbox touch targets

**f) Checkbox Touch Target Expansion**
```text
Current: space-y-3 per item → ~24px per row
Proposed: space-y-4 md:space-y-3 → 32px+ per row
Add py-1 to label for larger hit area
```

**g) Apply/Clear Buttons in Sheet**
```text
Current: size="sm"
Proposed: size="sm" className="min-h-[48px] md:min-h-auto"
```

**h) Sticky Filter Bar on Mobile**
- Consider making FilterSortBar sticky on scroll
- Use `sticky top-[var(--header-height)] z-30`
- Add background blur: `backdrop-blur-sm bg-background/95`

**Files Modified:** `FilterSortBar.tsx`

---

### 3. Product Grid (`ProductGrid.tsx`)

#### Current Issues on Mobile
- Grid gap `gap-4 md:gap-6` is good ✓
- Skeleton loading aspect ratio matches products ✓
- Empty state padding could be reduced
- No loading indication beyond skeletons

#### Mobile Optimizations

**a) Grid Gap Mobile Optimization**
```text
Current: gap-4 md:gap-6
Proposed: gap-3 md:gap-6
```
- Tighter gap shows more product on mobile screens
- More products above fold = higher engagement

**b) Empty State Mobile Padding**
```text
Current: py-16
Proposed: py-12 md:py-16
```

**c) Loading Skeleton Enhancement**
- Add subtle pulse animation (already using Skeleton ✓)
- Consider reducing skeleton count on mobile
```text
Current: [...Array(8)].map
Proposed: [...Array(isMobile ? 4 : 8)].map
```

**d) Grid Section Padding**
```text
Current: px-6 mb-8
Proposed: px-4 md:px-6 mb-6 md:mb-8
```
- Slightly more content area on mobile

**Files Modified:** `ProductGrid.tsx`

---

### 4. Product Card (`ProductCard.tsx`)

#### Current Issues on Mobile
- **Critical**: Hover-based quick actions (Quick View, Quick Add) don't work on touch
- Image swap on hover doesn't translate to mobile
- Quick Add button at `h-9` (36px) is acceptable but could be larger
- Size picker buttons at `min-w-[36px] h-9` are borderline
- Color swatches at `w-3.5 h-3.5` (14px) are very small
- Favorite button only shows on hover

#### Mobile Optimizations

**a) Always-Visible Mobile Actions**
- Show Quick View and Quick Add buttons permanently on mobile
- Position at bottom of image, semi-transparent
```tsx
// Desktop: opacity-0 group-hover:opacity-100
// Mobile: opacity-100 always
className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${
  isHovered && !quickAdd.isPickerOpen && !quickAdd.isAdded 
    ? "opacity-100 translate-y-0" 
    : isMobile 
      ? "opacity-90" 
      : "opacity-0 translate-y-2"
}`}
```

**b) Favorite Button Always Visible on Mobile**
```text
Current: opacity-0 md:opacity-0 md:group-hover:opacity-100
Proposed: opacity-100 md:opacity-0 md:group-hover:opacity-100
```
- Mobile users can't hover, so always show favorite button

**c) Quick Add Button Touch Enhancement**
```text
Current: h-9 px-3
Proposed: h-10 md:h-9 px-4 md:px-3
```
- 40px height on mobile for easier tapping

**d) Quick View Button Touch Enhancement**
```text
Current: flex-1 ... text-xs h-9
Proposed: flex-1 ... text-xs h-10 md:h-9
```

**e) Color Swatch Size Increase**
```text
Current: w-3.5 h-3.5 (14px)
Proposed: w-4 h-4 md:w-3.5 md:h-3.5 (16px on mobile)
```

**f) Product Name Truncation**
- Add line clamp for long names on mobile
```text
Current: leading-tight
Proposed: leading-tight line-clamp-2
```

**g) Badge Positioning for Small Screens**
- Current positioning is good ✓
- Ensure badges don't overlap on narrow cards

**h) Haptic Feedback on Quick Add**
```tsx
// In handleQuickAdd
if (navigator.vibrate) navigator.vibrate(10);
```
- Already implemented in useQuickAdd ✓

**Files Modified:** `ProductCard.tsx`

---

### 5. Inline Quick Size Picker (`InlineQuickSizePicker.tsx`)

#### Current Issues on Mobile
- Button sizes at `min-w-[36px] h-9` (36px) are borderline
- "Select Size" label is very small (`text-[9px]`)
- Remembered size badge at `text-[7px]` is tiny
- Low stock indicator dot is very small

#### Mobile Optimizations

**a) Size Button Touch Enhancement**
```text
Current: min-w-[36px] h-9 px-2
Proposed: min-w-[40px] md:min-w-[36px] h-10 md:h-9 px-2.5 md:px-2
```
- 40px height on mobile for WCAG compliance

**b) Label Size Increase**
```text
Current: text-[9px]
Proposed: text-[10px] md:text-[9px]
```

**c) "Yours" Badge Enhancement**
```text
Current: text-[7px]
Proposed: text-[8px] md:text-[7px]
```

**d) Low Stock Indicator Enhancement**
```text
Current: w-1 h-1 rounded-full
Proposed: w-1.5 h-1.5 md:w-1 md:h-1 rounded-full
```

**e) Container Padding**
```text
Current: p-2.5
Proposed: p-3 md:p-2.5
```

**Files Modified:** `InlineQuickSizePicker.tsx`

---

### 6. Quick View Modal (`QuickViewModal.tsx`)

#### Current Issues on Mobile
- **Critical**: Two-column grid doesn't work well on narrow screens
- Image at `aspect-square md:aspect-auto md:h-[500px]` clips content
- Close button at top-right may be hard to reach on large phones
- Size selector buttons don't have adequate spacing
- Quantity controls at `p-2` are small touch targets
- "View Full Details" link needs larger touch area

#### Mobile Optimizations

**a) Convert to Bottom Sheet on Mobile**
Consider using Drawer pattern for mobile:
```tsx
const isMobile = useIsMobile();

{isMobile ? (
  <Drawer open={open} onOpenChange={onClose}>
    <DrawerContent className="max-h-[90vh]">
      {/* Scrollable content */}
    </DrawerContent>
  </Drawer>
) : (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      {/* Current layout */}
    </DialogContent>
  </Dialog>
)}
```

**b) If Keeping Dialog, Stack Layout on Mobile**
```text
Current: grid md:grid-cols-2 gap-0
Proposed: flex flex-col md:grid md:grid-cols-2 gap-0
```
- Full-width image on top, info below on mobile
- Add max-height and scroll to content area

**c) Image Height Mobile Constraint**
```text
Current: aspect-square md:aspect-auto md:h-[500px]
Proposed: aspect-square md:aspect-auto md:h-[500px] max-h-[40vh] md:max-h-none
```
- Prevents image from dominating mobile viewport

**d) Close Button Position/Size Enhancement**
```text
Current: right-4 top-4 ... rounded-full
Proposed: right-3 top-3 md:right-4 md:top-4 w-10 h-10 md:w-auto md:h-auto
```
- Larger touch target on mobile

**e) Size Button Touch Enhancement**
```text
Current: px-4 py-2
Proposed: px-4 py-3 md:py-2 min-h-[44px] md:min-h-auto
```

**f) Color Swatch Touch Enhancement**
```text
Current: w-8 h-8 rounded-full
Proposed: w-10 h-10 md:w-8 md:h-8 rounded-full
```
- 40px on mobile for easier tapping

**g) Quantity Control Touch Enhancement**
```text
Current: p-2 hover:bg-muted/50
Proposed: p-3 md:p-2 min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto
```

**h) Add to Cart Button (Already 48px ✓)**
- Current `h-12` is perfect

**i) View Full Details Link Enhancement**
```text
Current: text-sm text-muted-foreground hover:text-foreground hover:underline
Proposed: text-sm ... inline-flex items-center min-h-[44px] py-2
```

**j) Favorite Button Enhancement**
- Current using FavoriteButton component
- Ensure touch target is adequate

**k) Safe Area for Scrollable Content**
```text
Add: pb-safe at bottom of scrollable content
```

**l) Image Navigation Arrows Enhancement**
```text
Current: h-8 w-8
Proposed: h-10 w-10 md:h-8 md:w-8
```

**m) Thumbnail Dots Enhancement**
```text
Current: w-2 h-2 rounded-full
Proposed: w-3 h-3 md:w-2 md:h-2 rounded-full
```

**Files Modified:** `QuickViewModal.tsx`

---

### 7. Cart Quantity Badge (`CartQuantityBadge.tsx`)

#### Current Issues on Mobile
- Badge variant is good ✓
- Controls variant buttons at `h-7 w-7` (28px) are small
- Text in controls is small

#### Mobile Optimizations

**a) Control Buttons Touch Enhancement**
```text
Current: h-7 w-7 p-0
Proposed: h-9 w-9 md:h-7 md:w-7 p-0
```
- 36px on mobile is borderline but acceptable given context

**b) Container Padding**
```text
Current: p-1
Proposed: p-1.5 md:p-1
```

**Files Modified:** `CartQuantityBadge.tsx`

---

### 8. Pagination (`Pagination.tsx`)

#### Current Issues on Mobile
- Page buttons at `min-w-8 h-8` (32px) are below 48px minimum
- Navigation arrows at `p-2` with small icon are small targets
- Spacing between elements is tight

#### Mobile Optimizations

**a) Page Button Touch Enhancement**
```text
Current: min-w-8 h-8
Proposed: min-w-10 h-10 md:min-w-8 md:h-8
```
- 40px on mobile for better tapping

**b) Navigation Arrow Touch Enhancement**
```text
Current: p-2 ... ChevronLeft className="h-4 w-4"
Proposed: p-3 md:p-2 ... ChevronLeft className="h-5 w-5 md:h-4 md:w-4"
```

**c) Gap Between Elements**
```text
Current: gap-2 for outer, gap-1 for pages
Proposed: gap-3 md:gap-2 for outer, gap-1.5 md:gap-1 for pages
```

**d) Ellipsis Spacing**
```text
Current: mx-2
This is acceptable ✓
```

**e) Container Padding**
```text
Current: px-6 py-8
Proposed: px-4 md:px-6 py-8
```

**Files Modified:** `Pagination.tsx`

---

### 9. PLP Testimonial Strip (`PLPTestimonialStrip.tsx`)

#### Current Issues on Mobile
- Quote at `text-lg md:text-xl` is good ✓
- Star icons at `w-4 h-4` are acceptable ✓
- CTA link needs larger touch target

#### Mobile Optimizations

**a) CTA Link Touch Enhancement**
```text
Current: inline-block mt-6 text-sm text-muted-foreground hover:text-foreground hover:underline
Proposed: inline-flex items-center min-h-[44px] px-2 py-2 -mx-2 mt-4 md:mt-6 text-sm ...
```

**b) Section Padding Mobile Optimization**
```text
Current: px-6 py-12 my-8
Proposed: px-4 md:px-6 py-10 md:py-12 my-6 md:my-8
```

**Files Modified:** `PLPTestimonialStrip.tsx`

---

### 10. Category Header (`CategoryHeader.tsx`)

#### Current Issues on Mobile
- Breadcrumb links need adequate touch targets
- Title at `text-3xl` on mobile is good ✓

#### Mobile Optimizations

**a) Breadcrumb Touch Enhancement**
```text
Current: Default shadcn breadcrumb
Proposed: Add py-2 to BreadcrumbLink for larger hit area
```

**b) Section Padding**
```text
Current: px-6 mb-8
Proposed: px-4 md:px-6 mb-6 md:mb-8
```

**Files Modified:** `CategoryHeader.tsx`

---

## Cross-Cutting Technical Optimizations

### A. Sticky Filter Bar Implementation

**Sticky Filter on Scroll (Mobile)**
```tsx
// In Category.tsx or FilterSortBar.tsx
const [isSticky, setIsSticky] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const heroHeight = document.querySelector('.collection-hero')?.getBoundingClientRect().bottom || 0;
    setIsSticky(heroHeight < 0);
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Apply to FilterSortBar container
<div className={cn(
  "transition-all duration-200",
  isSticky && "sticky top-[var(--header-height)] z-30 bg-background/95 backdrop-blur-sm shadow-sm"
)}>
  <FilterSortBar ... />
</div>
```

### B. Product Card Image Optimization

**Lazy Loading for Below-Fold Products**
```tsx
// Add loading="lazy" to ProductCard images after first 4
<img
  loading={index < 4 ? "eager" : "lazy"}
  fetchPriority={index < 2 ? "high" : "auto"}
  src={primaryImage.image_url}
  alt={product.name}
  ...
/>
```

### C. Scroll Restoration

**Preserve Scroll on Filter Changes**
```tsx
// In Category.tsx
useEffect(() => {
  // Save scroll position before filter
  const savedPosition = sessionStorage.getItem(`scroll-${categorySlug}`);
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition, 10));
    sessionStorage.removeItem(`scroll-${categorySlug}`);
  }
}, []);

// Before filter change
sessionStorage.setItem(`scroll-${categorySlug}`, window.scrollY.toString());
```

### D. Touch Feedback Consistency

**Tap Feedback on Product Cards**
```tsx
<Card
  className="... active:scale-[0.98] transition-transform duration-75"
>
```

### E. Mobile-Specific Empty State

**Condensed Empty State**
```tsx
{products.length === 0 ? (
  <div className={cn(
    "text-center py-12 md:py-16",
    "flex flex-col items-center gap-4"
  )}>
    <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center">
      <Search className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
    </div>
    <div>
      <p className="text-base md:text-lg text-muted-foreground mb-1 md:mb-2">No products found</p>
      <p className="text-sm text-muted-foreground">
        Try adjusting your filters
      </p>
    </div>
    <Button 
      variant="outline" 
      size="sm"
      className="min-h-[44px] mt-2"
      onClick={clearFilters}
    >
      Clear Filters
    </Button>
  </div>
) : (
  // Product grid
)}
```

---

## Accessibility Enhancements

### A. Filter State Announcements
```tsx
<div aria-live="polite" className="sr-only">
  {`Showing ${itemCount} products${activeFilterCount > 0 ? ` with ${activeFilterCount} filters applied` : ''}`}
</div>
```

### B. Product Card Focus States
- Ensure focus ring is visible on keyboard navigation
- Add `focus-visible:ring-2 focus-visible:ring-offset-2` to card links

### C. Size Picker Accessibility
- Already has aria-label ✓
- Ensure disabled state is announced

### D. Modal Focus Management
- Already using Radix Dialog ✓
- Ensure focus is trapped and returned on close

---

## Implementation Priority

### Phase 1: Critical Touch Targets (Immediate)
1. ProductCard always-visible mobile actions
2. Favorite button always visible on mobile
3. Quick Add/View button height increase
4. Pagination touch targets
5. QuickViewModal mobile layout

### Phase 2: Filter Experience (Week 1)
6. Filter chip touch targets
7. Filter sheet checkbox spacing
8. Sort dropdown touch target
9. Sticky filter bar on scroll
10. Clear filters button enhancement

### Phase 3: Quick View Optimization (Week 1)
11. Consider Drawer pattern for mobile
12. Size/color selector touch targets
13. Quantity controls enhancement
14. Navigation arrows/dots sizing

### Phase 4: Polish & Performance (Week 2)
15. Image lazy loading optimization
16. Scroll restoration on filter
17. Color swatch size increase
18. InlineQuickSizePicker button sizing
19. Empty state mobile optimization

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/pages/Category.tsx` | Sticky filter logic, scroll restoration |
| `src/components/category/CollectionHero.tsx` | Height reduction, dvh units, tagline size |
| `src/components/category/FilterSortBar.tsx` | Touch targets, sticky positioning, checkbox spacing |
| `src/components/category/ProductGrid.tsx` | Grid gap, padding, skeleton count |
| `src/components/category/ProductCard.tsx` | Always-visible actions, button sizes, color swatches |
| `src/components/category/QuickViewModal.tsx` | Mobile layout, touch targets, Drawer pattern |
| `src/components/category/Pagination.tsx` | Touch targets, arrow sizing, gap adjustment |
| `src/components/category/PLPTestimonialStrip.tsx` | CTA touch target, padding |
| `src/components/category/CategoryHeader.tsx` | Breadcrumb touch targets, padding |
| `src/components/category/CartQuantityBadge.tsx` | Control button sizing |
| `src/components/ui/InlineQuickSizePicker.tsx` | Button sizing, label sizing |

---

## Testing Matrix

### Device Coverage
- iPhone SE (375×667) - Smallest supported, 2-col grid stress test
- iPhone 14 (390×844) - Standard modern phone
- iPhone 14 Pro Max (430×932) - Large phone, reach considerations
- iPad Mini (768×1024) - Tablet grid transition

### Interaction Testing
- Quick Add one-tap flow on mobile
- Size picker appearance and selection
- Filter sheet open/close with keyboard
- QuickView modal scroll behavior
- Pagination navigation
- Cart quantity adjustment from grid

### Performance Testing
- Grid render time with 12+ products
- Image lazy loading effectiveness
- Filter application response time
- Scroll performance with sticky filter

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Product Card Touch Target (Quick Add) | ≥40px height |
| Filter Chip Touch Target | ≥36px height |
| Pagination Button Touch Target | ≥40px |
| Quick View Load Time | <200ms |
| Add to Cart Response | <100ms perceived |
| Products Visible Above Fold (Mobile) | ≥2 full cards |

---

## Non-Goals (Desktop Unchanged)

The following will NOT be modified:
- Any layout at `lg:` breakpoint and above
- Desktop typography sizes
- Desktop product grid columns
- Desktop hover interactions (image swap, button reveal)
- Desktop modal layout
- Desktop filter sheet width
- Desktop pagination spacing

All changes are scoped to screens under 1024px width, with mobile-first priority for screens under 768px.

