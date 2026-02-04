

# Try-On Room Comprehensive Fix & Enhancement Plan

## Executive Summary

After a forensic audit of the Try-On Room implementation, the core 3D infrastructure is **functional** with high-fidelity garment geometries, texture projection, and body measurement systems in place. However, several issues require attention to achieve a world-class virtual try-on experience.

---

## Current State Assessment

### Working Components
- 3D Canvas rendering with React Three Fiber
- Mannequin3D with body proportion scaling
- Garment geometries: Hoodie, Crewneck, T-shirt, Tank, Jacket, Pants, Shorts, Beanie, Sneaker
- Shoulder junction system with Bezier curves
- Front-projection UV mapping for textures
- Fabric material presets (cotton, fleece, denim, leather, knit)
- Body measurements panel with quick presets
- Size recommendation engine
- Mobile bottom bar and desktop sidebar
- Save/Share outfit functionality

### Identified Issues

| Priority | Issue | Impact |
|----------|-------|--------|
| Critical | WebGL context loss on prolonged use | 3D view crashes |
| High | ProductDrawer fetches all products instead of filtering by slot | Wrong products shown |
| High | saved_outfits table may not exist | Save Look fails |
| Medium | Material created multiple times per garment | Performance |
| Medium | Dialog accessibility warning | WCAG compliance |
| Low | Haptic feedback blocked initially | Minor UX |

---

## Phase 1: Critical Bug Fixes

### 1.1 WebGL Context Loss Prevention

**File:** `src/components/try-on/TryOnCanvas.tsx`

**Issue:** Console shows `THREE.WebGLRenderer: Context Lost` indicating memory pressure from too many textures or geometries not being disposed.

**Solution:**
- Add proper cleanup in useEffect for texture disposal
- Implement geometry caching to prevent recreation on every render
- Add WebGL context loss/restore event handlers
- Reduce shadow map resolution on mobile devices

```text
Changes:
1. Add onContextLost/onContextRestored handlers to Canvas
2. Implement texture caching in useGarmentTexture hook
3. Add useMemo for geometry creation to prevent recreation
4. Reduce dpr on mobile: dpr={[1, 1.5]}
```

### 1.2 Fix ProductDrawer Category Filtering

**File:** `src/components/try-on/ProductDrawer.tsx`

**Issue:** Query fetches all products regardless of slot, showing wrong items (e.g., hoodies in "Footwear" slot).

**Solution:**
- Use the existing `slotToCategoryMap` to filter by product category
- Join with `categories` table to match slot to product category

```text
Changes:
1. Modify Supabase query to filter by category based on slot
2. Add .eq('categories.slug', slotCategories) filter
3. Handle case when no products match category
```

### 1.3 Create saved_outfits Table

**Database Migration Required**

The SaveLookModal uses `saved_outfits` table which may not exist.

```sql
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  share_id TEXT UNIQUE NOT NULL,
  avatar_gender TEXT NOT NULL,
  avatar_body_type TEXT NOT NULL,
  equipped_items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read shared outfits, only owner can write
CREATE POLICY "Anyone can read saved outfits"
  ON public.saved_outfits FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own outfits"
  ON public.saved_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

---

## Phase 2: Performance Optimization

### 2.1 Texture Caching System

**File:** `src/components/try-on/hooks/useGarmentTexture.tsx`

**Issue:** Textures are loaded fresh on every component mount, causing memory pressure and repeated network requests.

**Solution:**
- Implement a global texture cache Map
- Check cache before loading
- Dispose textures when component unmounts AND no other components use them
- Add reference counting

```text
Changes:
1. Create textureCache: Map<string, { texture: THREE.Texture, refCount: number }>
2. In useGarmentTexture: check cache first, increment refCount
3. On cleanup: decrement refCount, dispose if zero
4. Clear logging to reduce console noise in production
```

### 2.2 Geometry Memoization

**Files:** All garment geometry components

**Issue:** Geometries are recreated on every render even when props haven't changed.

**Solution:**
- Ensure all geometry creation uses useMemo with correct dependencies
- Move static geometries outside component scope
- Use geometry instancing for repeated elements (sleeve cuffs, collar rings)

### 2.3 Mobile Performance Mode

**File:** `src/components/try-on/TryOnCanvas.tsx`

**Solution:**
- Detect mobile devices and reduce quality settings
- Lower polygon count for lathe geometries on mobile (32 segments to 20)
- Disable ContactShadows on low-end devices
- Use simpler lighting setup

---

## Phase 3: UX Enhancements

### 3.1 Loading States for 3D Model

**File:** `src/components/try-on/TryOnCanvas.tsx`

**Enhancement:**
- Show skeleton loader while textures load
- Progressive loading indicator per garment
- Smooth fade-in when garment appears

### 3.2 Error Boundary for 3D Canvas

**New File:** `src/components/try-on/TryOnErrorBoundary.tsx`

**Purpose:**
- Catch WebGL crashes gracefully
- Show fallback UI with 2D product images
- Provide "Reload 3D View" button
- Log errors for debugging

### 3.3 Accessibility Improvements

**File:** `src/components/try-on/SaveLookModal.tsx`

**Fix:** Add DialogDescription to resolve WCAG warning

```tsx
<DialogDescription className="sr-only">
  Save your current outfit configuration to share with others
</DialogDescription>
```

### 3.4 Haptic Feedback Guard

**Multiple Files**

**Fix:** Wrap navigator.vibrate calls in try-catch and user interaction check

```typescript
const safeVibrate = (pattern: number | number[]) => {
  try {
    if (document.hasFocus() && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Silently fail - haptic is nice-to-have
  }
};
```

---

## Phase 4: Feature Completeness

### 4.1 Proper Category Mapping for Products

Ensure products are correctly categorized so ProductDrawer shows relevant items:

| Slot | Categories to Match |
|------|---------------------|
| head | caps, hats, headwear, beanies |
| top | t-shirts, shirts, tops, tees |
| outerwear | hoodies, jackets, sweaters |
| bottom | pants, jeans, shorts |
| footwear | shoes, sneakers, boots |

### 4.2 Garment Layering Z-Order

**File:** `src/components/try-on/Avatar3D.tsx`

**Enhancement:** Ensure proper render order when wearing multiple items:
1. Base: Mannequin body
2. Layer 1: Top (t-shirt/tank)
3. Layer 2: Outerwear (hoodie/jacket)
4. Layer 3: Bottom (pants/shorts)
5. Layer 4: Footwear
6. Layer 5: Head (beanie/cap)

### 4.3 Real-Time Body Morphing

Current body measurements update the mannequin, but garments don't adjust dynamically.

**Enhancement:** Pass bodyScale to all garment components (already partially implemented) and ensure shoulder junctions, hem widths, and sleeve lengths adapt.

---

## Implementation Priority

### Immediate (Day 1)
1. Create saved_outfits database table
2. Fix ProductDrawer category filtering
3. Add WebGL context loss handler

### Week 1
4. Implement texture caching
5. Add TryOnErrorBoundary
6. Fix accessibility warnings

### Week 2
7. Mobile performance optimizations
8. Loading state improvements
9. Garment layering refinement

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/try-on/TryOnCanvas.tsx` | WebGL handlers, mobile performance |
| `src/components/try-on/ProductDrawer.tsx` | Category filtering query |
| `src/components/try-on/hooks/useGarmentTexture.tsx` | Texture caching |
| `src/components/try-on/SaveLookModal.tsx` | DialogDescription |
| Database | Create saved_outfits table |

---

## Testing Checklist

- [ ] 3D mannequin renders on page load
- [ ] Clicking outfit slot opens ProductDrawer with relevant products
- [ ] Selecting product equips garment on mannequin
- [ ] Texture appears correctly on garment front
- [ ] Body measurements change mannequin proportions
- [ ] Save Look creates shareable URL
- [ ] Shared URL loads outfit correctly
- [ ] Mobile view shows bottom bar with outfit slots
- [ ] No WebGL context loss after 5+ minutes of use
- [ ] No console errors in production

