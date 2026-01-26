

# Fix Hero Typography Position - Implementation Plan

## Problem Diagnosis

The "WEAR YOUR FAITH." text is overlapping with the navigation bar due to a combination of layout decisions:

### Current Structure Analysis

```text
┌─────────────────────────────────────────────────────────────────┐
│ Layout.tsx                                                      │
│ ├── <Header /> (fixed, z-50, height: var(--header-height))      │
│ └── <main className="pt-[var(--header-height)]"> (100px offset) │
│     └── <EditorialHero /> (min-h-screen)                        │
│         └── Content Container (flex-col justify-between)        │
│             └── Typography Section (flex-1 justify-center)      │
│                 └── -mt-16 lg:-mt-24 ← PULLING TEXT UP          │
└─────────────────────────────────────────────────────────────────┘
```

### Root Cause

- **Line 102**: The typography container has `-mt-16 lg:-mt-24` (negative margin)
- This was intended to visually center the massive text, but it pulls it too high on certain viewport heights
- Combined with the fixed header, the text collides with the navigation

---

## Fix Strategy

**Swedish Design Principle**: Functional hierarchy — the headline should have breathing room from the header, not compete with it.

**032c Reference**: Their hero headlines always have deliberate top clearance, even when oversized.

### Solution

Replace the negative margin approach with proper top padding on the content container. This ensures the typography section respects the header space while maintaining its centered position.

---

## Implementation Details

### File: `src/components/homepage/EditorialHero.tsx`

**Change 1: Add top padding to content container (Line 97)**

```tsx
// BEFORE (Line 97):
className="relative z-10 min-h-screen flex flex-col justify-between px-6 md:px-12 lg:px-16 py-12 lg:py-16"

// AFTER:
className="relative z-10 min-h-screen flex flex-col justify-between px-6 md:px-12 lg:px-16 pt-24 md:pt-28 lg:pt-32 pb-12 lg:pb-16"
```

This adds explicit top padding that accounts for the header:
- Mobile: `pt-24` (96px) — clears status bar + nav
- Tablet: `pt-28` (112px) — slightly more room
- Desktop: `pt-32` (128px) — premium breathing space

**Change 2: Remove negative margins from typography section (Line 102)**

```tsx
// BEFORE (Line 102):
<div className="flex-1 flex flex-col justify-center -mt-16 lg:-mt-24">

// AFTER:
<div className="flex-1 flex flex-col justify-center">
```

By removing the negative margins, the text will naturally center within the available space (after accounting for the new top padding).

---

## Visual Comparison

```text
BEFORE (problematic):
┌─────────────────────────────────────────────────┐
│ [LOGO]    [NAV]    [ICONS]        ← Header      │
│───────────────────────────────────WEAR──────────│
│  W E A R                          ↑             │
│                                   Text overlaps │
│           Y O U R                               │
│                                                 │
│   F A I T H .                                   │
│                                                 │
│   Tagline text here...                          │
│                                                 │
│   [CTA]                    [Drop Badge]         │
└─────────────────────────────────────────────────┘

AFTER (fixed):
┌─────────────────────────────────────────────────┐
│ [LOGO]    [NAV]    [ICONS]        ← Header      │
│                                                 │
│                                   ← Breathing   │
│  W E A R                             room       │
│                                                 │
│           Y O U R                               │
│                                                 │
│   F A I T H .                                   │
│                                                 │
│   Tagline text here...                          │
│                                                 │
│   [CTA]                    [Drop Badge]         │
└─────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `src/components/homepage/EditorialHero.tsx` | 97 | Replace `py-12 lg:py-16` with `pt-24 md:pt-28 lg:pt-32 pb-12 lg:pb-16` |
| `src/components/homepage/EditorialHero.tsx` | 102 | Remove `-mt-16 lg:-mt-24` from class |

---

## Acceptance Criteria

- The "WEAR YOUR FAITH." headline is fully visible below the navigation bar on all screen sizes
- The headline maintains its editorial impact and vertical rhythm
- Bottom CTA section and Drop Badge remain properly positioned
- No visual regression on scroll behavior or parallax effects
- Animation timing remains unchanged

---

## Performance Impact

- Zero new dependencies
- Slightly reduced layout complexity (removing negative margins)
- No impact on Lighthouse scores

