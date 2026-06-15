
# Purge "prepaid" return-label language

## Audit result

Five references, all in customer-facing returns copy. No backend logic, DB columns, or edge functions mention prepaid — it's purely marketing/policy copy promising a free return label we won't actually issue.

Removing "prepaid" means the customer covers return shipping. Updating copy accordingly so we don't over-promise.

## Changes

**`src/pages/FAQ.tsx`**
- L61 (`ret-2` "How do I start a return?"): rewrite to "Visit our Returns page and enter your order number to start a return request. Once approved, pack your items securely and ship them back to the address we provide."
- L68 (`ret-3` "Are returns free?"): rewrite to "Return shipping is the customer's responsibility. Once we receive and inspect your return, we refund the product cost in full to the original payment method."

**`src/pages/ReturnsExchanges.tsx`**
- L27 (Ship Back step): "Ship the item back to the address provided in your return confirmation."
- L38 (`heroValueProps`): remove the `"Free Return Shipping (US)"` pill entirely (drops the array to 3 items).
- L65 (Is Return Shipping Free? card): rewrite description to "Return shipping is covered by the customer. We refund the full product cost once your return arrives and passes inspection."
- L203 (ActionCTA subtitle): "Enter your order number and we'll email you return instructions."

## Out of scope

- No layout/styling changes beyond shrinking the hero pill row from 4 → 3 items (existing flex/grid handles this).
- No changes to refund logic, RLS, or edge functions — none reference prepaid.
- Terms of Service / Shipping Policy pages already audited (no prepaid mentions).
