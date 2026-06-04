## Plan

1. **Fix the product data feeding Quick Add**
   - Update the catalogue product queries to include `product_variants.id`.
   - Update the shared product card variant type so Quick Add receives the real variant ID instead of only size/color/stock.

2. **Prevent stale bad cart data from breaking checkout**
   - Add a small safety pass in the cart load/checkout path so any cart items saved before the fix that only have numeric IDs do not get sent as fake product UUIDs.
   - If an item cannot be trusted, show a clear cart-refresh message instead of a backend 500.

3. **Validate against the actual failing signal**
   - Check the `create-checkout-session` edge function logs again after the change.
   - Confirm the old `invalid input syntax for type uuid: "965815899"` error is no longer produced when attempting checkout.

## Technical details

The previous Quick Add hook fix added `productId` and `variantId` when adding to cart, but the catalogue/category queries still only fetched:

```text
product_variants(size, color, stock_quantity)
```

So `matchedVariant?.id` remained `undefined`, and any cart item already saved before the fix can still fall back to the numeric cart ID (`965815899`) during checkout. The edge function expects real UUID product IDs, so it rejects the numeric value before Stripe can open.