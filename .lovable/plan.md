## Plan

The marquee's `.marquee-underline` class already has a `:hover` opacity shift for visual feedback, but it lacks a `:focus` state. For keyboard/accessibility parity, add `:focus` to the existing rule so focused urgency phrases brighten the same way hovered ones do.

### Files to change
- `src/index.css` — update the `.marquee-underline:hover` selector to also include `.marquee-underline:focus`

### Technical detail
Current rule at line ~206:
```css
.marquee-underline:hover {
  text-decoration-color: hsl(0 0% 100% / 1);
}
```
Change to:
```css
.marquee-underline:hover,
.marquee-underline:focus {
  text-decoration-color: hsl(0 0% 100% / 1);
}
```
No other files or behavior are touched.