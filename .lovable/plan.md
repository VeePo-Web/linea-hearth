

# Exodus 28:2 Interactive Revelation Feature
## Divine Illumination + Full Verse Tooltip on Hover

---

## Part 1: The Concept

When the user hovers over "Exodus 28:2", two things happen:

1. **Divine Illumination Effect** - Same warm gold glow + slight scale as "glory" and "beauty"
2. **Full Verse Revelation** - The complete ASV verse appears above/below the reference

### The Full ASV Verse

Exodus 28:2 (American Standard Version):
> "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."

This creates a **revelation moment** - hovering over the reference "unlocks" the full scripture, reinforcing the brand's biblical foundation.

---

## Part 2: Visual Design

```text
Normal state:
                "For glory and for beauty."
                     Exodus 28:2

Hover on "Exodus 28:2":
     ┌─────────────────────────────────────────────────────┐
     │  "And thou shalt make holy garments for Aaron      │
     │   thy brother, for glory and for beauty."          │
     │                                           — ASV     │
     └─────────────────────────────────────────────────────┘
                "For glory and for beauty."
                    ✨ Exodus 28:2 ✨
                    [glowing, slightly scaled]
```

### Tooltip Design Principles

| Aspect | Decision |
|--------|----------|
| **Position** | Above the reference (more natural reading flow) |
| **Width** | Max 280px on mobile, 360px on desktop |
| **Background** | Near-black with subtle warm tint: `hsla(30 20% 5% / 0.95)` |
| **Border** | Subtle warm gold: `1px solid hsla(45 40% 50% / 0.2)` |
| **Typography** | Same archival serif, slightly smaller, warm sepia |
| **Animation** | Fade + slight translateY (12px → 0) |
| **Attribution** | Small "— ASV" in corner for authenticity |

---

## Part 3: Implementation Approach

### A. HTML Structure Change

Transform the static `<p>` into an interactive element with a CSS-only tooltip:

```tsx
{/* Verse Reference - Interactive with Full Verse Tooltip */}
<motion.div
  className="verse-reference-container mt-3"
  variants={v.verseRef}
  initial="initial"
  animate="animate"
>
  <span className="verse-reference-archival verse-ref-interactive">
    Exodus 28:2
  </span>
  <div className="verse-tooltip" role="tooltip">
    <p className="verse-tooltip-text">
      "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."
    </p>
    <span className="verse-tooltip-attribution">— ASV</span>
  </div>
</motion.div>
```

### B. CSS Classes to Add

```css
/* ======================================
   EXODUS 28:2 - Interactive Revelation
   ====================================== */

/* Container for positioning context */
.verse-reference-container {
  position: relative;
  display: inline-block;
}

/* Interactive reference text */
.verse-ref-interactive {
  cursor: pointer;
  display: inline-block;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Hover state - Divine Illumination (matching glory/beauty) */
.verse-reference-container:hover .verse-ref-interactive {
  color: hsla(45 55% 82% / 0.95);
  text-shadow: 
    0 0 15px hsla(45 70% 65% / 0.35),
    0 0 30px hsla(45 60% 55% / 0.15);
  letter-spacing: 0.4em;
  transform: scale(1.05);
}

/* Tooltip - Hidden by default */
.verse-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(12px);
  width: max-content;
  max-width: 280px;
  padding: 16px 20px;
  background: hsla(30 20% 5% / 0.95);
  border: 1px solid hsla(45 40% 50% / 0.2);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-bottom: 12px;
  z-index: 50;
}

/* Tooltip arrow */
.verse-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: hsla(45 40% 50% / 0.2);
}

/* Tooltip visible on hover */
.verse-reference-container:hover .verse-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Tooltip text styling */
.verse-tooltip-text {
  font-family: 'Times New Roman', 'Georgia', serif;
  font-style: italic;
  font-size: 0.75rem;
  line-height: 1.6;
  color: hsla(38 30% 80% / 0.85);
  letter-spacing: 0.04em;
  text-align: center;
}

/* ASV attribution */
.verse-tooltip-attribution {
  display: block;
  text-align: right;
  margin-top: 8px;
  font-family: inherit;
  font-style: normal;
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: hsla(38 20% 60% / 0.5);
}

/* Desktop: wider tooltip */
@media (min-width: 768px) {
  .verse-tooltip {
    max-width: 360px;
    padding: 20px 24px;
  }
  
  .verse-tooltip-text {
    font-size: 0.85rem;
  }
}

/* Reduced motion: instant transitions, no transform */
@media (prefers-reduced-motion: reduce) {
  .verse-ref-interactive {
    transition: none;
  }
  
  .verse-tooltip {
    transition: opacity 0.2s ease;
    transform: translateX(-50%) translateY(0);
  }
  
  .verse-reference-container:hover .verse-ref-interactive {
    text-shadow: none;
    transform: none;
    letter-spacing: 0.35em;
    color: hsla(45 50% 80% / 0.9);
  }
}
```

---

## Part 4: Files to Modify

| File | Changes |
|------|---------|
| `src/pages/LandingPage.tsx` | Transform verse reference `<p>` into interactive container with tooltip |
| `src/index.css` | Add new CSS classes for tooltip and illumination effect |

---

## Part 5: Accessibility Considerations

| Concern | Solution |
|---------|----------|
| **Keyboard access** | Add `tabindex="0"` to make focusable |
| **Focus state** | Same illumination on `:focus-visible` |
| **Screen readers** | Add `role="tooltip"` and `aria-describedby` |
| **Touch devices** | Tooltip works on tap (CSS hover = tap on mobile) |
| **Reduced motion** | Instant transitions, no scale/transform |

---

## Part 6: Detailed Implementation

### LandingPage.tsx Changes (Lines 188-195)

**Current:**
```tsx
<motion.p
  className="verse-reference-archival mt-3"
  variants={v.verseRef}
  initial="initial"
  animate="animate"
>
  Exodus 28:2
</motion.p>
```

**New:**
```tsx
<motion.div
  className="verse-reference-container mt-3"
  variants={v.verseRef}
  initial="initial"
  animate="animate"
>
  <span 
    className="verse-reference-archival verse-ref-interactive"
    tabIndex={0}
    aria-describedby="exodus-tooltip"
  >
    Exodus 28:2
  </span>
  <div 
    className="verse-tooltip" 
    role="tooltip" 
    id="exodus-tooltip"
  >
    <p className="verse-tooltip-text">
      "And thou shalt make holy garments for Aaron thy brother, for glory and for beauty."
    </p>
    <span className="verse-tooltip-attribution">— ASV</span>
  </div>
</motion.div>
```

---

## Part 7: Success Criteria

After implementation:

1. **Illumination effect works** - "Exodus 28:2" glows warm gold on hover
2. **Tooltip appears** - Full verse fades in above the reference
3. **Tooltip is readable** - Archival serif, warm sepia, proper contrast
4. **Animation feels premium** - Smooth 0.4s ease with subtle translateY
5. **Keyboard accessible** - Focus shows same effect as hover
6. **Reduced motion respected** - Instant fade, no transforms
7. **Mobile works** - Tap triggers the tooltip
8. **Typography consistent** - Matches the existing verse archival treatment

---

## Part 8: The Philosophy

This feature turns a static citation into a **moment of discovery**:

- The abbreviated verse ("For glory and for beauty") is the hook
- The reference is the invitation
- The full verse is the revelation

This mirrors how faith works - you get a glimpse, you seek more, you find the complete truth.

**Brand alignment**: Line of Judah isn't just selling hoodies - they're inviting people into a deeper story. This micro-interaction reinforces that philosophy.

