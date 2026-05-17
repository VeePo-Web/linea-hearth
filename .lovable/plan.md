# Build Plan

Five scoped changes. Nothing existing gets deleted — only swapped, hidden, or extended.

---

## 1. Landing "Enter" → Master Catalog

**File:** `src/pages/LandingPage.tsx` (and `EditorialHero.tsx` for the "Enter the Drop" CTA on /home).

- In `handleEnter`, change `navigate('/home')` → `navigate('/category/shop')`.
- `/category/shop` already exists and `ProductGrid.tsx` already treats slug `"shop"` (and `"all"`) as the **master catalog** — it returns every active product across all categories, with the full `FilterSortBar` (size, color, fit, message type, price, category). No new route needed.
- `CollectionHero` will render "Shop" as the title — we'll pass a friendlier label ("The Full Collection") via a small prop tweak so it reads as a master catalog, not a category.
- Keep `/home` route fully intact so internal links (logo, nav) still work.

---

## 2. Homepage: Strip Out All People / Model Imagery

Goal: clean, product-first homepage. Replace every model/lifestyle photo with either a product flat-lay, a typographic editorial block, or hide the section.

**`EditorialHero.tsx`** — currently uses `male-model.png`, `female-model-1.png`, `flat-front.png`.
- Replace background `male-model.png` → `flat-front.png` (product flat).
- Remove the secondary collage image block (female model) entirely (the `lg:block` div, lines ~72–90).
- Keep the small floating flat-front product detail.

**`TestimonySpotlight.tsx`** — uses `female-model-2.png`.
- Replace `ImageReveal` photo with a full-bleed typographic quote panel on a `bg-stone-900` / `bg-foreground` background (large serif pull-quote, "Coming soon" stays).
- No people. Pure type + chrome underline.

**`MissionBlock.tsx`** — audit and swap any model image for a product flat or texture/fabric crop. (Will inspect during build; default fallback = `flat-front.png` or a solid editorial card.)

**`CategoryTiles.tsx`** — same audit: swap any model imagery for product flats. Tile structure stays.

**`HeroBlock.tsx`** — not currently mounted in `Index.tsx`, leave untouched.

**`InstagramFeed.tsx`** — already "Coming soon", no people. Leave.

**No changes** to spacing, layout, animations, or section order. Only image `src` swaps and one removed collage div.

---

## 3. Mobile Nav: Swap Box Logo for Wordmark

**File:** `src/components/header/MobileMenu.tsx` line 159.

- Currently renders `<img src="/logo.png" alt="Line of Judah" />` (the box/badge logo).
- Replace with the **wordmark** used in the desktop nav bar — plain text "LINE OF JUDAH" styled identically to `Header.tsx`'s brand mark (same font, tracking, weight).
- Will read the exact desktop classes from `Header.tsx` and mirror them so it looks pixel-identical.
- Keep the same vertical alignment and the close button beside it.

---

## 4. Calgary Focus (Remove "Worldwide")

Files containing "worldwide":
- `src/components/about/StoryWorldwideTribe.tsx`
- `src/components/about/MinistryInMotion.tsx`
- `src/pages/about/OurStory.tsx`
- `src/pages/ShippingInfo.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/Contact.tsx`

Approach:
- **Copy-only swaps.** Replace every "Worldwide", "Worldwide Tribe", "Global", "Around the World" phrasing with "Calgary" / "Built in Calgary" / "Calgary & Beyond".
- `StoryWorldwideTribe.tsx` → rename headline to "The Calgary Tribe" and replace world-map / global stats imagery descriptions with Calgary-rooted language. The component stays mounted; just the content shifts.
- `MinistryInMotion.tsx` → swap "ministry in motion worldwide" → "rooted in Calgary".
- Shipping / FAQ / Contact → "ships worldwide" stays factually true but reframed: "Designed in Calgary. Ships across Canada & beyond." (still accurate, Calgary-forward.)
- No components deleted. No layout changes.

---

## 5. Admin OS: Lookbook CMS (Full Build)

The most substantial piece. Schema already supports it (`lookbook_looks`, `lookbook_look_products`). We add a complete admin surface so you can create, reorder, edit, and delete looks + their product mappings without touching code.

### 5a. Sidebar entry
**File:** `src/components/admin/AdminLayout.tsx`
- Add nav item: `{ href: '/ops-portal/lookbook', label: 'Lookbook', icon: ImageIcon }`.
- Slots between Categories and Discounts.

### 5b. Routes
**File:** `src/App.tsx` — add lazy routes:
- `/ops-portal/lookbook` → `AdminLookbook` (list view)
- `/ops-portal/lookbook/new` → `AdminLookbookForm` (create)
- `/ops-portal/lookbook/:lookId/edit` → `AdminLookbookForm` (edit)

All wrapped in `<ProtectedRoute requireAdmin>`.

### 5c. New file: `src/pages/admin/AdminLookbook.tsx` (list page)

Table-style management screen mirroring `AdminProducts.tsx` UX:

- **Header bar:** title "Lookbook", count of active looks, primary button "+ New Look".
- **Data table** (clickable rows per admin UX standard):
  | Drag handle | Order | Cover thumbnail | Name | Headline | Gender | Products | Status | Updated | Actions |
- **Drag-to-reorder** via `@dnd-kit` (already in shadcn-compatible patterns). On drop → batch update `display_order` for all affected rows.
- **Status toggle inline:** click the badge to flip `is_active` (optimistic update + toast).
- **Row click** → opens `/ops-portal/lookbook/:id/edit`.
- **Actions menu (kebab):** Edit · Duplicate · Delete (confirm modal).
- **Empty state:** centered card "No looks yet. Create your first look to start telling stories." with CTA.
- **Filters:** Gender (all / male / female / unisex), Status (all / active / inactive), text search by name/headline.

### 5d. New file: `src/pages/admin/AdminLookbookForm.tsx` (create / edit)

Two-column layout mirroring `AdminProductForm.tsx`:

**Left column — Editorial content**
- Name (text, required)
- Headline (text, required — large display copy shown on the look section)
- Scripture reference (text, optional — e.g. "2 Corinthians 5:7")
- Description (textarea, optional)
- Gender (select: male / female / unisex)
- Cover image URL (uses existing `ImageUploader` component → `product-images` bucket, subfolder `lookbook/`)
- Video URL (text, optional — for the optional motion background)

**Right column — Settings + Status**
- Active toggle (`is_active`)
- Display order (number, auto-suggested as `max+1` on create, editable)
- Created / updated timestamps (read-only)

**Bottom section — Products in this look**
- Searchable product picker (autocomplete against `products` table, status=active).
- Adds rows to a draggable list. Each row:
  - Thumbnail + product name + price
  - Position dropdown (`top` / `bottom` / `accessory` / `outerwear`) → maps to `lookbook_look_products.position`
  - Drag handle for `display_order`
  - Remove (×) button
- Persisted via `lookbook_look_products` (insert new, delete removed, update existing — diffed on save).

**Save behavior**
- `isDirty` tracking (per admin UX standard) — Save button highlighted when changes pending; warns on unsaved-changes navigation.
- Single save = transactional pattern: upsert `lookbook_looks`, then diff + sync `lookbook_look_products`. Toast on success, redirect to list.

### 5e. Reusable component: `src/components/admin/LookProductPicker.tsx`
- Encapsulates the searchable product autocomplete + draggable assigned-products list. Keeps the form file clean.

### 5f. Cover image storage
- Reuses the existing public `product-images` bucket. Files uploaded under `lookbook/{lookId-or-uuid}/cover.{ext}`. No new bucket, no new RLS — existing admin-only insert/update policies on `product_images` storage already cover admin uploads to this bucket.

### 5g. Dashboard widget (bonus, low-cost)
**File:** `src/pages/admin/AdminDashboard.tsx`
- Add a small card to the "Action Cards Row": "Lookbook · {N} active looks" linking to `/ops-portal/lookbook`. Uses one extra `count` query, batched into the existing `Promise.all`.

### 5h. Database
- **No migration needed.** Tables `lookbook_looks` and `lookbook_look_products` already exist with proper admin-only RLS (`has_role(auth.uid(), 'admin')` for INSERT/UPDATE/DELETE, public SELECT for `is_active=true`). The public `/lookbook` page already reads from these tables and falls back to demo data when empty — so admin-created looks will immediately appear on the live site.

---

## Technical Details

**Files created:**
- `src/pages/admin/AdminLookbook.tsx`
- `src/pages/admin/AdminLookbookForm.tsx`
- `src/components/admin/LookProductPicker.tsx`

**Files modified:**
- `src/pages/LandingPage.tsx` (1 line: navigate target)
- `src/components/homepage/EditorialHero.tsx` (image src swap + remove collage div)
- `src/components/homepage/TestimonySpotlight.tsx` (replace ImageReveal with typographic panel)
- `src/components/homepage/MissionBlock.tsx` + `CategoryTiles.tsx` (audit + swap people imagery)
- `src/components/header/MobileMenu.tsx` (logo → wordmark, line 159)
- `src/components/about/StoryWorldwideTribe.tsx`, `MinistryInMotion.tsx`, `src/pages/about/OurStory.tsx`, `ShippingInfo.tsx`, `FAQ.tsx`, `Contact.tsx` (copy: worldwide → Calgary)
- `src/components/admin/AdminLayout.tsx` (sidebar nav item)
- `src/App.tsx` (3 lazy routes)
- `src/pages/admin/AdminDashboard.tsx` (Lookbook count card)
- `src/components/category/CollectionHero.tsx` (friendly "shop" slug label)

**Nothing deleted.** Existing demo lookbook fallback stays as a safety net until you publish your first look.

**Memory updates after build:** add `mem://admin/lookbook-cms` describing the new CMS architecture so future sessions know it exists.

---

Ready to implement on approval.