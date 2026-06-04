# Green Audit Report & Conversion Plan

Found **43 remaining green references** across 14 files. Grouped by intent below.

## A. Customer-facing — convert to chrome/foreground

These leaked through the prior pass and should be neutralized.

1. **`src/components/account/OrderReorderButton.tsx:198`** — `bg-green-600` success state on Buy Again button → `bg-primary text-primary-foreground border-primary`.
2. **`src/components/lookbook/SwipeableLookCard.tsx:163`** — `backgroundColor="hsl(var(--green-600))"` (broken token, renders transparent) → `hsl(var(--primary))`.
3. **`src/components/try-on/SizeRecommendation.tsx`** (lines 26, 88–90) — green confidence bar + "Perfect fit" callout panel → chrome bar (`bg-primary`) + neutral panel (`bg-muted border-border text-foreground`).
4. **`src/components/try-on/avatar-creator/AvatarPreview.tsx`** (lines 150, 154, 158) — three green check icons → `text-foreground`.
5. **`src/components/product/CompleteTheLookBundle.tsx`** (lines 222, 225) — bundle savings dot + price `text-[#4CAF50]` → `text-foreground` / `bg-foreground`.
6. **`src/components/checkout/PostPurchaseOffer.tsx`** (lines 109, 142, 151, 171) — `#4CAF50` banner, discount pill, callout border, info box → chrome (`bg-foreground text-background` for banner, `bg-muted text-foreground` for pills, `border-foreground/40` for accents).

## B. Brand exceptions — KEEP green (per existing memory)

These are intentional Forest Green brand usage. No change unless you say otherwise.

7. **Worn in the Wild campaign pages** — `WornInTheWildUpload.tsx` (14 refs), `WornInTheWildGallery.tsx` (1 ref). Campaign visual identity.
8. **Footer Veepo attribution** — `Footer.tsx:175, 186`. Memory `mem://brand/veepo-attribution-spec` mandates `#4CAF50` for Veepo hover.

## C. Admin / ops portal — KEEP green (status semantics)

Internal-only screens at `/ops-portal/*`. Green = success/active/paid is the conventional admin signal.

9. `AdminProducts.tsx:122`, `AdminLookbook.tsx:328`, `AdminOrders.tsx:82/91/93`, `AdminOrderDetail.tsx:192`, `AdminWornInTheWild.tsx` (5 refs), `ImageUploader.tsx:82`.

## Confirm before I build

- Group **A** → convert to chrome (default).
- Group **B** (Worn in the Wild + Veepo footer) → keep green. Reply if you want these flipped too.
- Group **C** (admin) → keep green. Reply if you want admin neutralized too.

Once you approve, I'll execute Group A only (≈11 edits across 6 files).
