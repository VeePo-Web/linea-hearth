Three scoped changes, no business logic.

## 1. Add Mission section to About page (third section)

Create `src/components/about/MissionStatement.tsx` and insert it as the third section in `src/pages/about/OurStory.tsx`, right after `StoryCallingSection`. Style matches the existing dark-stone editorial sections (same `bg-stone-950`, same eyebrow + serif headline + body rhythm used in `StoryCallingSection` / `OriginStory`, chrome hairline divider top and bottom, numeric watermark `03`).

Draft mission copy (placeholder — you can swap later in admin or tell me to rewrite):

> **Eyebrow:** THE MISSION
> **Headline:** Wear what you believe. Carry it with you.
> **Body:** Line of Judah exists to put sacred conviction onto everyday armor — pieces engineered to outlast trend, built for the believer who refuses to whisper. Every drop is a quiet declaration: that craft can be ministry, that clothing can be testimony, and that *"for glory and for beauty"* (Exodus 28:2) is not a relic — it's a standard.

Updated OurStory order becomes: Hero → Calling → **Mission** → Origin → Founder Letter → Values → Impact → Tribe → Join.

## 2. Rename founder → "Olliver Abbey"

Single hardcoded reference: `src/components/about/FounderLetter.tsx:76` — change `Jordan Williams` → `Olliver Abbey`. No other "Jordan Williams" strings exist in the codebase. Spot-check `FounderLetter.tsx` for any signature/avatar alt text and update those too.

## 3. Replace Stay Holy male-model photo with live category-appropriate product images

The image you uploaded is `/products/stay-holy-hoodie/male-model.png`. It's hardcoded in 6 locations. Each will be refactored to pull the newest active product's primary image from the relevant category in the database (same pattern as CategoryTiles), with the existing hardcoded path as fallback so nothing breaks if the DB is empty.

| Location | Category to pull from | Why |
|---|---|---|
| `HeroBlock.tsx` (homepage hero bg) | hoodies | Hero showcases flagship hoodie product |
| `FiftyFiftySection.tsx` | hoodies | Editorial spread |
| `MissionBlock.tsx` | hoodies | Flat lay alongside copy |
| `StoryWorldwideTribe.tsx` (3 slots referencing male/female stay-holy) | hoodies / tops mix — pull newest from each | Tribe wall needs visual variety |
| `StoryJoinCTA.tsx` | hoodies | Section CTA backdrop |
| `LargeHero.tsx` | hoodies | Editorial hero |

Query pattern (one shared hook `useCategoryHeroImage(slug)`): `products` joined `product_images` where `categories.slug = $1` AND `products.status = 'active'`, ordered by `created_at desc`, limit 1, returns `product_images.image_url` where `is_primary = true` (fallback to first image). 5-min `staleTime`. New components stay otherwise visually identical — same layout, same animation, same copy — only the `src` / `backgroundImage` source changes.

ProductCarousel.tsx (homepage carousel) keeps its hardcoded demo entries since it's already wired to a different demo system — leaving it untouched unless you want me to refactor it too.

## Out of scope
- No copy/layout changes elsewhere
- No new admin UI (you can already swap the underlying product image from the existing product admin)
- ProductCarousel demo data untouched
- The model in `StoryHero.tsx` and `BrandFilmHero.tsx` is `/founders.png` (the founders themselves, not the Stay Holy model) — left alone
