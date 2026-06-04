# Remove all "Heavenly Crewneck" references

Grep shows the visible copy is already gone (SearchOverlay uses "Heavenly Cap"). Remaining mentions are stale identifiers/comments that should be cleaned up so no future code re-references a ghost SKU.

## Changes

1. **`src/pages/Lookbook.tsx`** — the `DEMO_PRODUCTS.heavenlyCrewneck` key actually points to the `"Adam & God" Boxy Tee`. Rename the key to `adamGodTee` and update all 4 usages in `demoLooks` (lines 75, 86, 97, 119). No visible product/name changes — just removes the misleading identifier.

2. **`src/lib/realProductImages.ts`** — update the header comment (line 3) to drop the `heavenly-crewneck` example. Replace with a neutral example or remove the parenthetical.

3. **`.lovable/plan.md`** — stale planning doc still referencing "Heavenly Crewneck". Delete the file (work is done) or strip section #1.

## Out of scope
- Not touching `.lovable/heavenly-hat-original-price.md` (that's the real Heavenly **Hat**, not crewneck).
- Not changing `SearchOverlay.tsx` ("Heavenly Cap" stays — real product).
- Lookbook page itself is gated behind "Coming Soon" — no visible behavior change.
