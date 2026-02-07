

# Editorial Landing Page ("Brand Gate") for Line of Judah
## Full-Screen Immersive Entry Experience at Root URL

---

## Executive Summary

This plan creates a **dedicated landing page** at the root URL (`/`) that serves as the brand's "front door" - a full-screen editorial experience that visitors see first when they arrive at `lineofjudah.com`. This is NOT a navigation overlay, but an actual page component.

**The Architecture Change:**
```text
CURRENT:
  /           → Index.tsx (full homepage with products, sections, etc.)
  
PROPOSED:
  /           → LandingPage.tsx (full-screen editorial brand gate)
  /home       → Index.tsx (full homepage - renamed route)
  /shop       → /category/shop (unchanged)
```

---

## Part 1: Visual Architecture

### 1.1 Page Layout

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Logo]                                                 │  Floating top-left
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│            S H O P                                      │
│          L O O K B O O K                                │  Centered vertically
│          C O M M U N I T Y                              │  Staggered entry
│            A B O U T                                    │
│          C O N T A C T                                  │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                   [Account]        [@instagram]         │  Floating bottom
│                                                         │
└─────────────────────────────────────────────────────────┘
         Full viewport (100dvh)
         Background: Cream hoodie with lion logo
         Dark text (stone-900) for contrast
         NO header/footer from Layout component
         NO close button (this IS the page)
```

### 1.2 Key Differences from Navigation Overlay

| Aspect | Navigation Overlay | Landing Page |
|--------|-------------------|--------------|
| Purpose | Menu that opens/closes | Actual page route |
| URL | No URL change | Lives at `/` |
| Close button | Has X button | No close button |
| Header/Footer | None (overlay) | None (immersive) |
| Body scroll | Locked when open | Normal page behavior |
| Back button | Closes overlay | Normal browser history |

---

## Part 2: Technical Implementation

### 2.1 Files to Create

| File | Purpose |
|------|---------|
| `src/pages/LandingPage.tsx` | Full-screen editorial landing page |

### 2.2 Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Update routing: `/` → `LandingPage`, `/home` → `Index` |

### 2.3 Routing Changes

**Before:**
```typescript
<Route path="/" element={<PageTransition><Index /></PageTransition>} />
```

**After:**
```typescript
<Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
<Route path="/home" element={<PageTransition><Index /></PageTransition>} />
```

---

## Part 3: LandingPage Component Design

### 3.1 Component Structure

```typescript
const LandingPage = () => {
  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundImage: `url('/nav-hero-hoodie.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-stone-50/5 pointer-events-none" />
      
      {/* Header: Logo only (no close button) */}
      <header>...</header>
      
      {/* Centered navigation links */}
      <nav>...</nav>
      
      {/* Footer: Account + Social */}
      <footer>...</footer>
    </div>
  );
};
```

### 3.2 Navigation Links

```typescript
const NAV_LINKS = [
  { label: "SHOP", href: "/category/shop" },
  { label: "LOOKBOOK", href: "/lookbook" },
  { label: "COMMUNITY", href: "/community" },
  { label: "ABOUT", href: "/about/our-story" },
  { label: "CONTACT", href: "/contact" },
];
```

### 3.3 Key Visual Specs

| Element | Specification |
|---------|--------------|
| Background | `/nav-hero-hoodie.png`, cover, center |
| Primary text | `text-stone-900` (near-black for contrast) |
| Nav links | `text-[14px] uppercase tracking-[0.25em] leading-[3.5]` |
| Hover state | `text-amber-700` (warm brown) |
| Logo | `brightness-0` filter (dark version) |
| Footer text | `text-[11px] uppercase tracking-[0.15em]` |

---

## Part 4: Animation Choreography

### 4.1 Entry Animation (On Page Load)

| Step | Element | Animation | Timing |
|------|---------|-----------|--------|
| 1 | Background | Fade in + subtle scale (1.02 → 1.0) | 0.7s, ease-out |
| 2 | Logo | Fade in + slide down | 0.4s, 0.15s delay |
| 3 | Link 1 | Fade in + slide up | 0.5s, 0.25s delay |
| 4 | Link 2 | Fade in + slide up | 0.5s, 0.30s delay |
| 5 | Link 3 | Fade in + slide up | 0.5s, 0.35s delay |
| 6 | Link 4 | Fade in + slide up | 0.5s, 0.40s delay |
| 7 | Link 5 | Fade in + slide up | 0.5s, 0.45s delay |
| 8 | Footer | Fade in | 0.4s, 0.5s delay |

### 4.2 Framer Motion Variants

```typescript
const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.5, when: "beforeChildren" }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const linkVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.2 }
  }
};
```

---

## Part 5: Mobile Considerations

### 5.1 Safe Area Handling

```css
/* Header */
padding-top: max(env(safe-area-inset-top), 24px);

/* Footer */
padding-bottom: max(env(safe-area-inset-bottom), 24px);
```

### 5.2 Touch Targets

| Element | Minimum Size |
|---------|-------------|
| Nav links | 48px touch height (via `py-3` + line-height) |
| Logo | 44x44px tap area |
| Footer links | 44px height minimum |

### 5.3 Viewport Units

```css
/* Use dynamic viewport height for mobile */
height: 100dvh;
```

---

## Part 6: Accessibility Requirements

### 6.1 Semantic Structure

```html
<main>
  <header>
    <a href="/home">Logo</a>
  </header>
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li><a href="/category/shop">SHOP</a></li>
      ...
    </ul>
  </nav>
  <footer>
    <a href="/account">Account</a>
    <a href="instagram.com/...">@lineofjudahwear</a>
  </footer>
</main>
```

### 6.2 Focus States

```css
.nav-link:focus-visible {
  outline: none;
  color: amber-700;
}
```

### 6.3 Reduced Motion

```typescript
const prefersReducedMotion = useReducedMotion();
const safeVariants = prefersReducedMotion ? simpleVariants : animatedVariants;
```

---

## Part 7: SEO Considerations

### 7.1 Meta Tags

The landing page should include proper meta tags:

```tsx
<Helmet>
  <title>Line of Judah | Premium Faith-Based Streetwear</title>
  <meta name="description" content="For those who walk different. Premium streetwear that speaks to your faith without saying a word." />
</Helmet>
```

### 7.2 Internal Linking

The landing page provides clear navigation to:
- `/category/shop` - Shop
- `/lookbook` - Lookbook  
- `/community` - Community
- `/about/our-story` - About
- `/contact` - Contact

---

## Part 8: Implementation Steps

### Step 1: Create LandingPage.tsx

Create new page component at `src/pages/LandingPage.tsx` with:
- Full-viewport layout (`100dvh`, `fixed inset-0`)
- Background image styling
- Centered navigation stack
- Header with logo (no close button)
- Footer with account/social
- Staggered entry animations
- Reduced motion support
- Mobile safe-area handling

### Step 2: Update App.tsx Routing

Modify routes to:
- `/` → `LandingPage` (new landing experience)
- `/home` → `Index` (current homepage content)

### Step 3: Update Internal Links

Ensure the logo in `LandingPage` links to `/home` (the full homepage with products).

---

## Part 9: Quality Checklist

### Visual Quality
- [ ] Background image covers viewport without distortion
- [ ] Lion logo visible through navigation links
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Consistent spacing across viewports
- [ ] Safe areas respected on iOS

### Animation Quality  
- [ ] Entry animation feels editorial, not jarring
- [ ] Stagger timing creates visual rhythm
- [ ] Reduced motion preference respected
- [ ] No layout shift during animation

### Accessibility
- [ ] All links keyboard navigable
- [ ] Focus states visible
- [ ] Semantic heading structure
- [ ] Screen reader announces navigation

### Performance
- [ ] Background image optimized (WebP, srcset)
- [ ] No layout shift (CLS = 0)
- [ ] First paint under 1.5s
- [ ] Total page weight under 500KB

---

## Part 10: Success Criteria

After implementation, the landing page must:

1. **Be the first thing visitors see** at the root URL
2. **Feel like a brand statement** - immersive, editorial, premium
3. **Provide clear navigation** to all site sections
4. **Work flawlessly on mobile** - safe-area aware, touch-friendly
5. **Load instantly** - optimized assets, minimal JS
6. **Follow Swedish restraint** - minimal elements, maximum impact

