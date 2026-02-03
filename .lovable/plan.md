

# World-Class Mobile Experience Optimization Plan
## FAQ Page — Section-by-Section Engineering

---

## Executive Summary

This plan transforms the FAQ page into a world-class mobile experience while **preserving the desktop design exactly as-is**. The FAQ page presents unique mobile challenges: category navigation that requires horizontal scrolling, accordion interactions that need generous touch targets, search functionality that must work seamlessly with mobile keyboards, and a modal form that needs to respect safe areas. Every modification uses mobile-specific CSS (via Tailwind's responsive prefixes) or conditional rendering with the existing `useIsMobile()` hook.

---

## Current State Analysis

### Page Architecture
```text
FAQ.tsx
├── ServicePageLayout (wrapper)
│   ├── ServiceHero (title + search)
│   ├── Main Content Area
│   │   ├── FAQCategoryTabs (horizontal scroll categories)
│   │   ├── FAQAccordionGroup (expandable Q&A items)
│   │   ├── NoResultsState (empty search state)
│   │   └── ActionCTA (contact card)
│   └── AskUsModal (form dialog)
└── ServiceSidebar (hidden on mobile ✓)
```

### Current Mobile Observations
1. **Category Tabs**: Already has `-mx-6 px-6` for edge-to-edge scroll but lacks scroll snap and touch optimization
2. **Accordion Items**: Touch targets at `py-5` (~40px) are below 48px minimum; `px-6` padding is good
3. **Search Bar**: `h-14` (56px) is excellent for mobile; keyboard handling needs enhancement
4. **Dialog Modal**: Uses centered positioning which can clip on small screens with keyboard
5. **ServiceSidebar**: Already `hidden lg:block` — mobile handled ✓
6. **ActionCTA**: Padding and button sizing need touch optimization

---

## Section-by-Section Implementation

### 1. ServiceHero with Search (`ServiceHero.tsx`)

#### Current Issues on Mobile
- Hero padding `pt-[calc(var(--header-height)+2rem)]` is correct ✓
- Title at `text-4xl` (36px) on mobile is good but could use slight reduction
- Search input `h-14` is perfect ✓
- No visual feedback when search is active
- Keyboard may obscure content below search

#### Mobile Optimizations

**a) Title Typography Refinement**
```text
Current: text-4xl md:text-5xl lg:text-6xl
Proposed: text-3xl xs:text-4xl md:text-5xl lg:text-6xl
```
- Smaller headline on tiny phones (320px) prevents text wrapping

**b) Search Focus Enhancement**
- Add visual state change when search is focused
- Reduce motion distractions while typing
- Consider `scroll-mt` to ensure search stays visible above keyboard

**c) Search Input Mobile Keyboard Optimization**
```tsx
<Input
  type="search"      // Use search type for mobile keyboard
  inputMode="search" // Trigger search keyboard
  enterKeyHint="search" // Show search on enter key
  autoComplete="off" // Prevent autocomplete popover
  autoCorrect="off"  // Disable autocorrection for search
  spellCheck={false} // Disable spellcheck
/>
```

**d) Clear Search Button Enhancement**
- Add X button to clear search on mobile (currently missing)
- Position absolutely within input for one-tap clear

**Files Modified:** `ServiceHero.tsx`

---

### 2. FAQ Category Tabs (`FAQCategoryTabs.tsx`)

#### Current Issues on Mobile
- Touch targets at `px-4 py-2` (~32px height) are below 48px minimum
- Horizontal scroll exists but no snap points
- No visual scroll indicator for additional categories
- Active state uses dark fill which is correct ✓
- Categories may wrap text on tiny screens

#### Mobile Optimizations

**a) Touch Target Expansion**
```text
Current: px-4 py-2 → ~32px height
Proposed: px-4 py-3 md:py-2 → 44px height on mobile
```

**b) Scroll Snap Implementation**
```tsx
<div className="scroll-snap-x-proximity overflow-x-auto pb-2 scrollbar-hide">
  {categories.map((category) => (
    <button className="scroll-snap-start ...">
```

**c) Scroll Fade Indicator**
- Add `scroll-fade-right` class to indicate more content
- Use relative positioning wrapper with overflow hidden

**d) Category Label Truncation Prevention**
```text
Current: whitespace-nowrap ✓
Additional: Add text-[10px] xs:text-xs for tiny screens
```

**e) Active Category Scroll-Into-View**
- When category changes, scroll active tab into view
- Use `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`

**f) Haptic Feedback on Category Tap**
```tsx
onClick={() => {
  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(10);
  onCategoryChange(category.id);
}}
```

**Files Modified:** `FAQCategoryTabs.tsx`

---

### 3. FAQ Accordion Group (`FAQAccordionGroup.tsx`)

#### Current Issues on Mobile
- Accordion trigger `py-5` is ~40px, below 48px minimum
- `px-6` padding is good for mobile ✓
- Chevron icon is small (`h-4 w-4`) for touch
- Answer text `leading-relaxed` is good ✓
- Long questions may crowd the chevron

#### Mobile Optimizations

**a) Touch Target Enhancement for Accordion Triggers**
```text
Current: py-5 → ~40px
Proposed: py-6 md:py-5 → 48px on mobile
```

**b) Question/Chevron Spacing**
```text
Current: pr-4 on question span
Proposed: pr-6 md:pr-4 for more breathing room on mobile
```

**c) Accordion Item Spacing**
```text
Current: space-y-2
Proposed: space-y-3 md:space-y-2 for easier thumb navigation
```

**d) Answer Typography Mobile Enhancement**
```text
Current: text-muted-foreground font-light leading-relaxed pb-6
Proposed: Add text-base md:text-sm for better readability
```

**e) Expand Animation Mobile Optimization**
- Verify accordion animation respects `prefers-reduced-motion`
- Animation already uses Radix primitives which handle this ✓

**f) Keyboard Highlight Background**
- Current `data-[state=open]:bg-stone-50` is subtle ✓
- Add `active:bg-stone-50` for mobile tap feedback

**Files Modified:** `FAQAccordionGroup.tsx`

---

### 4. No Results State (`NoResultsState` in FAQ.tsx)

#### Current Issues on Mobile
- Icon container at `w-16 h-16` is good ✓
- Button touch target needs verification
- Padding `py-16` may push content off-screen on small phones
- Search query in message may be long

#### Mobile Optimizations

**a) Vertical Padding Reduction on Mobile**
```text
Current: py-16
Proposed: py-12 md:py-16
```

**b) Search Query Truncation**
```tsx
<p className="... max-w-md mx-auto">
  Your search for "<span className="font-medium truncate max-w-[200px] inline-block align-bottom">{searchQuery}</span>" ...
</p>
```

**c) Button Touch Target Verification**
- Current button uses shadcn Button which should be 44px+ ✓
- Ensure `min-h-[48px]` class is applied

**Files Modified:** `FAQ.tsx` (NoResultsState component)

---

### 5. Action CTA (`ActionCTA.tsx`)

#### Current Issues on Mobile
- Padding `p-8 md:p-12` is good ✓
- Button uses `h-auto py-3` which may be borderline for touch
- Footer text spacing could be tighter on mobile
- Email link is small touch target

#### Mobile Optimizations

**a) Button Touch Target Enforcement**
```text
Current: h-auto py-3
Proposed: min-h-[48px] py-3 md:h-auto
```

**b) Footer Email Link Enhancement**
```tsx
<a 
  href={link.href}
  className="text-amber-400 hover:underline inline-flex items-center min-h-[44px]"
>
  {link.text}
</a>
```

**c) Mobile-First Layout**
```text
Current: flex-col sm:flex-row gap-4
This is correct for mobile-first ✓
```

**d) Title Typography Mobile Refinement**
```text
Current: text-2xl md:text-3xl
Proposed: text-xl xs:text-2xl md:text-3xl for tiny screens
```

**Files Modified:** `ActionCTA.tsx`

---

### 6. Ask Us Modal (`AskUsModal.tsx`)

#### Current Issues on Mobile
- Dialog uses centered positioning which can clip with keyboard
- Form inputs at `h-12` (48px) are perfect ✓
- Textarea resize disabled is correct ✓
- Submit button at `h-12` is perfect ✓
- Modal close button is small (`h-4 w-4`)
- Email link in footer is small touch target

#### Mobile Optimizations

**a) Convert Dialog to Bottom Sheet on Mobile**
```tsx
const isMobile = useIsMobile();

// Use Drawer component on mobile for better ergonomics
{isMobile ? (
  <Drawer open={isOpen} onOpenChange={onClose}>
    <DrawerContent className="px-6 pb-safe">
      {/* Form content */}
    </DrawerContent>
  </Drawer>
) : (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      {/* Form content */}
    </DialogContent>
  </Dialog>
)}
```

**b) If Keeping Dialog, Add Safe Area Support**
```tsx
<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto pb-safe">
```

**c) Input Keyboard Types**
```tsx
<Input
  id="email"
  type="email"
  inputMode="email"
  autoComplete="email"
  enterKeyHint="next"
  className="h-12"
/>

<Input
  id="orderNumber"
  type="text"
  inputMode="text"
  autoComplete="off"
  enterKeyHint="next"
  className="h-12"
/>

<Textarea
  id="question"
  enterKeyHint="send"
  className="resize-none min-h-[120px]"
/>
```

**d) Close Button Touch Target**
```tsx
<DialogPrimitive.Close className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center ...">
  <X className="h-5 w-5" />
</DialogPrimitive.Close>
```

**e) Email Footer Link Touch Target**
```tsx
<a 
  href="mailto:hello@lineofjudah.com" 
  className="text-amber-600 hover:underline inline-flex items-center min-h-[44px] px-2 -mx-2"
>
  hello@lineofjudah.com
</a>
```

**f) Form Submission Loading State**
- Current "Sending..." text is good ✓
- Add subtle spinner for visual feedback

**Files Modified:** `AskUsModal.tsx`, possibly `dialog.tsx` for close button sizing

---

### 7. Service Section Headers (`ServiceSection.tsx`)

#### Current Issues on Mobile
- Section title `text-2xl` is good ✓
- Border bottom `border-b` creates nice separation ✓
- Scroll margin `scroll-mt-24` may need adjustment for mobile header

#### Mobile Optimizations

**a) Scroll Margin for Mobile Header**
```text
Current: scroll-mt-24
Proposed: scroll-mt-28 md:scroll-mt-24 (account for taller mobile touch)
```

**b) Title Sizing for Grouped FAQ Sections**
```text
No change needed - text-2xl works well ✓
```

**Files Modified:** `ServiceSection.tsx`

---

### 8. Service Page Layout (`ServicePageLayout.tsx`)

#### Current Issues on Mobile
- Main padding `py-16` is generous ✓
- Sidebar already `hidden lg:block` ✓
- Grid layout correctly switches to single column ✓

#### Mobile Optimizations

**a) Main Padding Mobile Reduction**
```text
Current: py-16
Proposed: py-10 md:py-16 for more content above fold
```

**b) Safe Area Bottom for iOS**
```text
Current: None
Proposed: Add pb-safe to main element
```

**Files Modified:** `ServicePageLayout.tsx`

---

## Cross-Cutting Technical Optimizations

### A. Search Experience Enhancements

**Debounced Search with Loading State**
```tsx
const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

// Show subtle loading indicator while debouncing
{searchQuery !== debouncedSearch && (
  <span className="absolute right-4 top-1/2 -translate-y-1/2">
    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
  </span>
)}
```

**Clear Search Button**
```tsx
{searchQuery && (
  <button
    onClick={() => onSearchChange('')}
    className="absolute right-4 top-1/2 -translate-y-1/2 touch-target text-muted-foreground hover:text-foreground"
    aria-label="Clear search"
  >
    <X className="w-5 h-5" />
  </button>
)}
```

### B. Keyboard Handling

**Scroll Search Into View on Focus**
```tsx
const searchRef = useRef<HTMLInputElement>(null);

const handleSearchFocus = () => {
  // Delay to allow keyboard to appear
  setTimeout(() => {
    searchRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }, 300);
};
```

### C. Category Persistence

**Remember Last Viewed Category**
```tsx
// On category change
useEffect(() => {
  localStorage.setItem('faq-category', activeCategory);
}, [activeCategory]);

// On mount
useEffect(() => {
  const saved = localStorage.getItem('faq-category');
  if (saved && categories.some(c => c.id === saved)) {
    setActiveCategory(saved);
  }
}, []);
```

### D. Accordion Deep Linking

**URL Hash for Direct FAQ Access**
```tsx
// On mount, check for hash
useEffect(() => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const faq = faqData.find(f => f.id === hash);
    if (faq) {
      setActiveCategory(faq.category);
      // Scroll to and open accordion
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center' 
        });
      }, 100);
    }
  }
}, []);
```

---

## Accessibility Enhancements

### A. Search Announcements
```tsx
<div aria-live="polite" className="sr-only">
  {filteredFAQs.length === 0 
    ? `No results found for ${searchQuery}` 
    : `${filteredFAQs.length} questions found`}
</div>
```

### B. Category Tab ARIA Roles
```tsx
<div role="tablist" aria-label="FAQ categories">
  {categories.map((category) => (
    <button
      role="tab"
      aria-selected={activeCategory === category.id}
      aria-controls={`faq-panel-${category.id}`}
      ...
    >
```

### C. Accordion Keyboard Navigation
- Already handled by Radix Accordion ✓
- Ensure focus ring is visible (using existing `:focus-visible` styles)

---

## Implementation Priority

### Phase 1: Critical Touch Targets (Immediate)
1. FAQCategoryTabs touch target expansion (py-3)
2. FAQAccordionGroup touch target expansion (py-6)
3. ActionCTA button touch target (min-h-[48px])
4. AskUsModal close button sizing

### Phase 2: Experience Polish (Week 1)
5. Category tabs scroll snap and fade indicator
6. Search clear button addition
7. Search input keyboard optimization
8. Category scroll-into-view on change

### Phase 3: Modal Optimization (Week 1)
9. Consider Drawer pattern for mobile modal
10. Form input keyboard types
11. Safe area handling

### Phase 4: Advanced Features (Week 2)
12. Category persistence in localStorage
13. Accordion deep linking via URL hash
14. Search result announcements for screen readers
15. Debounced search with loading indicator

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/pages/FAQ.tsx` | NoResultsState padding, aria-live regions, category persistence |
| `src/components/faq/FAQCategoryTabs.tsx` | Touch targets, scroll snap, fade indicator, haptics |
| `src/components/faq/FAQAccordionGroup.tsx` | Touch targets, spacing, tap feedback |
| `src/components/faq/AskUsModal.tsx` | Drawer pattern, keyboard types, close button, safe areas |
| `src/components/service/ServiceHero.tsx` | Search clear button, keyboard optimization, typography |
| `src/components/service/ServiceSection.tsx` | Scroll margin adjustment |
| `src/components/service/ServicePageLayout.tsx` | Mobile padding, safe area |
| `src/components/service/ActionCTA.tsx` | Touch targets, typography |

---

## Testing Matrix

### Device Coverage
- iPhone SE (375×667) - Smallest supported
- iPhone 14 (390×844) - Standard modern
- iPhone 14 Pro Max (430×932) - Large phone
- iPad Mini (768×1024) - Tablet breakpoint

### Interaction Testing
- Category tab scrolling and snap
- Accordion open/close tap targets
- Search input with keyboard
- Modal/Drawer appearance with keyboard
- Form submission flow
- Deep link to specific FAQ

### Accessibility Testing
- Screen reader navigation through categories
- Accordion keyboard navigation
- Search result announcements
- Focus management in modal

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Category Tab Touch Target | ≥44px height |
| Accordion Trigger Touch Target | ≥48px height |
| Search to First Result | <500ms |
| Modal Open Time | <200ms |
| FAQ Answer Readability | 16px+ font on mobile |

---

## Non-Goals (Desktop Unchanged)

The following will NOT be modified:
- Any layout at `lg:` breakpoint and above
- Desktop typography sizes
- Desktop accordion spacing
- Desktop modal behavior
- Desktop sidebar navigation
- Desktop search placement

All changes are scoped to screens under 1024px width, with mobile-first priority for screens under 768px.

