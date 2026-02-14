

# Fix "The Purpose" Section: Universal for All Garments

## Problem
The `HowItMinisters` component on every product page has two hardcoded elements that only make sense for shirts:

1. **Title:** "More Than A Shirt. A Daily Declaration." -- breaks for hoodies, jackets, hats, pants
2. **Verse:** Matthew 5:16 -- not the brand's foundational verse

Meanwhile, the admin form's "Ministry Statement" field already works correctly as a per-product custom description. No admin changes needed.

## Solution

Update one file: `src/components/product/HowItMinisters.tsx`

### Changes

**Title line:** Replace "More Than A Shirt." with "More Than A Garment." -- works universally for hoodies, crewnecks, hats, pants, jackets, everything.

**Verse:** Replace Matthew 5:16 with the brand's foundational verse from Exodus 28:2 (ASV):
> "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."
> -- Exodus 28:2 (ASV)

**Default description fallback:** Update the auto-generated fallback text (used when admin leaves the ministry statement blank) to say "garment" instead of "fabric and thread" shirt-specific language.

### What stays the same
- The admin product form's "Ministry Statement" textarea -- already works perfectly for writing custom per-product descriptions
- All layout, typography, spacing, and animations -- zero visual changes
- The "The Purpose" label above the title
- The "Read Our Story" link

### Technical scope
- 1 file edited: `src/components/product/HowItMinisters.tsx`
- ~6 line replacements (title text, verse text, default statement text)
- Both the reduced-motion and animated versions get the same updates

