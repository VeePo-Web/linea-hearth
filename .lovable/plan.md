# Bag & Checkout Shipping Audit

Backend, cart drawer, Free Shipping Bar, Trust Row, Savings Summary, Checkout page, and edge function are already correct ($15 CA / $35 intl / FREE $250+). Three stale references remain — all small constants/copy, no UI change.

## Findings

1. **`src/config/brand.ts:60`** — `trust.freeShippingThreshold: 99, // USD`
   Stale constant from the old policy. Currency is now CAD and threshold is $250.

2. **`src/components/lookbook/SwipeProgress.tsx:24`** — default param `freeShippingThreshold = 150`
   Lookbook swipe progress falls back to $150 if no prop is passed. Should be $250.

3. **`src/pages/Checkout.tsx`** — local `isCanadianShip` derivation duplicates logic now centralized in `src/lib/currency.ts` (`isCanada`, `getShippingCost`). Functionally correct today but drifts from the single source of truth.

## Already verified correct (no changes)

- `src/hooks/useCart.tsx` — `FREE_SHIPPING_THRESHOLD = 250`, `shippingCost` derived from country + subtotal
- `src/components/cart/FreeShippingBar.tsx` — uses hook values, appends "(international)" label
- `src/components/cart/TrustRow.tsx` — "Free over $250"
- `src/components/cart/ThresholdUpsellCard.tsx`, `SmartUpsell.tsx` — use `amountToFreeShipping` from hook (dynamic)
- `src/components/checkout/SavingsSummary.tsx` — `$15 / $35` by `isCanadaDestination`, copy reads `freeShippingThreshold`
- `src/pages/Checkout.tsx` — flat-rate row, copy "Flat $15 CAD across Canada · Flat $35 CAD international · Free shipping on orders $250+", syncs country to cart context
- `supabase/functions/create-checkout-session/index.ts` — `SHIPPING_RATE_CA_CENTS=1500`, `SHIPPING_RATE_INTL_CENTS=3500`, `FREE_SHIPPING_THRESHOLD_CENTS=25000`, country-driven, worldwide `allowed_countries`

## Plan

1. `src/config/brand.ts` — set `trust.freeShippingThreshold: 250` and drop the `// USD` comment (currency is CAD).
2. `src/components/lookbook/SwipeProgress.tsx` — change default `freeShippingThreshold = 250`.
3. `src/pages/Checkout.tsx` — replace inline `isCanadianShip` + `getShippingCost` block with `isCanada(shippingAddress.country)` and `getShippingCost(country, subtotal)` from `@/lib/currency` so backend, cart, and checkout share one source of truth.

No UI/visual changes. No copy changes beyond the numeric threshold. No backend changes (already correct).
