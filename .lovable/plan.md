# Pre-Owner-Review Punch List

Quick audit of what still needs attention before you hand the draft to the owner.

## 1. Catalog mismatch (highest priority)

You asked earlier to show **only Heavenly Cap** and no crewneck variants. That was done at the **image-mapping** layer, but the database still has **19 active products** (multiple hoodies, tees, sweaters, other caps). On the live site they will still render via PLP/category queries.

Options — pick one:
- **A.** Set all non-Heavenly products to `status='draft'` (or `archived`) so only "Heavenly" Khaki Low-Profile Cap is shoppable.
- **B.** Keep the full catalog visible (revert/relax the image-mapping restriction so other products show real imagery instead of falling back).

Recommended: **A** if the owner is reviewing a focused launch; **B** if they're reviewing the full assortment.

## 2. Payment mode banner

`src/components/PaymentTestModeBanner.tsx` shows a bright **orange** "test mode" bar whenever `VITE_PAYMENTS_CLIENT_TOKEN` starts with `pk_test_`. `.env.development` uses a test key, `.env.production` uses a live key — so the preview URL the owner sees will display the orange strip. Confirm:
- Share the **published** URL (`lineofjudah.clothing`) for owner review, OR
- Temporarily restyle the banner to chrome/neutral so it doesn't clash with the editorial aesthetic.

## 3. Try-On 3D references to "crewneck"

`src/components/try-on/GarmentLayer.tsx`, `garments/CrewneckGeometry.tsx`, `hooks/useGarmentTexture.tsx`, `utils/uvProjection.ts` still contain crewneck geometry/type code. These are internal 3D fallbacks (not user-visible product names) — safe to leave, but flagging since you asked for "no crewneck variants." No change recommended unless you want the fallback renamed.

## 4. Remaining greens — intentional, confirm with owner

Per earlier audit these were kept on purpose. Worth a sanity check before the review:
- **Footer Veepo attribution** (`Footer.tsx` lines 175, 186) — `#4CAF50` hover, mandated by brand spec.
- **Worn in the Wild** campaign pages — green retained as campaign identity.
- **Admin / Ops Portal** status badges — green = paid/active.

If the owner wants a 100% chrome surface even on these, we can flip them.

## 5. Nice-to-have checks (low risk, quick wins)

- Spell-check the catalog: `"Salvation belongs"` has a double space in `Embroidered`.
- Hero/featured product hardcoded references: confirm `CollectionHero` and `FiftyFiftySection` (edited last loop) point to Heavenly Cap and not a stale slug.
- Run a quick mobile pass on `/index` (your current viewport) — confirm no green leaked back into Lookbook swipe cards after recent edits.

---

**Next step:** tell me which of items **1** and **2** you want me to act on, and whether to leave items **3–4** as-is. Then I'll execute in build mode.
