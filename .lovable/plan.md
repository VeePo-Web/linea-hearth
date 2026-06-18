# 30-day → 14-day Return Audit

Replace every return-policy "30 day" reference with "14 day" to match the policy. Leave unrelated 30-day timers (cart recovery, abandoned-cart expiry, review-request window, discount code validity, recently-viewed cleanup, JWT expiries, DB defaults) untouched.

## Edits (return-policy only)

| File | Line | Change |
|---|---|---|
| `src/components/cart/TrustRow.tsx` | 12 | `30-day returns` → `14-day returns` |
| `src/components/checkout/CheckoutTrustBadges.tsx` | 16 | `30-day returns` → `14-day returns` |
| `src/components/product/ShippingReturnsAccordion.tsx` | 52 | `30-day return window` → `14-day return window` |
| `src/components/product/ProductInfo.tsx` | 243 | `Easy 30-day returns` → `Easy 14-day returns` |
| `src/components/product/GuaranteeBadge.tsx` | 54, 96 | `within 30 days` → `within 14 days` |
| `src/pages/FAQ.tsx` | 119 | `within 30 days` → `within 14 days` |
| `src/pages/Contact.tsx` | 120 | `30-day satisfaction guarantee` → `14-day satisfaction guarantee` |
| `src/pages/TermsOfService.tsx` | 105 | `within 30 days of delivery` → `within 14 days of delivery` |

## Untouched (not return-policy)
- `RecoverCart.tsx`, `recover-cart`, `process-abandoned-carts`, `process-review-requests`, `process-worn-in-the-wild-invites`, migration default, `RecentlyViewedContext.tsx`, `PostPurchaseSignup.tsx` (discount code expiry).

After edits, re-run `rg "30[- ]day|30 days"` and confirm only the non-return entries remain.
