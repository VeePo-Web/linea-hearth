

# Remove Hero Eyebrow Text

## Overview

Remove the "Not a costume. Armor." eyebrow text from the top-left corner of the homepage hero section.

---

## Current State

The text is located in `src/components/homepage/EditorialHero.tsx` at lines 100-110:

```tsx
{/* Top Section - Eyebrow */}
<div className="pt-8">
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="text-[10px] md:text-xs font-light tracking-[0.4em] uppercase text-muted-foreground"
  >
    Not a costume. Armor.
  </motion.p>
</div>
```

---

## Implementation

**File:** `src/components/homepage/EditorialHero.tsx`

**Action:** Delete lines 100-110 (the entire "Top Section - Eyebrow" block)

This removes:
- The wrapper `<div className="pt-8">`
- The animated `<motion.p>` containing the text
- The comment `{/* Top Section - Eyebrow */}`

---

## Result

The hero will now start directly with the massive "WEAR YOUR FAITH." typography, creating a cleaner, more impactful first impression that follows Swedish design restraint—fewer elements, more meaning per element.

