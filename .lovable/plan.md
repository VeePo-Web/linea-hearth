# Shipping overhaul: flat-rate by country, free over $250

## New shipping rules
- **Canada:** flat **$15 CAD** on every order
- **International (anything not CA):** flat **$35 CAD** on every order
- **Free shipping:** any order ≥ **$250 CAD subtotal** (applies to both CA and intl)
- Remove the legacy 3-tier (standard/express/overnight) pricing; one method per region only
- Auto-detect country from the checkout shipping address — when `country !== "CA"`, the cart, checkout summary, and shipping selector switch to the $35 intl rate and the free-shipping bar copy updates ("Free intl shipping over $250")

## Single source of truth
Update `src/lib/currency.ts`:
```
freeShippingThreshold: 250
domesticShippingCost:  15   // CA
intlShippingCost:      35   // everywhere else
```
Remove `expressShippingCost`, `overnightShippingCost`, `standardShippingCost`.

Add a tiny helper:
```
getShippingCost(country, subtotal) → 0 | 15 | 35
```
used by both the cart bar and Checkout.

## Frontend edits (copy + math only — no layout changes)
| File | Change |
|---|---|
| `src/hooks/useCart.tsx` | `FREE_SHIPPING_THRESHOLD = 250`; add optional `shippingCountry` state (default `"CA"`) + setter; expose `shippingCost` derived from country + subtotal |
| `src/components/cart/FreeShippingBar.tsx` | Already reads from cart — copy auto-updates. Append "(intl)" when country ≠ CA |
| `src/components/cart/TrustRow.tsx` | "Free over $99" → "Free over $250" |
| `src/components/cart/SmartUpsell.tsx` | Threshold `<= 30` stays, copy unchanged (reads `amountToFreeShipping`) |
| `src/components/cart/ThresholdUpsellCard.tsx` | Verify copy uses dynamic threshold |
| `src/components/checkout/SavingsSummary.tsx` | `shippingValue = hasFreeShipping ? (country==='CA'?15:35) : 0`; copy "orders over $250" |
| `src/pages/Checkout.tsx` | Replace `getShippingCost()` with country-aware flat-rate logic; remove express/overnight radio options, keep one row ("Shipping — $15 Canada / $35 International / FREE over $250"); bind to `shippingAddress.country` |
| `src/pages/ShippingInfo.tsx` | Badges + hero copy: "Free over $250", add "Canada $15 flat / International $35 flat" |
| `src/components/shipping/ShippingCalculator.tsx` | Reduce to 2 rows (Canada $15, International $35), "Free over $250"; remove express/overnight |
| `src/pages/FAQ.tsx` | Rewrite shipping Q&As to flat-rate / $250 free / intl $35 |
| `src/pages/Contact.tsx` | Same FAQ rewrite |
| `src/pages/Index.tsx` | Meta description "Free shipping on orders over $250 CAD" |
| `index.html` | Meta + OG description "$250 CAD" |
| `src/components/homepage/MobileStickyBar.tsx` | "Free shipping on orders $250+" |
| `src/components/header/PreSaleMarquee.tsx` | If it references $99, swap to $250 |

## Backend edits (`supabase/functions/create-checkout-session/index.ts`)
- `FREE_SHIPPING_THRESHOLD_CENTS = 25000`
- Replace `SHIPPING_RATES` with `{ CA: 1500, INTL: 3500 }`
- Derive rate from `body.shippingAddress.country` (`"CA"` → CA, else INTL)
- Remove the forced `method = "standard"` override; single rate per region
- `shipping_address_collection.allowed_countries`: keep current list (CA, US) **or** expand — flag to user (see Question)
- Stripe `shipping_options` becomes one option: `"Standard — Canada"` ($15) or `"Standard — International"` ($35), free when ≥ $250
- Persist `shipping_method` as `"standard-ca"` / `"standard-intl"` / `"free"` for email rendering

## Out of scope (intentionally untouched)
- Email templates already render `shipping_cents` dynamically — no copy edits needed; "FREE" badge still works at $0
- Tax codes, Stripe webhook, reconcile functions (they read cents from Stripe, no thresholds hardcoded)
- Discount-code minimums

## Open question for you
Stripe currently only allows shipping to **Canada + US**. Do you want me to:
**(a)** Keep CA + US only (US still counts as "international" → $35), or
**(b)** Expand `allowed_countries` to worldwide so intl $35 actually reaches non-NA customers?

I'll default to **(b) worldwide** unless you say otherwise when you approve.
