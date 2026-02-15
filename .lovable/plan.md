

# Fix the Community Page Sticky Filter Bar

## Problems Identified

1. **Truncated labels**: The "All Products" and "Most Recent" select triggers show as "ALL..." and "MOST..." because they're constrained to 140px and 130px widths — too narrow for the uppercase tracked text
2. **Excessive vertical padding**: `py-5` (20px top + 20px bottom) makes the sticky bar feel bloated and wastes precious viewport space when stuck at the top
3. **No sticky visual feedback**: When the bar sticks to the top of the viewport, there's no shadow or visual cue to separate it from the content below — it just floats ambiguously
4. **Select trigger styling**: The `border-0 shadow-none` removes all affordance — users can't tell these are interactive dropdowns

## Changes — Single File

**File: `src/components/community/StoryFilters.tsx`**

### 1. Widen Select triggers
- Product filter: `w-[140px]` becomes `w-[160px]`
- Sort: `w-[130px]` becomes `w-[150px]`
- This gives the uppercase tracked text enough room to display fully

### 2. Reduce vertical padding
- Desktop: `py-5` becomes `py-3` — tighter, more editorial, better sticky behavior
- The amber underline indicator position adjusts from `-bottom-5` to `-bottom-3` to match

### 3. Add sticky shadow
- Add a subtle `shadow-sm` to the outer container so when it sticks, there's a clear visual boundary between the filter bar and the content scrolling beneath it

### 4. Tighten tab gap
- Reduce `gap-10` between story type tabs to `gap-8` for better visual density on the left side

## What Does NOT Change
- No homepage changes
- No nav structure changes
- No new dependencies
- Mobile horizontal scroll layout unchanged
- Filter logic unchanged
- No other pages affected

