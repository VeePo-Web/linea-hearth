# Fix: Checkout "Edge Function returned a non-2xx status code"

## Root cause

When a hat (or any product) is added from `/catalogue` via the hover Quick-Add (+) button, `useQuickAdd` calls `addItem({ id: productIdToCartId(product.id), ... })` but **never passes `productId` or `variantId`**.

At checkout, `useStripeCheckout.ts` does:

```ts
productId: item.productId || item.id?.toString()
```

With no `productId`, it falls back to the numeric hashed cart id (e.g. `"965815899"`), which the `create-checkout-session` edge function then tries to use as a UUID against `products.id`. Postgres rejects it:

```
invalid input syntax for type uuid: "965815899"
```

The function returns 500 → the client sees "Edge Function returned a non-2xx status code".

This only affects items added via Quick-Add (catalogue / PLP hover). Items added from PDP work because PDP passes the real `productId`.

## Fix (single file: `src/hooks/useQuickAdd.ts`)

1. Extend `ProductForQuickAdd.product_variants` type to include optional `id: string`.
2. In `addToCart`, look up the matching variant by `size` + `color` and grab its `id`.
3. Pass `productId: product.id` and `variantId: matchedVariant?.id` into the `addItem({ ... })` call.

No edge function changes needed — it already tolerates a missing `variantId` (logs a warning and proceeds without price adjustment). The real `productId` UUID is what unblocks server-side price authority and Stripe session creation.

## Verification

- Add a hat from `/catalogue` via Quick-Add → open cart → checkout → Stripe embedded form mounts (no 500).
- Watch `create-checkout-session` logs: the "invalid input syntax for type uuid" error should be gone.
- Confirm order row is created with the correct `product_id` UUID.
