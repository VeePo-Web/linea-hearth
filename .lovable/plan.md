
# Full-Screen Editorial Navigation Overlay for Line of Judah
## Complete Implementation Blueprint

---

## Executive Summary

This plan transforms the current slide-in mobile menu (`MobileMenu.tsx`) into a **full-screen editorial navigation experience** inspired by Anointed Apparel's navigation page. The new navigation will feature:

1. **Full-bleed hero backdrop** using the cream/beige hoodie with lion logo
2. **Centered link stack** with editorial typography (small caps, wide tracking)
3. **Staggered entrance animations** following 032c/DAZED principles
4. **Mobile-first, luxury-first** design that feels like a magazine spread

The background image creates a warm, premium texture that lets the lion logo and "LINE OF JUDAH" branding shine through the navigation links.

---

## Part 1: Visual Architecture Analysis

### Current State (MobileMenu.tsx)
```text
┌─────────────────────────────────┐
│ [Logo]                    [X]  │  Header bar
├─────────────────────────────────┤
│                                 │
│    SHOP           [chevron]    │  Large links, left-aligned
│    LOOKBOOK                    │
│    COMMUNITY                   │
│    ABOUT                       │
│                                 │
│    ───────                     │  Divider
│    Our Story                   │  Secondary links
│    Size Guide                  │
│    Customer Care               │
│                                 │
├─────────────────────────────────┤
│  [Search]    [Favorites]       │  Action buttons
│  Account   [Social icons]      │  Footer
└─────────────────────────────────┘
         Panel (max-width: md)
         Slides in from right
```

### Target State (FullScreenNav.tsx)
```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Logo]                                           [X]  │  Floating header
│                                                         │
│                                                         │
│                                                         │
│      ┌───────────────────────────────────────────┐     │
│      │                                           │     │
│      │                                           │     │
│      │            S H O P                        │     │
│      │          L O O K B O O K                  │     │
│      │          C O M M U N I T Y                │     │
│      │            A B O U T                      │     │
│      │          C O N T A C T                    │     │
│      │                                           │     │
│      │                                           │     │
│      └───────────────────────────────────────────┘     │
│                                                         │
│                                                         │
│                   [Account]        [@instagram]         │  Floating footer
│                                                         │
└─────────────────────────────────────────────────────────┘
         Full viewport (100dvh)
         Background: Cream hoodie with lion
         Dark text for legibility
         Fade/scale entrance animation
```

---

## Part 2: Design System Specifications

### 2.1 Color Treatment

Since the background image is cream/beige (#F5E6C8 range), we need **dark text for maximum contrast**:

| Element | Color | Rationale |
|---------|-------|-----------|
| Primary links | `#1A1A1A` (near-black) | Maximum contrast on cream |
| Close button | `#1A1A1A` | Consistency |
| Logo | Dark variant or SVG with dark fill | Match the theme |
| Hover state | `#8B7355` (warm brown) | Derived from lion mane color |
| Secondary links | `#5C5C5C` (medium gray) | Hierarchy |
| Background scrim | None or subtle `rgba(0,0,0,0.03)` | Let fabric texture shine |

### 2.2 Typography Specifications

Following DAZED/032c editorial restraint with the image showing the lion logo:

| Element | Spec | CSS |
|---------|------|-----|
| Primary nav links | 14-16px, all-caps, tracking 0.25em | `text-[14px] uppercase tracking-[0.25em]` |
| Line height | 3.5 (generous vertical rhythm) | `leading-[3.5]` |
| Font weight | Light (300) | `font-light` |
| Letter spacing | Wide editorial tracking | `tracking-[0.25em]` |
| Secondary links | 11px, all-caps, tracking 0.15em | `text-[11px] uppercase tracking-[0.15em]` |

### 2.3 Layout Dimensions

```text
Desktop (≥1024px):
├── Full viewport: 100dvh
├── Header bar: fixed top, padding-x: 32px, padding-y: 24px
├── Link stack: centered vertically and horizontally
├── Footer bar: fixed bottom, padding-x: 32px, padding-y: 24px
└── Background: cover, center-center, no-repeat

Mobile (<1024px):
├── Full viewport: 100dvh (dynamic viewport height)
├── Header: safe-area-inset-top respected
├── Link stack: slightly larger tracking on mobile
├── Footer: safe-area-inset-bottom respected
└── Touch targets: 48px minimum height per link
```

### 2.4 Background Image Treatment

The uploaded image shows a cream/beige hoodie with:
- The roaring lion logo (center-left of image)
- "LINE OF JUDAH" text under the lion
- Visible zipper detail (right edge)
- Soft fleece fabric texture

**Background CSS:**
```css
background-image: url('/nav-hero-hoodie.png');
background-size: cover;
background-position: center center;
background-repeat: no-repeat;
```

**Image optimization:**
- Export at 1920x1080 for desktop, with srcset for mobile
- Use WebP format with JPEG fallback
- Lazy loading not needed (hero content)

---

## Part 3: Animation Choreography

### 3.1 Entry Sequence (When menu opens)

| Step | Element | Animation | Duration | Delay |
|------|---------|-----------|----------|-------|
| 1 | Backdrop | Fade in | 0.3s | 0ms |
| 2 | Background image | Scale 1.02 → 1.0 + fade in | 0.7s | 0ms |
| 3 | Logo (top-left) | Fade in + slide down 10px | 0.4s | 0.2s |
| 4 | Close button (top-right) | Fade in + slide down 10px | 0.4s | 0.2s |
| 5 | Link 1 (SHOP) | Fade in + slide up 20px | 0.5s | 0.25s |
| 6 | Link 2 (LOOKBOOK) | Fade in + slide up 20px | 0.5s | 0.30s |
| 7 | Link 3 (COMMUNITY) | Fade in + slide up 20px | 0.5s | 0.35s |
| 8 | Link 4 (ABOUT) | Fade in + slide up 20px | 0.5s | 0.40s |
| 9 | Link 5 (CONTACT) | Fade in + slide up 20px | 0.5s | 0.45s |
| 10 | Footer elements | Fade in | 0.4s | 0.5s |

### 3.2 Exit Sequence (When menu closes)

| Element | Animation | Duration |
|---------|-----------|----------|
| All content | Fade out simultaneously | 0.2s |
| Background | Fade out | 0.3s |

### 3.3 Hover Interactions

| Element | Hover State |
|---------|-------------|
| Nav links | Color shift to warm brown `#8B7355` |
| Nav links | Optional subtle letter-spacing increase (0.25em → 0.28em) |
| Close button | Rotate 90deg |
| Social icons | Scale 1.1 |

### 3.4 Framer Motion Variants

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const backgroundVariants = {
  hidden: { opacity: 0, scale: 1.02 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94], // editorial easing
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};
```

---

## Part 4: Component Architecture

### 4.1 New File: `FullScreenNav.tsx`

```text
src/components/header/FullScreenNav.tsx
```

**Component Props:**
```typescript
interface FullScreenNavProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
  onFavoritesOpen: () => void;
  onAuthOpen: () => void;
}
```

**Internal Structure:**
```typescript
const FullScreenNav = ({ isOpen, onClose, ...props }) => {
  // Hooks
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const prefersReducedMotion = useReducedMotion();
  
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  
  // Focus trap for accessibility
  // ...
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50">
          {/* Background layer */}
          {/* Header (logo + close) */}
          {/* Centered link stack */}
          {/* Footer (account + social) */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 4.2 Navigation Links Array

Simplified link structure for the overlay (no nested submenus in this view):

```typescript
const NAV_LINKS = [
  { label: "SHOP", href: "/category/shop" },
  { label: "LOOKBOOK", href: "/lookbook" },
  { label: "COMMUNITY", href: "/community" },
  { label: "ABOUT", href: "/about/our-story" },
  { label: "CONTACT", href: "/contact" },
];
```

---

## Part 5: CSS/Tailwind Specifications

### 5.1 Container Layer

```tsx
<motion.div
  className="fixed inset-0 z-50 flex flex-col"
  style={{
    backgroundImage: `url('/nav-hero-hoodie.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
  variants={backgroundVariants}
>
  {/* Optional: subtle scrim for text legibility if needed */}
  <div className="absolute inset-0 bg-stone-100/10 pointer-events-none" />
  
  {/* Content layers */}
</motion.div>
```

### 5.2 Header Bar

```tsx
<motion.header
  className="relative z-10 flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8"
  style={{
    paddingTop: 'max(env(safe-area-inset-top), 24px)',
  }}
  variants={headerVariants}
>
  <Link to="/" onClick={onClose}>
    <img src="/logo.svg" alt="Line of Judah" className="h-5 w-auto filter brightness-0" />
  </Link>
  
  <button
    onClick={onClose}
    className="p-2 text-stone-900 hover:text-stone-600 transition-colors"
    aria-label="Close menu"
  >
    <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
      <X size={24} strokeWidth={1.5} />
    </motion.div>
  </button>
</motion.header>
```

### 5.3 Link Stack (Center)

```tsx
<nav
  className="flex-1 flex items-center justify-center"
  role="navigation"
  aria-label="Main navigation"
>
  <motion.ul
    className="text-center space-y-0"
    variants={containerVariants}
  >
    {NAV_LINKS.map((link, index) => (
      <motion.li key={link.label} variants={linkVariants}>
        <Link
          to={link.href}
          onClick={onClose}
          className="block py-3 text-[14px] md:text-[15px] font-light uppercase tracking-[0.25em] text-stone-900 hover:text-amber-700 transition-colors duration-300"
        >
          {link.label}
        </Link>
      </motion.li>
    ))}
  </motion.ul>
</nav>
```

### 5.4 Footer Bar

```tsx
<motion.footer
  className="relative z-10 flex items-center justify-between px-6 md:px-8 pb-6 md:pb-8"
  style={{
    paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
  }}
  variants={footerVariants}
>
  {/* Account link */}
  {user ? (
    <Link to="/account" onClick={onClose} className="text-[11px] uppercase tracking-[0.15em] text-stone-700">
      My Account
    </Link>
  ) : (
    <button onClick={() => { onClose(); onAuthOpen(); }} className="text-[11px] uppercase tracking-[0.15em] text-stone-700">
      Sign In
    </button>
  )}
  
  {/* Social link */}
  <a
    href={BRAND.social.instagram.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900"
  >
    {BRAND.social.instagram.handle}
  </a>
</motion.footer>
```

---

## Part 6: Accessibility Requirements

### 6.1 Focus Management

```typescript
// Focus trap on mount
useEffect(() => {
  if (isOpen) {
    // Focus the first link
    const firstLink = document.querySelector('[data-nav-link]') as HTMLElement;
    firstLink?.focus();
    
    // Trap focus within modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Implement focus trap
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }
}, [isOpen]);
```

### 6.2 ARIA Attributes

```tsx
<motion.div
  role="dialog"
  aria-modal="true"
  aria-label="Site navigation"
  className="fixed inset-0 z-50"
>
```

### 6.3 Reduced Motion Support

```typescript
const prefersReducedMotion = useReducedMotion();

const safeVariants = prefersReducedMotion ? {} : linkVariants;
```

---

## Part 7: Integration Plan

### 7.1 Files to Create

| File | Purpose |
|------|---------|
| `src/components/header/FullScreenNav.tsx` | New navigation overlay component |
| `public/nav-hero-hoodie.png` | Copy user's uploaded image here |

### 7.2 Files to Modify

| File | Changes |
|------|---------|
| `src/components/header/Navigation.tsx` | Replace `MobileMenu` with `FullScreenNav` |

### 7.3 Integration in Navigation.tsx

```typescript
// Change this import:
// import MobileMenu from "./MobileMenu";
import FullScreenNav from "./FullScreenNav";

// Replace the MobileMenu usage (line ~298-299):
<FullScreenNav
  isOpen={isMobileMenuOpen}
  onClose={() => setIsMobileMenuOpen(false)}
  onSearchOpen={() => setIsSearchOpen(true)}
  onFavoritesOpen={() => setOffCanvasType('favorites')}
  onAuthOpen={() => setIsAuthModalOpen(true)}
/>
```

### 7.4 Hamburger Behavior

The hamburger should now trigger the full-screen overlay on ALL screen sizes (not just mobile), making it a signature brand moment.

---

## Part 8: Image Preparation

### 8.1 Copy User's Uploaded Image

```bash
lov-copy user-uploads://ChatGPT_Image_Feb_7_2026_12_47_49_PM.png public/nav-hero-hoodie.png
```

### 8.2 Optional: Generate srcset Versions

For performance, consider creating:
- `nav-hero-hoodie-mobile.png` (750px wide)
- `nav-hero-hoodie.png` (1920px wide)

---

## Part 9: Quality Checklist

### Visual Quality
- [ ] Background image covers full viewport without distortion
- [ ] Lion logo visible behind navigation links
- [ ] Text contrast meets WCAG AA (minimum 4.5:1)
- [ ] Consistent spacing on all viewport sizes
- [ ] Safe area insets respected on iOS

### Animation Quality
- [ ] Entry animation feels editorial (not jarring)
- [ ] Stagger timing creates visual rhythm
- [ ] Exit is quick and clean
- [ ] Reduced motion preference respected

### Accessibility
- [ ] Focus trap implemented
- [ ] Escape key closes menu
- [ ] All links keyboard-navigable
- [ ] Screen reader announces dialog

### Performance
- [ ] No layout shift on open/close
- [ ] Image preloaded or lazy-loaded appropriately
- [ ] No scroll jank
- [ ] Body scroll locked when open

---

## Part 10: Success Criteria

After implementation, the navigation overlay must:

1. **Feel like a brand moment** - Not just a menu, but an editorial experience
2. **Showcase the lion logo** - The cream hoodie backdrop puts brand identity front and center
3. **Be lightning-fast** - Open in under 300ms perceived
4. **Work flawlessly on mobile** - Touch-friendly, safe-area aware
5. **Maintain accessibility** - Full keyboard and screen reader support
6. **Follow the restraint principle** - Minimal elements, maximum impact
