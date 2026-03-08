

# Performance & Polish Audit: Round 9 — Shipping/Accessibility Emerald, Lookbook Green, and Border-Radius Inconsistency

## Findings

### 1. ShippingInfo — Emerald Delivery Confidence Strip
**File:** `src/pages/ShippingInfo.tsx` (lines 121-127)
`bg-emerald-950/20 border border-emerald-900`, `text-emerald-500`, `text-emerald-100`. A full emerald-themed strip on a customer-facing service page.

**Fix:** Replace with `bg-foreground/5 border border-foreground/10`, `text-foreground`, `text-foreground/80`.

### 2. Accessibility — Emerald Compliance Strip (4 instances)
**File:** `src/pages/Accessibility.tsx` (lines 134-138, 214)
`border-emerald-500/20`, `bg-emerald-500`, `text-emerald-500` on compliance indicators and `iconColor="emerald"` passed to InfoCard. While semantically green makes sense for "compliance," the emerald is off-brand.

**Fix:** Replace border with `border-foreground/20`, dot with `bg-foreground`, icon with `text-foreground`. Change `iconColor="emerald"` to `iconColor="stone"` (neutral). Keep the `"emerald"` prop references in Contact.tsx since InfoCard already maps them to champagne.

### 3. ShopTheLook — Green Success Overlays (3 instances)
**File:** `src/components/lookbook/ShopTheLook.tsx` (lines 107, 120, 335)
`bg-green-600/90` success overlay, `bg-green-600` in-cart badge, and `bg-green-600` on "all added" button state. These are in the lookbook which was previously excluded, but ShopTheLook is a direct commerce surface (add-to-cart), not an immersive gesture.

**Fix:** Replace `bg-green-600/90` with `bg-foreground/90`, `bg-green-600 p-1` with `bg-foreground p-1`, and `bg-green-600 hover:bg-green-600` with `bg-foreground hover:bg-foreground`.

### 4. AddedToCartToast — `rounded-lg` Border Radius
**File:** `src/components/cart/AddedToCartToast.tsx` (line 53)
`rounded-lg` on the toast and `rounded` on the thumbnail. The entire design system uses sharp corners (`rounded-none` or `rounded-sm`). A `rounded-lg` toast breaks the editorial language.

**Fix:** Replace `rounded-lg` with `rounded-none` on the toast container. Replace `rounded` on the thumbnail with nothing (remove it).

### 5. AddedToCartToast — `shadow-lg`
Same line 53. The rest of the site uses flat, editorial surfaces. A `shadow-lg` drop shadow reads as Material Design, not high-fashion editorial.

**Fix:** Replace `shadow-lg` with `shadow-sm` or remove entirely, relying on the border for definition.

---

## Summary

| File | Change |
|------|--------|
| `ShippingInfo.tsx` | Replace emerald strip with foreground palette |
| `Accessibility.tsx` | Replace emerald compliance indicators with foreground/stone |
| `ShopTheLook.tsx` | Replace 3 green commerce overlays with foreground |
| `AddedToCartToast.tsx` | Replace `rounded-lg` with `rounded-none`, `shadow-lg` with `shadow-sm`, remove `rounded` from thumbnail |

## What Is NOT Changed
- Lookbook swipe gestures (`SwipeCard`, `SwipeActions`, `SwipeableLookCard`, `SwipeLookbook`, `SwipeProgress`) — immersive directional feedback using green for "add" vs red for "skip"
- Admin status badges — semantic status colors
- Account order status badges — standard status
- Form validation green (CreateAccountForm, ResetPassword) — standard UX validation
- Try-on SizeRecommendation — internal tool with semantic traffic-light colors
- AvatarPreview green checks — internal try-on tool
- FlashSaleTimer red — semantic urgency indicator
- All functional logic preserved exactly

