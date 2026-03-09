

# Round 27 — Console.log Pollution Cleanup + Lookbook/Hero dvh Consistency

## Issues Found

### 1. Debug `console.log` Spam in `useFabricMaterial.tsx` (Performance + Professionalism)
**Problem:** The `useFabricMaterial` hook has 7 `console.log` statements that fire on every render of any 3D garment. These run outside `useMemo`, meaning they execute on every re-render — polluting the console, degrading performance in the try-on room, and looking unprofessional if a user opens DevTools.

**Fix:** Remove all 7 `console.log` calls from `src/components/try-on/hooks/useFabricMaterial.tsx` (lines 54-58, 63, 70-71).

### 2. Stale `console.log` in Checkout, Returns, and ReviewProduct
**Problem:** Three more files have leftover debug/TODO logs:
- `src/pages/Checkout.tsx` line 280: `console.log("Post-purchase item added")`
- `src/pages/ReturnsExchanges.tsx` line 75: `console.log("Return initiated for order:", orderNumber)`
- `src/components/product/ReviewProduct.tsx` line 29: `console.log("Review submitted:", ...)`

**Fix:** Remove all three. The TryOnCanvas `console.log` on line 87 is a WebGL context recovery diagnostic — keep it (it only fires on rare GPU crashes).

### 3. Lookbook Loading Skeleton Uses `h-screen` (iOS Safari)
**Problem:** `src/pages/Lookbook.tsx` line 195 uses `h-screen` for the loading skeleton. On iOS Safari, this causes the skeleton to be taller than the visual viewport, creating a flash of scroll before content loads.

**Fix:** Replace `h-screen` with `h-[100dvh]` on line 195.

### 4. HeroBlock Uses `h-screen` (iOS Safari)
**Problem:** `src/components/homepage/HeroBlock.tsx` line 14 uses `h-screen`. Same iOS Safari issue — hero extends behind the URL bar.

**Fix:** Replace `h-screen` with `h-[100dvh]` on line 14. The `min-h-[600px] max-h-[900px]` constraints remain.

## Summary Table

| File | Change |
|------|--------|
| `src/components/try-on/hooks/useFabricMaterial.tsx` | Remove 7 console.log calls |
| `src/pages/Checkout.tsx` | Remove console.log on line 280 |
| `src/pages/ReturnsExchanges.tsx` | Remove console.log on line 75 |
| `src/components/product/ReviewProduct.tsx` | Remove console.log on line 29 |
| `src/pages/Lookbook.tsx` | Line 195: `h-screen` → `h-[100dvh]` |
| `src/components/homepage/HeroBlock.tsx` | Line 14: `h-screen` → `h-[100dvh]` |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- TryOnCanvas WebGL recovery log kept (legitimate diagnostic)
- All `min-h-screen` usages on page wrappers are correct (they set minimum, not fixed height) and are left as-is

