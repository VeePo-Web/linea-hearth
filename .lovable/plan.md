

# Accent Color System Upgrade -- From Tacky Amber to Royal Champagne

## The Problem

Every accent color across the site uses Tailwind's `amber-500` (#f59e0b) -- a bright, saturated yellow-orange that reads as cheap and unrefined. Meanwhile, the landing page already has the correct luxury palette:

- **Chrome/Silver** for "LINE OF JUDAH": a metallic gradient from white to mid-gray
- **Warm Champagne/Tan** for "glory" and "beauty": `hsla(45 55% 82%)` -- a soft, warm, golden-white

The goal: replace every amber accent with colors drawn from this landing page palette, making the entire site feel cohesive with the portal entrance.

---

## The New Color System

### Define custom Tailwind colors in `tailwind.config.ts`

Replace amber with a `champagne` color scale derived from the glory/beauty hue (`hsl(45, 55%, 82%)`):

```text
champagne-50:  hsl(45, 40%, 96%)   -- barely-there warm tint (light bg tints)
champagne-100: hsl(45, 40%, 90%)   -- subtle warm (hover states on white)
champagne-200: hsl(45, 45%, 82%)   -- the glory/beauty color itself (text on dark)
champagne-300: hsl(45, 40%, 72%)   -- slightly richer (eyebrows, accents on dark)
champagne-400: hsl(45, 35%, 62%)   -- mid-tone (badges, solid backgrounds)
champagne-500: hsl(45, 30%, 52%)   -- the new "primary accent" (buttons, key CTAs)
champagne-600: hsl(45, 30%, 42%)   -- hover state for buttons
champagne-700: hsl(45, 25%, 35%)   -- text accent on white backgrounds
champagne-800: hsl(45, 20%, 28%)   -- deep bronze
champagne-900: hsl(45, 15%, 15%)   -- near-black warm
```

This gives a warm, muted, royal gold that matches the landing page's champagne glow -- never bright, never "sale tag yellow."

### Update CSS `--accent` variable

In `src/index.css`, change:
- `--accent: 36 92% 50%` to `--accent: 45 30% 52%` (champagne-500)

---

## Replacement Strategy

### Category 1: Text Accents on Dark Backgrounds (eyebrows, highlighted words, section numbers)
- `text-amber-500` becomes `text-champagne-300`
- `text-amber-400` becomes `text-champagne-200`
- These are the most visible changes -- eyebrows, period accents, scripture references

### Category 2: Solid Background Buttons/CTAs
- `bg-amber-500` becomes `bg-champagne-500`
- `bg-amber-400` (hover) becomes `bg-champagne-400`
- `bg-amber-600` (hover) becomes `bg-champagne-600`
- Button text stays `text-stone-900` or `text-white` depending on contrast

### Category 3: Decorative Elements (borders, dividers, dots)
- `border-amber-500` becomes `border-champagne-400`
- `bg-amber-500/XX` opacity variants become `bg-champagne-400/XX`

### Category 4: Interactive States (remembered size, active filters)
- `bg-amber-500/10` becomes `bg-champagne-400/10`
- `border-amber-500/50` becomes `border-champagne-400/50`

### Category 5: Star Ratings and Reviews
- `fill-amber-500 text-amber-500` becomes `fill-champagne-400 text-champagne-400`

### Category 6: Functional/Warning Amber (KEEP AS-IS)
- `FlashSaleTimer.tsx` urgency states -- keep amber for urgency semantics
- `UrgencyTimer.tsx` -- keep amber
- `LegalSection.tsx` warning callouts -- keep amber (these are warnings)
- Admin dashboard indicators -- keep amber

---

## Files to Modify (Grouped by Area)

### Config (1 file)
1. `tailwind.config.ts` -- add `champagne` color scale

### CSS Variables (1 file)
2. `src/index.css` -- update `--accent` and `--sidebar-ring`

### About Page (9 files)
3. `src/components/about/StoryCallingSection.tsx`
4. `src/components/about/OriginStory.tsx`
5. `src/components/about/FounderLetter.tsx`
6. `src/components/about/StoryValuesGrid.tsx`
7. `src/components/about/StoryWorldwideTribe.tsx`
8. `src/components/about/StoryJoinCTA.tsx`
9. `src/components/about/BrandFilmHero.tsx`
10. `src/components/about/ValuesPillars.tsx`
11. `src/pages/about/OurStory.tsx` (divider lines)

### Homepage (6 files)
12. `src/components/homepage/HeroBlock.tsx`
13. `src/components/homepage/EmailOptIn.tsx`
14. `src/components/homepage/ReviewsCarousel.tsx`
15. `src/components/homepage/ProductGridTeaser.tsx`
16. `src/components/homepage/MobileStickyBar.tsx`
17. `src/components/homepage/SecondaryCTAStrip.tsx`

### Footer (2 files)
18. `src/components/footer/Footer.tsx`
19. `src/components/footer/FooterEmailCapture.tsx`

### Header/Nav (2 files)
20. `src/components/header/Navigation.tsx`
21. `src/components/header/SearchOverlay.tsx`

### Product/Category (3 files)
22. `src/components/category/ProductCard.tsx`
23. `src/components/category/PLPTestimonialStrip.tsx`
24. `src/components/product/SizeSelector.tsx`

### Cart (5 files)
25. `src/components/cart/BundleProgress.tsx`
26. `src/components/cart/FreeShippingBar.tsx`
27. `src/components/cart/ThresholdUpsellCard.tsx`
28. `src/components/cart/BundleSavingsRow.tsx`
29. `src/components/cart/MissingProductCard.tsx`

### Checkout (3 files)
30. `src/components/checkout/OrderStatsBadge.tsx`
31. `src/components/checkout/PostPurchaseOffer.tsx`
32. `src/components/checkout/PostPurchaseSignup.tsx`

### Community (6 files)
33. `src/components/community/SubmitStoryCTA.tsx`
34. `src/components/community/StoryModal.tsx`
35. `src/components/community/StoryGrid.tsx`
36. `src/components/community/StoryCard.tsx`
37. `src/components/community/StoryFilters.tsx`
38. `src/components/community/SubmitStoryModal.tsx`
39. `src/components/community/SocialFeed.tsx`

### Lookbook (7 files)
40. `src/components/lookbook/ShopTheLook.tsx`
41. `src/components/lookbook/LookbookHero.tsx`
42. `src/components/lookbook/LookSection.tsx`
43. `src/components/lookbook/LookNavigationMobile.tsx`
44. `src/components/lookbook/LookNavigation.tsx`
45. `src/components/lookbook/FitGuideSection.tsx`
46. `src/components/lookbook/FitGuideModal.tsx`
47. `src/components/lookbook/SwipeLookbook.tsx`

### Service Pages (4 files)
48. `src/components/service/StepFlow.tsx`
49. `src/components/service/ActionCTA.tsx`
50. `src/components/service/ServiceSidebar.tsx`
51. `src/components/service/ServiceHero.tsx`
52. `src/components/service/InfoCard.tsx`

### Other Pages (3 files)
53. `src/pages/FAQ.tsx`
54. `src/pages/ShippingInfo.tsx`
55. `src/components/accessibility/DeclarationBlock.tsx`

### Homepage hover states (2 files)
56. `src/components/homepage/FeaturedCollection.tsx`
57. `src/components/homepage/TestimonySpotlight.tsx`

### Explicitly EXCLUDED (keep amber for functional/warning use)
- `src/components/product/FlashSaleTimer.tsx` -- urgency indicator
- `src/components/checkout/UrgencyTimer.tsx` -- time-pressure warning
- `src/components/legal/LegalSection.tsx` -- legal warning callout
- `src/pages/admin/*` -- admin dashboard indicators

---

## Implementation Order

1. **tailwind.config.ts** -- add champagne color scale (everything depends on this)
2. **src/index.css** -- update CSS variables
3. **About page components** -- highest visibility, most recently worked on
4. **Homepage components** -- second highest traffic
5. **Footer + Header** -- site-wide elements
6. **All remaining components** in batches

---

## What Does NOT Change

- No words, no copy, no content
- No layout, spacing, structure, or component architecture
- No images or assets
- No functional behavior
- Warning/urgency amber stays amber (semantic color)
- The landing page itself stays exactly as-is (it already has the right colors)

Total: ~55 files modified, all class-name-only swaps after the initial config change.

