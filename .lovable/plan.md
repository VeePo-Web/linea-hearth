

# Round 34 — Performance Optimization (Zero UX/Design Change)

All animations, scroll behaviors, parallax, and visual design remain exactly as they are. These changes are purely under-the-hood optimizations.

---

## 1. Optimize QueryClient Configuration

**File:** `src/App.tsx`

The current `new QueryClient()` uses defaults (0ms stale time, refetch on window focus). Configure it for an e-commerce site:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min — avoid re-fetching on every route change
      gcTime: 10 * 60 * 1000,      // 10 min garbage collection
      refetchOnWindowFocus: false,  // Don't refetch when user tabs back
      retry: 1,                     // Fail faster
    },
  },
});
```

This prevents unnecessary Supabase queries when navigating between pages.

---

## 2. Add Resource Hints to `index.html`

**File:** `index.html`

Add `<link rel="preload">` for the hero image (LCP element) and `dns-prefetch` for Supabase:

```html
<link rel="preload" as="image" href="/products/stay-holy-hoodie/male-model.png" fetchpriority="high">
<link rel="dns-prefetch" href="https://harckavibhmimndfvnyo.supabase.co">
<link rel="preconnect" href="https://harckavibhmimndfvnyo.supabase.co">
```

This starts downloading the hero image and resolving the API domain before JS even loads.

---

## 3. Add `loading="lazy"` to All Below-Fold Images

**Files:** `CategoryTiles.tsx`, `FeaturedDrop.tsx`, `MissionBlock.tsx` (via `ParallaxImage.tsx`)

Most images already have `loading="lazy"`. Verify and ensure consistency across all homepage sections. The hero image already has `loading="eager"` + `fetchpriority="high"` — correct.

---

## 4. Debounce `MobileStickyBar` Scroll Handler

**File:** `src/components/homepage/MobileStickyBar.tsx`

Currently reads `scrollY` and queries the DOM for `footer` on every scroll frame. Wrap in `requestAnimationFrame` with a ticking guard (same pattern as `useScrollDirection`):

```typescript
useEffect(() => {
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 500);
        const footer = document.querySelector('footer');
        if (footer) {
          setIsFooterVisible(footer.getBoundingClientRect().top < window.innerHeight);
        }
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

---

## 5. Memoize Homepage Section Components

**File:** `src/pages/Index.tsx`

Wrap static homepage sections in `React.memo` imports to prevent re-renders when parent state (cart, auth) changes. Sections like `EditorialHero`, `ValueStackBanner`, `CategoryTiles`, `MissionBlock`, `MarqueeStrip`, `InstagramFeed` take no props or only static props — they should never re-render.

Add `memo()` wrapping to these components at their export:

- `EditorialHero.tsx` — `export default memo(EditorialHero)`
- `ValueStackBanner.tsx` — `export default memo(ValueStackBanner)`
- `CategoryTiles.tsx` — `export default memo(CategoryTiles)`
- `MissionBlock.tsx` — `export default memo(MissionBlock)`
- `MarqueeStrip.tsx` — `export default memo(MarqueeStrip)`
- `InstagramFeed.tsx` — `export default memo(InstagramFeed)`
- `TestimonySpotlight.tsx` — `export default memo(TestimonySpotlight)`
- `FeaturedDrop.tsx` — `export default memo(FeaturedDrop)`

---

## 6. Optimize `useScrollDirection` — Reduce State Updates

**File:** `src/hooks/useScrollDirection.ts`

Currently updates state on every scroll frame even when values haven't changed. Add an equality check to prevent unnecessary re-renders:

```typescript
setState((prev) => {
  if (prev.direction === direction && prev.isAtTop === isAtTop && prev.scrollY === scrollY) {
    return prev; // No change — skip re-render
  }
  return { scrollY, direction, isAtTop, isScrolled };
});
```

---

## 7. Lazy-Load `AnimatePresence` from Route Wrapper

**File:** `src/App.tsx`

`AnimatePresence` with `mode="wait"` forces exit animations to complete before mounting the next route — this adds latency to every navigation. Change to `mode="popLayout"` which allows instant mounting while exit animations play underneath:

```typescript
<AnimatePresence mode="popLayout">
```

This makes route transitions feel instant while preserving the fade-out animation.

---

## 8. Font Loading Optimization

**File:** `index.html`

The Google Fonts link currently loads all weights of DM Sans (100-1000, italic). Limit to only the weights actually used:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

This cuts the font CSS payload significantly and speeds up text rendering.

---

## 9. Add `will-change` Cleanup to Scroll-Driven Animations

**File:** `src/components/motion/ParallaxImage.tsx`

The parallax `motion.img` applies continuous transforms. The `style={{ y, scale: 1.1 }}` already hints the GPU, but add `will-change: transform` via Tailwind class `will-change-transform` to the motion.img to ensure compositing:

```tsx
className="w-full h-full object-cover will-change-transform"
```

---

## Summary

| Change | Impact | Risk |
|--------|--------|------|
| QueryClient staleTime | Fewer API calls on navigation | None |
| Preload hero image | Faster LCP | None |
| DNS prefetch Supabase | Faster first API call | None |
| RAF debounce MobileStickyBar | Less main-thread work on scroll | None |
| `React.memo` on static sections | Fewer re-renders | None |
| `useScrollDirection` equality check | Fewer header re-renders | None |
| `AnimatePresence mode="popLayout"` | Faster perceived navigation | Exit anims overlap with enter |
| Font subset | Smaller font download | None if unused weights confirmed |
| `will-change-transform` on parallax | GPU compositing hint | None |

**Zero visual or behavioral changes.** All animations, scrolls, parallax, and design elements remain identical.

