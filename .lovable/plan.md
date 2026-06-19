## Remove fake community stats

Audit found fabricated numbers in two places (no "15 cities / 40k stories" literal exists, but other fabricated stats do — removing all of them):

### 1. `src/components/community/CommunityHero.tsx` (lines 127–146)
Remove the entire stats row showing:
- `500+ Stories`
- `45 Cities`
- `10K+ Tribe Members`

Also remove the `pt-8 border-t border-white/10` divider since the row is gone. Keep the "You belong here." manifesto above and the scroll indicator below intact.

### 2. `src/components/about/ImpactMap.tsx` (lines 146–147)
Remove the two `AnimatedCounter` stats:
- `45+ Cities`
- `20+ Campuses`

Replace with a single understated "Coming soon" line matching the tone of `StoryCommunityStats` (which already says "Coming soon..."). No other changes to the map visual or copy.

### Already clean
- `StoryCommunityStats.tsx` — already shows "Coming soon..."
- No matches anywhere else in `src/`, `public/`, `index.html` for these numbers.

### Verification after edit
Re-run `rg -ni "500\+|45\+? cit|10K|20\+? camp|40k|15 cit"` across `src/` to confirm zero fabricated stat strings remain on Community/About surfaces.