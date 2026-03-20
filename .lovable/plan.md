

# Round 33 — Replace Placeholder Social Proof with "Coming soon..." + Hide Products

## Overview

Two changes:
1. Replace all hardcoded fake reviews, testimonials, social posts, and ambassador content with clean "Coming soon..." placeholder states
2. Set the 3 existing products to `draft` status so they no longer appear on the storefront

## Database Change

Use the insert tool to update the 3 products to draft status:

```sql
UPDATE products SET status = 'draft' WHERE slug IN ('stay-holy-hoodie', 'heavenly-crewneck', 'stay-holy');
```

This hides them from the storefront (RLS policy filters on `status = 'active'`) but preserves all data for later use.

## Component Changes

### 1. MarqueeStrip.tsx (Homepage review marquee)
Replace the entire review array + marquee animation with a single centered line:
```
Coming soon...
```
Keep the same section wrapper and background styling. Remove the star rendering, pause handlers, and duplicated array logic.

### 2. ReviewsCarousel.tsx (Homepage testimonials carousel)
Replace the full carousel (mock reviews, auto-scroll, arrows, dots) with a centered "Coming soon..." message inside the existing dark `bg-stone-900` section. Keep the section header ("Testimonials" / "What Our Community Says").

### 3. TestimonySpotlight.tsx (Homepage large testimonial block)
Keep the left image (`/products/stay-holy-hoodie/female-model-2.png`) as requested. Replace the right-side quote content (fake "Marcus T." testimonial) with "Coming soon..." centered in the text area. Keep the "Read More Stories" CTA link.

### 4. InstagramFeed.tsx (Homepage Instagram grid)
Replace the image grid with a single "Coming soon..." message. Keep the header with the Instagram icon, `@lineofjudahwear` handle, and "Follow" link. Remove the mobile/desktop image grids.

### 5. SocialFeed.tsx (Community page social grid)
Replace the entire post grid (8 fake social cards) with a centered "Coming soon..." message. Keep the section header (`#LineOfJudah`, "Join The Movement") and the "Follow @lineofjudah" CTA button.

### 6. CurrentAmbassadors.tsx (Ambassador page)
Replace the 6 fake ambassador avatars with a centered "Coming soon..." message. Keep the "Meet the tribe" header. Remove the "You?" dashed circle.

### 7. StoryCommunityStats.tsx (Our Story page)
Replace the testimonial marquee at the bottom with "Coming soon..." text. **Keep the stats** (10K+, 45, 5) and the section header — those are marketing copy, not social proof.

### 8. StoryGrid.tsx (Community page) — Fallback array
Replace the 6-item hardcoded fallback array with a "Coming soon..." empty state when no DB data exists.

### 9. CommunityHero.tsx — Fallback story
Replace the hardcoded "Marcus T." fallback with a "Coming soon..." state when no featured story exists in DB.

### 10. StyledByTribe.tsx (PDP UGC section) — Fallback
Replace the 4-item mock UGC fallback with a "Coming soon..." empty state.

### 11. MinistryInMotion.tsx (Our Story UGC) — Fallback
Replace the 6-item placeholder fallback with a "Coming soon..." empty state.

### 12. FeaturedCollection.tsx + DropGrid.tsx — Product fallbacks
Replace the hardcoded placeholder product arrays with a "Coming soon..." empty state when DB returns no active products (which it will after we set products to draft).

## Styling Pattern for "Coming soon..."

Every "Coming soon..." state uses this consistent pattern — no new CSS, just existing Tailwind classes:

```tsx
<div className="flex items-center justify-center py-16">
  <p className="text-sm text-muted-foreground font-light tracking-wide">
    Coming soon...
  </p>
</div>
```

Adapts background color to match the existing section (e.g., `text-white/40` on dark sections).

## What Is NOT Changed
- Hero images, lookbook images, product photography — all kept
- EditorialHero drop badge ("Drop 001") — editorial content, kept
- FeaturedDrop section — editorial content, kept
- Marketing stats (10K+ Believers, 45 Cities) — kept as aspirational copy
- No layout, typography, or spacing changes to surrounding sections
- No database schema changes
- No auth or admin logic changes

