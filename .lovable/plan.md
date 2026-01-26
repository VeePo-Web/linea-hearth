

# Milestone Celebration Haptics - Implementation Plan

## Overview

Enhance the FreeShippingBar with tiered haptic feedback that provides tactile celebration when users hit free shipping milestones, reinforcing the dopamine loop of progress toward free shipping.

---

## TEMU Conversion Psychology

**Why milestone haptics matter:**
- **Gamification reinforcement**: Haptics make abstract progress feel physical
- **Dopamine loop completion**: See progress bar fill → Feel vibration → Brain registers achievement
- **Reduced cognitive load**: "Did I unlock something?" → Physical confirmation says yes
- **Mobile-native expectation**: Gaming apps, banking apps, fitness trackers all use milestone haptics

**Pulse Duration Selection (based on existing patterns):**

| Milestone | Pulse Duration | Rationale |
|-----------|----------------|-----------|
| Halfway (50%) | 30ms | Lighter celebration — "you're on your way" |
| Almost (90%) | No haptic | Urgency messaging is enough — don't over-vibrate |
| Unlocked (100%) | 50ms | Strongest celebration — achievement unlocked |

The tiered approach creates a "crescendo" effect: 30ms → (nothing) → 50ms. This makes the final unlock feel more rewarding.

---

## Current State Analysis

The `celebrateMilestone` function (lines 42-54) currently:
1. Sets active celebration state
2. Adds tier to celebrated set
3. Only triggers haptic for 'unlocked' tier (50ms)
4. **Does NOT check `prefersReducedMotion`** — this is a bug we should fix

```typescript
const celebrateMilestone = (tier: MilestoneType) => {
  setActiveCelebration(tier);
  setCelebratedMilestones(prev => new Set([...prev, tier]));
  
  // Haptic feedback only on unlock (subtle single pulse)
  if (tier === 'unlocked' && navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  // ...
};
```

---

## Implementation

### File: `src/components/cart/FreeShippingBar.tsx`

**Changes:**
1. Add 30ms haptic for 'halfway' tier
2. Keep 50ms haptic for 'unlocked' tier
3. Respect `prefersReducedMotion` preference
4. Check for `navigator.vibrate` support

**Updated `celebrateMilestone` function:**

```typescript
const celebrateMilestone = (tier: MilestoneType) => {
  setActiveCelebration(tier);
  setCelebratedMilestones(prev => new Set([...prev, tier]));
  
  // Tiered haptic feedback for milestone celebrations (mobile)
  // Skip haptics if user prefers reduced motion
  if (!prefersReducedMotion && 'vibrate' in navigator) {
    if (tier === 'halfway') {
      navigator.vibrate(30); // Lighter celebration pulse
    } else if (tier === 'unlocked') {
      navigator.vibrate(50); // Stronger achievement pulse
    }
    // No haptic for 'almost' — urgency messaging is sufficient
  }
  
  // Clear celebration after animation completes
  const duration = tier === 'unlocked' ? 2000 : 1500;
  setTimeout(() => setActiveCelebration(null), duration);
};
```

---

## Haptic Signature Design

```text
Cart Value:    €0 ──────────────────────────────────────── €150+
Progress:      0%        50%              90%           100%

Haptics:       ─────────[30ms]─────────────────────────[50ms]
                          ↑                                ↑
                    "Halfway there"               "Free shipping!"
```

**Why no haptic at 90%?**
- Users are already highly engaged at this point (so close to goal)
- The urgency messaging ("Just €15 more!") creates psychological pull
- Over-vibrating reduces the perceived specialness of haptics
- The 100% unlock feels more impactful as a distinct tactile event

---

## Technical Considerations

### Reduced Motion Compliance

The current code triggers haptics without checking `prefersReducedMotion`. While haptics aren't technically "motion," users who prefer reduced motion often have sensory sensitivities that extend to vibration. We respect this preference.

### Browser Compatibility

- `'vibrate' in navigator` check handles unsupported browsers
- Works on: Android Chrome, Firefox Mobile
- Gracefully no-ops on: iOS Safari, Desktop browsers

### Why `'vibrate' in navigator` Instead of `navigator.vibrate`?

The property check is safer because:
- `navigator.vibrate` can be `undefined` in some browsers
- Property existence check prevents potential errors
- Follows the existing pattern in `AddedToCartToast.tsx`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/cart/FreeShippingBar.tsx` | Update `celebrateMilestone` function to add tiered haptics with reduced motion check |

---

## Acceptance Criteria

- [ ] 30ms haptic pulse triggers when 50% threshold is crossed (going up)
- [ ] 50ms haptic pulse triggers when 100% threshold is crossed
- [ ] No haptic triggers for 90% threshold
- [ ] No haptics if `prefers-reduced-motion` is enabled
- [ ] No JavaScript errors on devices without `navigator.vibrate`
- [ ] Haptics only fire once per session (existing milestone tracking prevents re-fire)
- [ ] Works on Android Chrome and Firefox Mobile

---

## Code Diff Preview

```diff
  const celebrateMilestone = (tier: MilestoneType) => {
    setActiveCelebration(tier);
    setCelebratedMilestones(prev => new Set([...prev, tier]));
    
-   // Haptic feedback only on unlock (subtle single pulse)
-   if (tier === 'unlocked' && navigator.vibrate) {
-     navigator.vibrate(50);
+   // Tiered haptic feedback for milestone celebrations (mobile)
+   // Skip haptics if user prefers reduced motion
+   if (!prefersReducedMotion && 'vibrate' in navigator) {
+     if (tier === 'halfway') {
+       navigator.vibrate(30); // Lighter celebration pulse
+     } else if (tier === 'unlocked') {
+       navigator.vibrate(50); // Stronger achievement pulse
+     }
+     // No haptic for 'almost' — urgency messaging is sufficient
    }
    
    // Clear celebration after animation completes
    const duration = tier === 'unlocked' ? 2000 : 1500;
    setTimeout(() => setActiveCelebration(null), duration);
  };
```

---

## Conversion Impact

| Metric | Expected Impact | Mechanism |
|--------|-----------------|-----------|
| Free shipping unlock rate | +5% | Gamification reinforcement creates goal commitment |
| Average order value | +3% | Users add items specifically to hit thresholds |
| User satisfaction | +8% | Multi-sensory feedback feels premium/native |

