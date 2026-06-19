# Cart Drawer — Visual Decluttering

Goal: same drawer, same features, just less visual noise. The current drawer stacks ~7 distinct surfaces (header, shipping bar, items, email capture box, bundle progress, saved-for-later, smart upsell, continue-shopping, trust row, affirmation, subtotal, two CTAs, footer trust). Nothing is removed — we just calm the hierarchy so the eye lands on items → subtotal → checkout.

## Visual changes only

### 1. CartItem row (`src/components/cart/CartItem.tsx`)
- Replace `border` box around the qty stepper with a borderless inline stepper (`−  2  +` with hairline only under the number, or muted background pill). Removes a hard rectangle from every row.
- Drop the `border-l-2 border-foreground/30` "just added" bar in favor of a subtle one-shot background fade (already animated elsewhere). Less permanent visual noise.
- Tighten row vertical padding `py-4 → py-5` but remove the `divide-y` dividers on the parent (see #2) so each row breathes instead of being boxed.
- Move the X remove button to a lighter weight: `text-muted-foreground/60` at rest, full on hover. Currently competes with price.
- Variant line: use `·` separators instead of ` / ` for a quieter typographic rhythm (`Hoodie · Forest · Size M`).

### 2. Items list container (`CartDrawer.tsx` lines 272-288)
- Remove `divide-y divide-border` between items. Replace with generous whitespace only; keep a single hairline above the first item and below the last to bound the section. Reduces the "ledger" feel.

### 3. Email capture block (lines 290-361)
- Currently a heavy bordered card (`border-t border-b py-5`) with title + subtitle + input + button + lock line — 4 stacked elements.
- Collapse to a single quiet row: small lock icon + `Email me if anything sells out` link-style trigger that expands inline to input + button on tap. Saves ~120px of vertical real estate when idle.
- Remove the standalone "Your data is encrypted and secure" microcopy — implied by lock icon.

### 4. Section spacing & dividers (CartDrawer body)
- Standardize section gaps: every secondary block (BundleProgress, SavedForLater, SmartUpsell, ContinueShopping) gets `py-5` and a single top hairline `border-t border-border/50` (half-opacity) instead of full-strength borders. This is the biggest visual win — the drawer currently has ~6 full-strength horizontal lines stacked.
- Add a single `<h3>` micro-label above each (`text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70`) so each block reads as a quiet section instead of a card.

### 5. Footer (lines 422-485)
- Merge the two CTAs visually: primary "Proceed to Checkout" stays full-weight; "Continue Shopping" becomes a smaller centered text link below (`text-xs underline-offset-4 hover:underline`) instead of a full-width ghost button. Removes one heavy bar.
- Move "Shipping and taxes calculated at checkout" inline to the right of the subtotal label as `text-[10px]` aside, instead of its own line.
- `AffirmationStrip` + `TrustRow` keep functionality but reduce to a single line each with `py-2.5` and `border-border/40`.

### 6. Header (lines 178-202)
- Reduce the close button's hover bg-muted scale-in (currently a circle that animates on hover). Replace with simple color transition. Less interactive flourish in chrome.
- Title weight already light — keep. Tighten count: `Your Bag · 3` instead of `Your Bag (3)`.

### 7. Free Shipping Bar
- No structural change. Reduce internal vertical padding by 2-4px to lighten the sticky band.

## What stays untouched
- Every feature, hook, state machine, animation timing curve, scroll lock, email capture logic, bundle logic, saved-for-later, smart upsell, continue shopping, trust row content.
- No copy changes beyond punctuation/separator tweaks noted above.
- No color token additions — uses existing `border-border/50`, `text-muted-foreground/70` opacity steps.

## Files touched
- `src/components/cart/CartDrawer.tsx` — dividers, section labels, footer compaction, header micro-tweak
- `src/components/cart/CartItem.tsx` — borderless stepper, lighter X, variant separator, drop just-added border bar
- `src/components/cart/FreeShippingBar.tsx` — padding only

## Verification
Open drawer with 1 item, 3 items, and empty state. Compare against current screenshot — count distinct horizontal lines (target: ≤4 in the scrollable region vs current ~8). Confirm checkout CTA is the single dominant element below the fold.
