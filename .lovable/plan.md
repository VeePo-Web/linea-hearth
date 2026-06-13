# Shipping Audit: $15 CA / $40 Worldwide

Canada flat rate stays at **$15 CAD**. International flat rate changes from **$35 → $40 CAD**. Free shipping threshold ($250 CAD) is unchanged.

## Source-of-truth changes

1. **`src/lib/currency.ts`** — `intlShippingCost: 35` → `40`. All client UI that uses `getShippingCost()` updates automatically.
2. **`src/hooks/useCart.tsx`** — `shippingCost` ternary `: 35` → `: 40` (cart drawer, free-shipping bar).
3. **`src/components/checkout/SavingsSummary.tsx`** — `isCanadaDestination ? 15 : 35` → `: 40`.
4. **`supabase/functions/create-checkout-session/index.ts`** — `SHIPPING_RATE_INTL_CENTS = 3500` → `4000`. Redeploy edge function so Stripe sessions charge the new rate.

## Copy / SEO updates (all "$35" → "$40")

- `src/pages/ShippingInfo.tsx` — international card description, page meta description, subtitle.
- `src/pages/FAQ.tsx` — shipping cost answer + "Do you ship internationally?" answer.
- `src/pages/Contact.tsx` — FAQ answer.
- `src/pages/Checkout.tsx` — footer note line ("Flat $15 … $35 …").
- `src/pages/Index.tsx` — homepage SEO description.
- `src/components/shipping/ShippingCalculator.tsx` — "International — Standard" price string (`$35 flat · FREE over $250` → `$40 …`).

## Verification

- Grep `rg -n "\\$35"` after edits → should return zero shipping-related hits.
- Load preview cart with intl destination + sub-$250 subtotal → drawer + checkout summary both show $40.
- Invoke `create-checkout-session` with `country != CA` → Stripe line item shows 4000 cents.
- Confirm Canada ($15) and free-over-$250 still work unchanged.

## Memory

Update `mem://index.md` Core line "Free shipping over $250" context is fine; no memory currently pins the $35 number, so nothing to rewrite.
