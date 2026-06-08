## Restore Heavenly Hat to Production Price

The "Heavenly" Khaki Low-Profile Baseball Cap was set to $1.00 for live payment testing. Time to put it back to its real price before launch.

### Change
Run one SQL update against the `products` table:

```sql
UPDATE public.products
SET price = 30.00
WHERE id = '39912e5b-5cef-4b9f-a692-9a4b4f08edd6';
```

- Product: `"Heavenly" Khaki Low-Profile Baseball Cap`
- Current: `$1.00` (test)
- After: `$30.00` (original, per `.lovable/heavenly-hat-original-price.md`)
- No variant `price_adjustment` rows exist, so no other rows need touching.

### Verification
1. Re-query the product row to confirm `price = 30.00`.
2. Spot-check a few other products' prices in the DB to confirm nothing else is sitting at a test value (e.g. anything `< $5` that shouldn't be).
3. Refresh the PDP `/product/heavenly-khaki-low-profile-baseball-cap` in preview and confirm it shows $30.00 and the cart/checkout totals reflect the new price.

No code changes, no migrations, no edge function redeploys needed — pure data fix.
