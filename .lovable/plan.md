

# Fix: "Add to Bag" Button Not Adding Items to Cart

## Root Cause Analysis

There are **two interconnected bugs** preventing items from being added to the cart:

### Bug 1: Single-color products require manual color selection (primary cause)

Both active products in the database have exactly **one color each**:
- "Heavenly Crewneck" -- only "White"
- "Stay Holy Hoodie" -- only "Carolina Blue"

The `canAddToBag` check in `ProductInfo.tsx` (line 138) requires `selectedColor` to be set when colors exist:

```text
canAddToBag = variants.length === 0 || (
  (colors.length === 0 || selectedColor) &&   <-- requires color click
  (sizes.length === 0 || selectedSize)
)
```

Since neither product auto-selects its sole color, the "Add to Bag" button **stays disabled** (50% opacity). Users may not realize they need to click the single color swatch before selecting a size.

### Bug 2: Silent failure when `addToCart` receives no size

Even if the button were clickable, the PDP routes through `useQuickAdd.addToCart`, which silently fails by calling `setIsPickerOpen(true)` when no size is resolved -- but the PDP never renders the quick-add size picker, so nothing happens.

## Fix Plan

### 1. Auto-select color when only one option exists (`ProductInfo.tsx`)

Add a `useEffect` that auto-selects the color when there's exactly one available:

```typescript
useEffect(() => {
  if (colors.length === 1 && !selectedColor) {
    setSelectedColor(colors[0].color);
    onColorChange?.(colors[0].color);
  }
}, [colors]);
```

This immediately satisfies the `canAddToBag` condition for single-color products.

### 2. Wire "Add to Bag" directly to `useCart.addItem` (`ProductDetail.tsx`)

The PDP already has its own size/color/quantity UI, so routing through `useQuickAdd` (designed for one-tap surfaces like PLP cards) adds unnecessary complexity and failure modes. Replace the `onAddToBag` callback to use `addItem` from `useCart` directly:

```typescript
const { addItem, openCart } = useCart();

onAddToBag={({ size, color, quantity }) => {
  const primaryImage = product.product_images?.find(img => img.is_primary)
    || product.product_images?.[0];

  addItem({
    id: productIdToCartId(product.id),
    name: product.name,
    price: displayPrice,
    priceFormatted: formatPrice(displayPrice),
    image: primaryImage?.image_url || '/placeholder.svg',
    category: product.categories?.slug || 'tops',
    size: size || undefined,
    color: color || undefined,
    quantity,
    productId: product.id,
  });
}}
```

This bypasses the `useQuickAdd` remembered-size/picker logic entirely on the PDP, where it's not needed.

### 3. Keep `useQuickAdd` for surfaces that need it

The `MobileStickyATC` and `HighIntentPrompt` on the PDP can continue using `quickAdd.handleQuickAdd` since those are "quick add" surfaces. But the main "Add to Bag" button should go direct.

## Files Changed

| File | Change |
|------|--------|
| `src/components/product/ProductInfo.tsx` | Add auto-select for single-color products |
| `src/pages/ProductDetail.tsx` | Wire `onAddToBag` directly to `useCart.addItem` instead of `useQuickAdd.addToCart` |

## Expected Result

- User visits PDP for "Heavenly Crewneck"
- Color "White" is auto-selected
- User selects a size (e.g., "M")
- "Add to Bag" button is enabled
- Clicking it immediately adds the item to cart and opens the CartDrawer showing the item

