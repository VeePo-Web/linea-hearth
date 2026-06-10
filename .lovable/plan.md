## FAQPage Structured Data

### What
Add Schema.org `FAQPage` JSON-LD to the existing FAQ route using the `faqData` array already in the component. No UI changes.

### How
1. In `src/pages/FAQ.tsx`, build a `FAQPage` JSON-LD object from `faqData`:
   - `@context`: `https://schema.org`
   - `@type`: `FAQPage`
   - `mainEntity`: array of `Question` objects, each with `name` (question) and `acceptedAnswer` (Answer object with `text`)
2. Pass the object to the existing `<PageSEO>` component via its `jsonLd` prop (already supported).

### Files changed
- `src/pages/FAQ.tsx` only. Zero JSX / visual changes.