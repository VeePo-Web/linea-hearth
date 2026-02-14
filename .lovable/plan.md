
# Fix Shipping Cost Mismatch and EUR Currency Contamination

## Problem Summary

Two distinct but related issues across **4 edge functions**:

1. **Shipping costs in `create-checkout-session`** don't match the frontend (`Checkout.tsx`)
2. **EUR currency symbols** are hardcoded in email templates and error messages across multiple functions, but the store operates in CAD

## Exact Changes

### File 1: `supabase/functions/create-checkout-session/index.ts`

**Lines 51-57 -- Shipping costs and threshold:**
Replace the current values with frontend-aligned amounts:
- `standard: 0` becomes `standard: 1000` (i.e., $10 CAD)
- `express: 999` becomes `express: 1500` ($15 CAD)
- `overnight: 1999` becomes `overnight: 3500` ($35 CAD)
- `FREE_SHIPPING_THRESHOLD = 10000` becomes `9900` ($99 CAD)
- Update all code comments from EUR symbols to CAD

**Line 174 -- Error message currency:**
Change `Minimum order of EUR...` to `Minimum order of $X.XX CAD`

---

### File 2: `supabase/functions/create-payment-intent/index.ts`

**Line 162 -- Comment only:**
Change `// EUR 150` comment to `// $150 CAD` (the actual values here -- $10/$15/$35 -- already match the frontend, but the threshold is $150 instead of $99)

**Line 162 -- Threshold value:**
Change `FREE_SHIPPING_THRESHOLD = 15000` to `9900` to match the site-wide $99 CAD standard

---

### File 3: `supabase/functions/send-order-confirmation/index.ts`

**Line 51 -- Fallback currency symbol:**
Change the fallback from `"EUR"` to `"$"` so if an unknown currency somehow appears, it defaults to `$` not `EUR`

---

### File 4: `supabase/functions/process-abandoned-carts/index.ts`

**Lines 204, 286, 391, 394 -- Email template currency symbols:**
Replace all 4 instances of `EUR${...}` with `$${...}` in the abandoned cart email HTML templates. These are customer-facing emails that currently show prices like "EUR 89" instead of "$89".

---

## What stays the same

- All frontend code (`Checkout.tsx`, `currency.ts`, `TrustRow.tsx`) -- already correct at $99 CAD threshold with $10/$15/$35 shipping
- Database schema -- no changes needed
- Stripe currency parameter (`"cad"`) -- already correct in both edge functions
- All visual layout, design, and component structure -- zero UI changes

## Technical scope

- 4 edge functions edited
- ~12 line replacements total (comments, constants, template strings)
- All changes are in constants and string literals -- zero logic changes
- Edge functions auto-deploy after save
