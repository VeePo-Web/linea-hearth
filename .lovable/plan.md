

# Champagne Color Upgrade -- Remaining Files (Phase 2)

The first pass updated ~50 files but missed many others. This phase completes the amber-to-champagne migration across every remaining file.

---

## Files to Update (Grouped)

### About Page (3 files still have amber)
1. **`src/components/about/ImpactMap.tsx`** -- 5 instances: stat suffix color, eyebrow, map dots, city dots
2. **`src/components/about/StoryCommunityStats.tsx`** -- 2 instances: eyebrow text, period accent
3. **`src/components/about/ScrollProgress.tsx`** -- 1 instance: scroll bar fill color

### Navigation (1 file)
4. **`src/components/header/FullScreenNav.tsx`** -- hover/focus state on nav links (`hover:text-amber-700`, `focus-visible:text-amber-700`)

### Checkout (2 files)
5. **`src/components/checkout/OrderStatsBadge.tsx`** -- flame icon color
6. **`src/components/checkout/MissionStrip.tsx`** -- gem icon color
7. **`src/components/checkout/OrderConfirmation.tsx`** -- ping animation border color (decorative, swap to champagne)

### Service Pages (2 files)
8. **`src/components/service/ServiceHero.tsx`** -- eyebrow text, value prop icon color, search ring color
9. **`src/components/service/ServiceSidebar.tsx`** -- active sidebar link border/bg, contact link colors

### FAQ (2 files)
10. **`src/pages/FAQ.tsx`** -- "CONTACT COMMAND" button bg/hover
11. **`src/components/faq/FAQAccordionGroup.tsx`** -- search highlight mark bg color
12. **`src/components/faq/AskUsModal.tsx`** -- email link color

### Shipping (2 files)
13. **`src/pages/ShippingInfo.tsx`** -- accent badge text color for overnight option
14. **`src/components/shipping/ShippingCalculator.tsx`** -- order-by message text color

### Category (1 file)
15. **`src/components/category/CollectionHero.tsx`** -- gradient backgrounds using amber tones (swap to champagne-equivalent warm tones)

### Accessibility (1 file)
16. **`src/pages/Accessibility.tsx`** -- report link color, focus ring, try-on link color

### Contact (1 file)
17. **`src/components/contact/ContactForm.tsx`** -- priority flag border/bg

### Lookbook (1 file)
18. **`src/components/lookbook/SwipeableLookCard.tsx`** -- bundle badge, size picker active state, apply button

### Size Guide (1 file)
19. **`src/components/size-guide/SizeChartTable.tsx`** -- popular row highlight bg, popular badge bg

### Email Typo (1 file)
20. **`src/components/ui/EmailTypoSuggestion.tsx`** -- all amber colors in suggestion box (bg, border, text, hover)

### Accessibility Declaration (1 file)
21. **`src/components/accessibility/DeclarationBlock.tsx`** -- gradient bg accent, quote mark color

### Other scattered files with amber
22. Various product/cart/community components that may have been partially missed

---

## Replacement Rules (same as Phase 1)

| Current | Replacement | Context |
|---------|------------|---------|
| `text-amber-500` | `text-champagne-500` | Accent text on dark bg |
| `text-amber-600` | `text-champagne-600` | Accent text on light bg |
| `text-amber-700` | `text-champagne-700` | Hover states on light bg |
| `text-amber-400` | `text-champagne-300` | Lighter accent text |
| `bg-amber-500` | `bg-champagne-500` | Solid accent backgrounds |
| `bg-amber-600` | `bg-champagne-600` | Hover backgrounds |
| `bg-amber-500/XX` | `bg-champagne-500/XX` | Transparent accent bg |
| `border-amber-500` | `border-champagne-500` | Accent borders |
| `ring-amber-500` | `ring-champagne-500` | Focus rings |
| `bg-amber-50` | `bg-champagne-50` | Light highlight rows |
| `bg-amber-200` | `bg-champagne-200` | Search highlight marks |
| `bg-amber-800` | `bg-champagne-800` | Dark mode highlights |
| `bg-amber-950` | `bg-champagne-900` | Dark mode subtle bg |
| `from-amber-*` | `from-champagne-*` | Gradient starts |
| `to-amber-*` | `to-champagne-*` | Gradient ends |

## Explicitly EXCLUDED (keep amber)
- `src/components/product/FlashSaleTimer.tsx` -- urgency/warning
- `src/components/checkout/UrgencyTimer.tsx` -- urgency/warning
- `src/components/try-on/SizeRecommendation.tsx` -- confidence meter (semantic: green/amber/red)
- `src/pages/admin/*` -- admin dashboard

---

## Implementation Order

1. About page remaining files (ImpactMap, StoryCommunityStats, ScrollProgress)
2. Navigation (FullScreenNav)
3. Service pages (ServiceHero, ServiceSidebar)
4. FAQ + AskUsModal
5. Shipping pages
6. All other remaining files
7. Final grep verification to confirm zero non-exempt amber references remain

