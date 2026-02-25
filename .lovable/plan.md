

# Final Amber-to-Champagne Cleanup -- Phase 3

The previous two phases migrated ~55+ files but a final audit reveals **10 more non-excluded instances** still using amber. This phase completes the migration to zero remaining amber outside the explicitly excluded files.

---

## Remaining Files to Fix

### 1. `src/components/legal/LegalPageLayout.tsx` (line 59)
- `text-amber-500` on "LAST UPDATED" eyebrow text
- Change to `text-champagne-500`

### 2. `src/components/product/LookbookLookSection.tsx` (lines 189, 246)
- `text-amber-600/80` on scripture references (2 instances)
- Change to `text-champagne-600/80`

### 3. `src/components/product/LookbookProductCard.tsx` (lines 107, 185)
- `bg-amber-600/90` on quick-add success overlay
- `text-amber-600` on size memory indicator
- Change to `bg-champagne-600/90` and `text-champagne-600`

### 4. `src/components/community/StoryCard.tsx` (line 78)
- `from-amber-950/80` in gradient fallback
- Change to `from-stone-900/80` (matching the other gradient entries -- this is a very dark tone, stone is more appropriate than champagne-900 which doesn't exist at 950)

### 5. `src/components/homepage/HeroBlock.tsx` (line 22)
- `via-amber-950` in hero background gradient
- Change to `via-stone-800` (dark background gradient, not an accent)

### 6. `src/components/accessibility/AccessibilityFeedback.tsx` (line 198)
- `bg-amber-500/5 border border-amber-500/20` on priority checkbox container
- Change to `bg-champagne-500/5 border border-champagne-500/20`

### 7. `src/components/cart/CartItem.tsx` (line 133)
- `text-amber-600` on "Only X left" low stock badge
- Change to `text-champagne-600` (this is a soft warning, not urgency-level)

### 8. `src/components/checkout/RewardsProgress.tsx` (line 29)
- `from-amber-400 to-amber-500` gradient on progress bar fill
- Change to `from-champagne-400 to-champagne-500`

### 9. `src/components/about/WearTheMissionCTA.tsx` (line 40)
- `to-amber-500` in image gradient overlay
- Change to `to-champagne-500`

---

## Explicitly EXCLUDED (no changes, keeping amber)
- `src/components/product/FlashSaleTimer.tsx` -- urgency/warning semantic
- `src/components/checkout/UrgencyTimer.tsx` -- urgency/warning semantic
- `src/components/try-on/utils/sizeRecommendation.ts` -- semantic fit indicator (green/amber/red)
- `src/components/try-on/avatar-creator/avatarPresets.ts` -- skin tone name "Amber" (not a UI color)
- `src/pages/admin/*` -- admin dashboard indicators
- `src/components/about/WearTheMissionCTA.tsx` line 51 comment -- just a code comment, not rendered

---

## Implementation
9 files, ~12 line changes total. All class-name-only swaps, no layout or copy changes.
