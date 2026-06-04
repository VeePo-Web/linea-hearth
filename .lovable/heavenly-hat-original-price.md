# Heavenly Hat — Original Price Snapshot

- Product: `"Heavenly" Khaki Low-Profile Baseball Cap`
- Product ID: `39912e5b-5cef-4b9f-a692-9a4b4f08edd6`
- **Original price: `$30.00`**
- Currently set to: `$1.00` (test mode)
- No variant `price_adjustment` rows exist for this product.

## Revert (single statement)
```sql
UPDATE public.products SET price = 30.00 WHERE id = '39912e5b-5cef-4b9f-a692-9a4b4f08edd6';
```
