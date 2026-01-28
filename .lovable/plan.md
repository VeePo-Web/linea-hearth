
# CAD Dollar Currency Conversion - Premium Implementation Blueprint

## Executive Summary

This implementation converts ALL pricing display across the LINEA e-commerce platform from the current mixed EUR/USD system to unified **CAD (Canadian Dollars)** with proper `$` symbol formatting. This affects **45+ files** across frontend components, hooks, edge functions, and copy/content.

---

## Current State Audit

### Identified Currency Inconsistencies

The codebase currently has a **critical inconsistency**:

| Location | Current Currency | Symbol |
|----------|------------------|--------|
| `cartUtils.ts` formatPrice | USD | `$` |
| `ProductCard.tsx` formatPrice | USD | `$` |
| `ProductInfo.tsx` | USD | `$69.99` |
| `FeaturedDrop.tsx` | USD | `$65` |
| `ProductCarousel.tsx` | Hardcoded USD | `$65`, `$85` |
| `CartDrawer.tsx` | EUR | `€` |
| `FreeShippingBar.tsx` | EUR | `€` |
| `Checkout.tsx` | EUR | `€` |
| `OrderDetail/Dashboard` | EUR | `€` |
| `Try-On components` | EUR | `€` |
| `StatusBar.tsx` | EUR | `€50` |
| Edge Functions | EUR | `currency: "eur"` |
| Database `orders.currency` | EUR | `'eur'` default |
| Shipping thresholds | Mixed | `€150`, `$75+` |

**This creates customer confusion and must be unified to CAD.**

---

## Implementation Architecture

```text
                    CURRENCY SYSTEM REFACTOR
 ──────────────────────────────────────────────────────────

 ┌─────────────────────────────────────────────────────────┐
 │              src/lib/currency.ts (NEW)                  │
 │  ─────────────────────────────────────────────────────  │
 │  export const CURRENCY = {                              │
 │    code: 'CAD',                                         │
 │    symbol: '$',                                         │
 │    locale: 'en-CA',                                     │
 │    freeShippingThreshold: 99,  // $99 CAD               │
 │  };                                                     │
 │                                                         │
 │  export function formatPrice(price: number): string {   │
 │    return new Intl.NumberFormat('en-CA', {              │
 │      style: 'currency',                                 │
 │      currency: 'CAD',                                   │
 │    }).format(price);                                    │
 │  }                                                      │
 │  // Output: "$69.99" (proper CAD formatting)            │
 └─────────────────────────────────────────────────────────┘
                          │
                          ▼
 ┌─────────────────────────────────────────────────────────┐
 │           All Components Import From Here               │
 │  ─────────────────────────────────────────────────────  │
 │  import { formatPrice, CURRENCY } from '@/lib/currency' │
 └─────────────────────────────────────────────────────────┘
```

---

## Files Requiring Changes

### TIER 1: Core Currency Infrastructure (Critical Path)

| File | Change Type | Details |
|------|-------------|---------|
| `src/lib/currency.ts` | **NEW** | Central currency config + formatPrice function |
| `src/lib/cartUtils.ts` | UPDATE | Replace formatPrice with import from currency.ts |
| `src/hooks/useCart.tsx` | UPDATE | Change `FREE_SHIPPING_THRESHOLD = 99` (CAD), update comments |

### TIER 2: Cart & Checkout (High Visibility)

| File | Lines | Current | Change To |
|------|-------|---------|-----------|
| `src/components/cart/CartDrawer.tsx` | 437-441 | `€{subtotal.toLocaleString('en-EU'...)}` | `${formatPrice(subtotal)}` |
| `src/components/cart/FreeShippingBar.tsx` | 148, 159 | `€{amountToFreeShipping...}` | `${formatPrice(amountToFreeShipping)}` |
| `src/components/cart/BundleSavingsRow.tsx` | 65 | `-€{totalBundleSavings...}` | `-${formatPrice(totalBundleSavings)}` |
| `src/components/cart/ThresholdUpsellCard.tsx` | 61, 167 | `€{effectivePrice}` | `${formatPrice(effectivePrice)}` |
| `src/pages/Checkout.tsx` | 870, 883, 895, 997-1066 | All `€` symbols | All `$` symbols with formatPrice() |
| `src/components/checkout/MobileStickyCheckout.tsx` | 63 | `€{total...}` | `${formatPrice(total)}` |
| `src/components/checkout/OrderConfirmation.tsx` | 89 | `€{subtotal...}` | `${formatPrice(subtotal)}` |

### TIER 3: Product Display

| File | Lines | Change |
|------|-------|--------|
| `src/components/product/ProductInfo.tsx` | 230-234, 259 | Already uses `$` - verify consistency |
| `src/components/product/MobileStickyATC.tsx` | 67-68, 108-109 | Already uses `$` - verify consistency |
| `src/components/product/WearWithSection.tsx` | 122-127, 229-240 | Already uses `$` - verify consistency |
| `src/components/category/ProductCard.tsx` | 112-116 | formatPrice uses USD - change to CAD |
| `src/components/homepage/FeaturedDrop.tsx` | 65 | Hardcoded `$65` - keep symbol, adjust if needed |
| `src/components/content/ProductCarousel.tsx` | 24-69 | Hardcoded `$65`, `$85` strings |
| `src/components/homepage/RecentlyViewed.tsx` | 72-77 | `€{displayPrice...}` → `${formatPrice(...)}` |

### TIER 4: Try-On Room Components

| File | Lines | Change |
|------|-------|--------|
| `src/components/try-on/SaveLookModal.tsx` | 144, 150 | `€{item?.price...}` → `${formatPrice(...)}` |
| `src/components/try-on/ProductDrawer.tsx` | 174 | `€{product.price...}` → `${formatPrice(...)}` |
| `src/components/try-on/ClothingSlot.tsx` | 54 | `€{equippedItem.price...}` → `${formatPrice(...)}` |
| `src/components/try-on/MobileTryOnBar.tsx` | 48, 137, 146, 189 | `€` → `$` with formatPrice |
| `src/components/try-on/OutfitSummary.tsx` | 27, 95, 105 | `€` → `$` with formatPrice |

### TIER 5: Account & Orders

| File | Lines | Change |
|------|-------|--------|
| `src/pages/account/AccountOrderDetail.tsx` | 225, 284, 291, 297, 303, 308 | All `€` → `$` |
| `src/pages/account/AccountDashboard.tsx` | 25, 167 | `€{totalSpent...}` → `${formatPrice(...)}` |
| `src/pages/account/AccountFavorites.tsx` | 20-22, 28 | Already uses `$` - verify |

### TIER 6: Header & Global UI

| File | Lines | Change |
|------|-------|--------|
| `src/components/header/StatusBar.tsx` | 15 | `"Free shipping over €50"` → `"Free shipping over $99"` |
| `src/components/header/ShoppingBag.tsx` | 127 | `€{subtotal...}` → `${formatPrice(subtotal)}` |
| `src/components/homepage/ValueStackBanner.tsx` | 33 | `"Free Shipping $75+"` → `"Free Shipping $99+"` |
| `src/components/homepage/MobileStickyBar.tsx` | 63 | `"Free shipping on orders $75+"` → `"$99+"` |

### TIER 7: Content & Copy Pages

| File | Lines | Change |
|------|-------|--------|
| `src/pages/FAQ.tsx` | 31 | `$75` threshold mentions → `$99` |
| `src/pages/Contact.tsx` | 124 | Shipping threshold copy |
| `src/pages/ShippingInfo.tsx` | 14, 53, 115 | All `$75` → `$99` |
| `src/components/shipping/ShippingCalculator.tsx` | 49 | `"Free over $75"` → `"Free over $99"` |
| `src/components/product/ShippingReturnsAccordion.tsx` | 32 | `"Orders over $75"` → `"Orders over $99"` |
| `src/components/product/ProductInfo.tsx` | 186 | `"Free shipping $75+"` → `"Free shipping $99+"` |
| `src/components/category/FilterSortBar.tsx` | 50 | Price range filters (keep as-is for now) |

### TIER 8: Edge Functions (Backend)

| File | Lines | Change |
|------|-------|--------|
| `supabase/functions/create-checkout-session/index.ts` | 53-57, 174, 289, 340, 360, 410, 447 | `"eur"` → `"cad"`, `€` → `$` in comments |
| `supabase/functions/create-payment-intent/index.ts` | 162, 282, 310 | `"eur"` → `"cad"` |
| `supabase/functions/validate-discount-code/index.ts` | TBD | Check for currency mentions |

---

## New File: `src/lib/currency.ts`

```typescript
/**
 * Centralized currency configuration for LINEA
 * All pricing display must use these utilities for consistency
 */

export const CURRENCY = {
  /** ISO 4217 currency code */
  code: 'CAD' as const,
  /** Display symbol */
  symbol: '$',
  /** Locale for formatting */
  locale: 'en-CA',
  /** Free shipping threshold in dollars */
  freeShippingThreshold: 99,
  /** Express shipping cost */
  expressShippingCost: 15,
  /** Overnight shipping cost */
  overnightShippingCost: 35,
  /** Standard shipping cost (under threshold) */
  standardShippingCost: 10,
};

/**
 * Formats a numeric price as a CAD currency string
 * @param price - Price in dollars (not cents)
 * @returns Formatted string like "$69.99"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a price from cents to CAD string
 * @param cents - Price in cents
 * @returns Formatted string like "$69.99"
 */
export function formatPriceCents(cents: number): string {
  return formatPrice(cents / 100);
}

/**
 * Formats a price without the currency symbol
 * @param price - Price in dollars
 * @returns Formatted string like "69.99"
 */
export function formatPriceNumeric(price: number): string {
  return price.toFixed(2);
}
```

---

## Shipping Threshold Alignment

| Current | New (CAD) | Notes |
|---------|-----------|-------|
| €150 (edge functions) | $99 CAD | Standard market threshold |
| €100 (checkout) | $99 CAD | Unified |
| $75 (copy) | $99 CAD | Unified |
| €50 (StatusBar) | $99 CAD | Unified |

**Rationale**: $99 CAD is a common Canadian e-commerce free shipping threshold that balances conversion incentive with margin protection.

---

## Database Considerations

The `orders` table has `currency` column defaulting to `'eur'`. This stores the transaction currency, but since we're converting the entire store to CAD, new orders will use `'cad'`.

**No migration needed** - the column accepts any string. Edge functions will insert `'cad'` for new orders.

---

## Implementation Sequence

### Phase 1: Infrastructure (Must Do First)
1. Create `src/lib/currency.ts` with centralized config
2. Update `src/lib/cartUtils.ts` to re-export from currency.ts (backward compat)
3. Update `src/hooks/useCart.tsx` threshold to 99

### Phase 2: Cart & Checkout Flow
4. Update `CartDrawer.tsx`, `FreeShippingBar.tsx`, `BundleSavingsRow.tsx`
5. Update `Checkout.tsx` (large file, many instances)
6. Update `MobileStickyCheckout.tsx`, `OrderConfirmation.tsx`

### Phase 3: Product Display
7. Update `ProductCard.tsx`, `RecentlyViewed.tsx`
8. Update Try-On components (5 files)
9. Verify `ProductInfo.tsx` consistency

### Phase 4: Account & History
10. Update `AccountOrderDetail.tsx`, `AccountDashboard.tsx`

### Phase 5: Global & Copy
11. Update `StatusBar.tsx`, `ValueStackBanner.tsx`, `MobileStickyBar.tsx`
12. Update content pages (FAQ, Contact, ShippingInfo)

### Phase 6: Edge Functions (Deploy Required)
13. Update `create-checkout-session/index.ts`
14. Update `create-payment-intent/index.ts`
15. Deploy edge functions

---

## Copy Standardization

All shipping/pricing copy will follow this pattern:

| Element | Copy |
|---------|------|
| Free shipping threshold | "Free shipping on orders $99+" |
| Short form | "Free over $99" |
| Trust signal | "Free shipping $99+ • Easy 30-day returns" |
| Checkout shipping option | "Standard Shipping — FREE over $99" |

---

## Quality Assurance Checklist

### Visual Regression
- [ ] Homepage hero shows correct currency
- [ ] PLP product cards show `$XX.XX` format
- [ ] PDP price displays correctly
- [ ] Cart drawer shows CAD prices
- [ ] Checkout totals display correctly
- [ ] Order confirmation shows correct amounts
- [ ] Account order history displays CAD

### Functional Testing
- [ ] Add to cart calculates correct totals
- [ ] Free shipping unlocks at $99
- [ ] Discount codes apply correctly
- [ ] Stripe checkout uses CAD
- [ ] Express Pay uses CAD
- [ ] Order database stores 'cad' currency

### Edge Cases
- [ ] Bundle discounts calculate correctly
- [ ] Sale prices display with proper formatting
- [ ] Price filters work (if enabled)
- [ ] Reorder from history uses correct pricing

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stripe currency mismatch | Test checkout flow after deploy |
| Existing EUR orders display | Orders store their transaction currency - historical orders show correctly |
| Price filter breakage | Filters use numeric values, unaffected by display currency |
| SEO impact | Product schema uses numeric prices with currency code |

---

## Success Metrics

After implementation:
- 100% of frontend price displays use `$` symbol
- 100% of new transactions use `cad` currency code
- Zero customer confusion reports about currency
- Free shipping threshold unified across all touchpoints
