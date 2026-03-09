

# Round 32 — Performance: Lazy-Load Heavy Route Components

## Issue Found

Every route in `App.tsx` is eagerly imported — all 30+ page components are bundled into the initial JavaScript payload. This includes heavy pages like `TryOnRoom` (Three.js + R3F), `Lookbook` (complex gallery), and all admin pages that most users never visit. This directly impacts:

- First Contentful Paint (FCP) — user waits for admin code they'll never use
- Time to Interactive (TTI) — cart/checkout responsiveness is delayed by parsing unused code
- Mobile performance — critical on slower connections

The Three.js dependency alone (`three`, `@react-three/fiber`, `@react-three/drei`) adds ~500KB+ of parsed JavaScript that loads for every single page view, even the homepage.

## Fix

Convert all route imports in `App.tsx` from static `import` to `React.lazy()` with dynamic `import()`. Wrap the `AnimatedRoutes` content in a `<Suspense>` boundary with a minimal loading state.

### Change: `src/App.tsx`

1. Replace all 30+ static page imports (lines 18-56) with `React.lazy()` calls:

```typescript
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const Category = lazy(() => import("./pages/Category"));
// ... all pages
```

2. Add `Suspense` with a minimal loader inside `AnimatedRoutes`, wrapping the `<Routes>` block:

```typescript
<Suspense fallback={<div className="min-h-screen bg-background" />}>
  <Routes>...</Routes>
</Suspense>
```

3. Keep `ScrollToTop`, `PageTransition`, `ProtectedRoute`, and `ProtectedAccountRoute` as static imports — they're lightweight and needed on every route.

### What This Achieves
- Initial bundle shrinks significantly (Three.js/admin/lookbook deferred)
- Homepage loads faster for first-time visitors
- Cart drawer, auth modal, and checkout become interactive sooner
- Zero visual change — the empty `min-h-screen bg-background` fallback matches the page background

### What Is NOT Changed
- No layout, typography, or spacing changes
- No auth logic changes
- No database changes
- All scroll lock, overlay, and UX fixes from rounds 23-31 preserved
- `useAuth`, `useCart`, and other providers remain eagerly loaded (they must be)

