## Problem

Image thumbnails sometimes show up empty or broken across the experience — in the cart drawer, the Stripe checkout, the saved-for-later shelf, the order confirmation email, the abandoned cart emails, and the review request email. Root causes:

1. **Cart UI** — `<img>` tags render whatever sits in `item.image`. If the value is an empty string, a relative path that 404s, or the image fails to load, the user sees a broken thumbnail (no fallback, no `onError`).
2. **Stripe Checkout** — only sends `images: [item.image]` when truthy, but passes relative paths (`/placeholder.svg`) which Stripe ignores, so the checkout line item shows no thumbnail.
3. **`order_items.product_image_url`** — stored as `item.image || null`. When null or relative, every downstream email loses the thumbnail.
4. **Emails** — `send-order-confirmation` and `process-review-requests` skip the `<img>` cell entirely when `product_image_url` is null, breaking the visual rhythm. `process-abandoned-carts` always renders `<img src="${item.image}">` even when empty, producing a broken image icon in Gmail/Outlook.

## Fix

### Shared resolver (one constant, two helpers)

- Brand fallback URL: `https://lineofjudah.clothing/logo.png` (already publicly hosted).
- Create `src/lib/imageUrl.ts` with `resolveImageUrl(url?: string | null)` that returns:
  - the URL unchanged if it is absolute (`http://` / `https://`)
  - `https://lineofjudah.clothing${url}` if it starts with `/`
  - the brand fallback if null / empty / `placeholder.svg`
- Mirror the same helper inside the edge functions as a 10-line `resolveImageUrl()` (Deno can't import from `src/`).

### Frontend (cart, saved, upsells)

Add a tiny `<CartThumb src={...} alt={...} />` component (or a shared `onError` handler) that:
- runs `src` through `resolveImageUrl`
- on `onError`, swaps to the brand fallback
- is used by `CartItem`, `SavedItem`, `ThresholdUpsellCard`, `MissingProductCard`, `AddedToCartToast`, and `ContinueShopping`

### Stripe checkout (`create-checkout-session`)

- Resolve `item.image` to an absolute https URL with the helper before pushing into `product_data.images`.
- When inserting into `order_items`, write `resolveImageUrl(item.image)` (never null), so every order_item row has a usable thumbnail forever.

### Emails (always render a thumbnail)

In `send-order-confirmation`, `process-review-requests`, and all three stages of `process-abandoned-carts`:
- Replace `${item.product_image_url ? <img> : ''}` with `<img src="${resolveImageUrl(item.product_image_url)}" ...>` so the cell is always filled.
- Same change in `test-all-emails` so QA sends mirror production.

### Out of scope

- No DB migration (existing nulls in `order_items.product_image_url` are still rendered as the brand fallback at email render time, so no backfill needed).
- No changes to payment logic, no changes to product gallery, no schema changes.
- No new public assets — `logo.png` already exists.

## Verification

1. Add a cart item, force-blank its image in devtools, confirm the cart drawer shows the brand fallback instead of a broken icon.
2. Run `test-all-emails` against `parker@veepo.ca` and confirm every email renders a thumbnail per line item.
3. Inspect a recent `order_items` row after checkout — confirm `product_image_url` is an absolute https URL.
