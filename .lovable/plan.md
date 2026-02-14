

# Fix Plan: Language, Currency, and Date Updates

## 3 Issues to Fix

### Issue 1: Replace all "comfort" language with warfare/conviction language

The brand identity is spiritual warfare, not comfort. The following files need updates:

**File: `src/components/content/FiftyFiftySection.tsx` (line 22)**
- Current: "Premium comfort with bold faith statements"
- Replace: "Premium armor for bold faith statements"

**File: `src/components/product/ProductDescription.tsx` (lines 46-54)**
- Current: "The relaxed fit offers all-day comfort while the bold design sparks meaningful conversations."
- Replace: "Built to move with you and stand out. The bold design sparks meaningful conversations."
- Current: "...feels substantial yet comfortable. Pre-shrunk..."
- Replace: "...feels substantial and durable. Pre-shrunk..."
- Current (line 189): "Super comfortable and the fit is perfect..."
- Replace: "The quality is unmatched and the fit is perfect..."

**File: `src/components/product/ProductFAQ.tsx` (lines 28-31)**
- Current: "...both comfortable and durable. It's been pre-washed for softness."
- Replace: "...both durable and premium. It's been pre-washed for a broken-in feel."
- Current: "...soft, breathable feel...It's designed for all-day comfort."
- Replace: "...durable, breathable feel that gets even better with each wash. Built to last."

**File: `src/components/product/FitFabricSection.tsx` (line 60)**
- Current: "Soft, breathable, durable"
- Replace: "Durable, breathable, built to last"

**File: `src/components/product/ProductReviews.tsx` (line 82)**
- Current: "Comfortable fit"
- Replace: "Built right"

**File: `src/components/homepage/ReviewsCarousel.tsx` (line 35)**
- Current: "...modern, comfortable, and make a bold statement."
- Replace: "...modern, built to last, and make a bold statement."

**File: `src/components/lookbook/FitGuideSection.tsx` (lines 89, 145)**
- Current: "...for comfortable layering" / "...for comfortable oversized styling"
- Replace: "...for layered looks" / "...for oversized styling"

**File: `src/components/size-guide/SizeQuizModal.tsx` (line 80)**
- Current: "Comfortable, slightly loose"
- Replace: "Easy movement, slightly loose"

**File: `src/pages/about/SizeGuide.tsx` (line 35)**
- Current: "Natural waist, not belt line. Snug but comfortable."
- Replace: "Natural waist, not belt line. Snug but not restrictive."

**File: `src/components/ambassador/AmbassadorRequirements.tsx` (line 14)**
- Current: "You're not comfortable sharing your faith publicly"
- Replace: "You're not ready to share your faith publicly"

---

### Issue 2: Change all EUR currency references to CAD

Despite the memory note saying CAD was implemented, 6 locations still use "eur":

**File: `supabase/functions/create-checkout-session/index.ts`**
- Lines 289, 340, 360, 410, 447: Change `"eur"` to `"cad"`

**File: `supabase/functions/create-payment-intent/index.ts`**
- Lines 282, 310: Change `"eur"` to `"cad"`

**File: `supabase/functions/send-order-confirmation/index.ts`**
- Line 43: Change default `"eur"` to `"cad"`

**File: `src/hooks/useExpressPay.ts`**
- Line 74: Change `"eur"` to `"cad"`, also change `country: "US"` to `country: "CA"` (line 73)

---

### Issue 3: "Summer 2024" reference

No "Summer 2024" text was found in the codebase. The only "Summer" reference is in `AdminDiscounts.tsx` as a placeholder example ("Summer Sale") which is just form placeholder text -- not displayed to users.

If you have a specific page where you saw "Summer 2024", let me know and I can track it down. It may be stored in the database (e.g., a product description or discount code name).

---

## Implementation Summary

| Area | Files Changed | Risk Level |
|------|--------------|------------|
| Comfort language removal | 10 frontend files | Low -- copy changes only |
| EUR to CAD | 3 edge functions + 1 hook | Medium -- affects payments |
| Edge functions | Redeploy after changes | Required |

## Deployment Order

1. Update all comfort language across frontend files (parallel, no dependencies)
2. Update all EUR to CAD in edge functions and hooks (parallel)
3. Deploy edge functions: `create-checkout-session`, `create-payment-intent`, `send-order-confirmation`
4. Test a checkout flow to verify CAD is applied correctly

