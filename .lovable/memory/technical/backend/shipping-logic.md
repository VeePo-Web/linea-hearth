---
name: Backend Shipping Logic
description: Flat $15 CA / $40 intl, FREE over $250 CAD, country auto-detected
type: feature
---
Flat-rate shipping (CAD):
- Canada: $15
- Anywhere else (international): $40
- FREE on subtotal ≥ $250 CAD (both domestic + international)

Sources of truth:
- Client: `src/lib/currency.ts` (`getShippingCost`), `src/hooks/useCart.tsx`
- Server: `supabase/functions/create-checkout-session/index.ts` — `SHIPPING_RATE_CA_CENTS=1500`, `SHIPPING_RATE_INTL_CENTS=4000`, `FREE_SHIPPING_THRESHOLD_CENTS=25000`
- Savings display: `src/components/checkout/SavingsSummary.tsx`
