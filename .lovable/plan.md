## Goal
Show `CAD` next to every customer-facing price (PDP, PLP, cart, checkout, style swatches, etc.) so prices read `$50.00 CAD` instead of `$50.00`.

## Approach
Update the two central formatters in `src/lib/currency.ts` so every consumer gets the suffix automatically — no per-component edits needed.

### Changes
1. **`src/lib/currency.ts`**
   - `formatPrice(price)` → returns `"$50.00 CAD"` (use `en-CA` `Intl.NumberFormat` with `currencyDisplay: 'narrowSymbol'`, then append ` CAD`).
   - `formatPriceCents(cents)` → inherits via `formatPrice`.
   - `formatPriceSimple(price)` → returns `` `$${price.toFixed(2)} CAD` ``.
   - `formatPriceNumeric` stays unchanged (pure number, used where a `$` is rendered separately or for inputs).

2. **Spot-check & patch any place that hardcodes `$` next to a number** instead of using the formatters, so they also get `CAD`:
   - `src/lib/cartUtils.ts` `formatPrice` (cart line items, drawer, mini-cart).
   - Style/variant price-delta chips (e.g. `-$15`) in `ProductInfo` / style picker → `-$15 CAD`.
   - Shipping threshold messages, savings summary, free-ship celebrations, bundle discount chips, threshold upsell copy.
   - Checkout totals, order confirmation, post-purchase offer.
   - Will grep for `` `$${ ``, `toFixed(2)`, and `$\{` in `src/components/**` + `src/pages/**` (excluding `admin/`) and route each through the central formatter.

3. **Leave untouched**
   - Admin pages (already use `formatAdminMoney`, already say `CAD`).
   - Emails / Stripe / edge functions (Stripe already shows `CAD` natively in checkout; emails already format with currency code).
   - Structured data / meta tags (`priceCurrency: "CAD"` is correct as-is).
   - `formatPriceNumeric` and any numeric-only inputs.

## Out of scope
- No backend, pricing, Stripe, or shipping logic changes.
- No multi-currency switching.

## Verification
- Visit PDP (`/product/...`): price reads `$50.00 CAD`, style deltas read `-$15 CAD`.
- Visit PLP (`/category/all`): card prices read `$50.00 CAD`.
- Open cart drawer + checkout: line items, subtotal, shipping, total all show `CAD`.
- Free-ship progress bar and bundle/upsell chips show `CAD`.
