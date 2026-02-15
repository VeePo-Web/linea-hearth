
# Fix Mobile Swipe-to-Add: Make It Actually Work

## The Core Problem

The Tinder-style "swipe right to add to cart" feature is fully built but **completely non-functional** right now because:

1. The `lookbook_looks` table in the database is empty
2. The page falls back to `demoLooks` which all have `products: []` (empty arrays)
3. When you tap "Shop This Look" on mobile, the SwipeLookbook drawer opens but immediately shows "Nothing Added -- Want to take another look?" because there are zero products to swipe through
4. The `SwipeableLookCard` wrapping the look images also does nothing on swipe because `products` is empty

The swipe gesture code, haptic feedback, card stack, size memory integration, and completion flow are all solid. The system just has no products to work with.

## The Fix: Populate Demo Looks with Real Products

Since there are 3 real products in the database (`Heavenly Crewneck`, `Stay Holy Hoodie`, `stay holy`), the demo looks need to reference them so the swipe experience works end-to-end.

### Changes

**File: `src/pages/Lookbook.tsx`**

Update the `demoLooks` array so each look includes 2-3 products from the existing product catalog. Since the demo data is a frontend fallback (used when `lookbook_looks` table is empty), we'll embed the product data directly:

```
demoLooks[0] "The Shepherd" -> products: [Heavenly Crewneck, Stay Holy Hoodie]
demoLooks[1] "The Warrior"  -> products: [Stay Holy Hoodie, Heavenly Crewneck]  
demoLooks[2] "The Disciple" -> products: [Heavenly Crewneck]
demoLooks[3] "The Vessel"   -> products: [Stay Holy Hoodie]
demoLooks[4] "Street Evang" -> products: [Heavenly Crewneck, Stay Holy Hoodie]
```

Each product entry will include `id`, `name`, `slug`, `price`, `sale_price`, `is_on_sale`, `position` (top/bottom/hat), and `product_images` with real image paths from the existing `/products/` directory.

### What This Enables

- **SwipeableLookCard**: Swiping right on the look image on mobile will trigger the "Add Look" flow with real products, show the size picker if no size is remembered, and add items to the cart
- **SwipeLookbook drawer**: Tapping "Shop This Look" opens the card-stack with real product cards to swipe through individually
- **ShopTheLook grid (desktop)**: The product thumbnails with Quick Add buttons will render with real images and prices
- **Bundle discount logic**: With 2+ products per look, the 10%/15% bundle badges will actually appear
- **Cart integration**: Products added via swipe will show up in the cart drawer with correct names, images, and prices

### Technical Details

- Only `src/pages/Lookbook.tsx` is modified (the `demoLooks` constant)
- No database changes required -- this is frontend demo data
- No new dependencies
- No component logic changes -- the swipe/cart/haptic code is already correct
- Real product IDs (`bba1a982-...`, `1b4823be-...`) are used so cart deduplication works properly
- Real image paths (`/products/heavenly-crewneck/front-model.png`, etc.) are used so images load correctly
