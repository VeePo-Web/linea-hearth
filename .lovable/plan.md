
# About Page -- World-Class Consolidation and Elevation Plan

## Current State Audit

### What Exists
Two separate About pages with significant content overlap:

**Our Story** (`/about/our-story`) -- 6 sections:
1. StoryHero -- "FOUNDED ON FAITH." full-screen hero with founders image, parallax
2. StoryCallingSection -- Split-grid with giant blockquote + story text
3. StoryValuesGrid -- "THE DOCTRINE" with 3 values (Armor, Silent Witness, Tribe)
4. StoryCommunityStats -- Counter stats (10K/45/5) + testimonial marquee
5. StoryWorldwideTribe -- Bento gallery of 8 tribe members + Instagram CTA
6. StoryJoinCTA -- Split hero + dual CTAs (Shop / Ambassador)

**Our Mission** (`/about/our-mission`) -- 7 sections:
1. BrandFilmHero -- "WE DON'T MAKE CLOTHES. WE MAKE STATEMENTS." with character reveal
2. FounderLetter -- Split layout, giant quote mark, Jordan Williams signature
3. OriginStory -- Lion of Judah SVG + scripture + name meaning
4. MinistryInMotion -- UGC bento grid (pulls from Supabase `product_ugc`)
5. ImpactMap -- 4 stats + map visualization + city marquee
6. ValuesPillars -- 3 full-height alternating sections (Evangelism, Identity, Conviction)
7. WearTheMissionCTA -- 60/40 split with amber CTA block

### Critical Issues

1. **Redundancy**: Both pages repeat stats (10K believers, 45 cities, 5 countries), tribe galleries, values sections, and CTAs. This dilutes editorial impact.

2. **Navigation gap**: "Our Mission" is unreachable from the nav dropdown -- only "Our Story" is linked. Users never find the Mission page.

3. **Content overlap hurts CRO**: Two similar pages with no clear differentiation creates confusion and increases bounce.

4. **Excessive scroll depth**: Each page is 5-7 full-height sections. Combined content could fill a single, tighter editorial experience.

5. **Image repetition**: Both pages reuse `/founders.png` across multiple sections (hero, founder letter, tribe gallery, CTA). This undermines premium perception.

6. **Values appear twice**: StoryValuesGrid (Armor/Witness/Tribe) and ValuesPillars (Evangelism/Identity/Conviction) are two different value systems competing for attention.

## The Plan: Consolidate Into One World-Class About Page

Merge the strongest sections from both pages into a single `/about/our-story` route. Remove `/about/our-mission` as a separate page (redirect to `/about/our-story`).

### Section Architecture (Final Page Flow)

The consolidated page follows DAZED/032c editorial pacing -- loud, quiet, loud, quiet:

```text
01  HERO (StoryHero -- keep)
    "FOUNDED ON FAITH." -- the stronger, more restrained hero
    Dark. Parallax founders image. Character reveal.

02  CALLING (StoryCallingSection -- keep)
    Giant blockquote + story text. Quiet section.
    Light background. Editorial breathing room.

03  ORIGIN (OriginStory -- move from Mission)
    Lion of Judah name meaning + scripture.
    Dark. SVG animation. This is unique content that only exists on Mission.

04  FOUNDER LETTER (FounderLetter -- move from Mission)
    Split layout with signature. Personal story.
    Light background. Magazine editorial feel.

05  VALUES (StoryValuesGrid -- keep, enhanced)
    "THE DOCTRINE" -- 3 values grid with massive numbers.
    Dark. Grid pattern background. Drop the separate ValuesPillars.

06  STATS + IMPACT (merge StoryCommunityStats + ImpactMap)
    Keep the massive counter numbers from ImpactMap (4 stats, better layout).
    Add city marquee from ImpactMap.
    Drop the duplicate testimonial marquee.
    Dark background.

07  TRIBE GALLERY (StoryWorldwideTribe -- keep)
    Bento gallery with grayscale-to-color hover.
    Light background. Instagram CTA.

08  FINAL CTA (StoryJoinCTA -- keep)
    Split layout. Shop + Ambassador buttons.
    Dark. Full-bleed.
```

### File Changes

| File | Action | Details |
|------|--------|---------|
| `src/pages/about/OurStory.tsx` | **Modify** | Add OriginStory + FounderLetter imports. Replace StoryCommunityStats with ImpactMap. Update section order. |
| `src/pages/about/OurMission.tsx` | **Modify** | Replace with redirect to `/about/our-story` |
| `src/App.tsx` | **No change** | Keep both routes; OurMission will redirect |
| `src/components/about/ImpactMap.tsx` | **Minor tweak** | Update section index watermark from 05 to 06 |
| `src/components/about/OriginStory.tsx` | **No change** | Already well-built |
| `src/components/about/FounderLetter.tsx` | **Minor tweak** | Update watermark from 02 to 04 |
| `src/components/about/StoryValuesGrid.tsx` | **Minor tweak** | Update watermark from 03 to 05 |
| `src/components/about/StoryWorldwideTribe.tsx` | **Minor tweak** | Update watermark from 05 to 07 |
| `src/components/about/StoryJoinCTA.tsx` | **Minor tweak** | Update watermark from 06 to 08 |
| `src/components/about/StoryCommunityStats.tsx` | **Remove usage** | Replaced by ImpactMap (superior layout with map + 4 stats) |
| `src/components/about/ValuesPillars.tsx` | **Remove usage** | Consolidated into StoryValuesGrid |
| `src/components/about/MinistryInMotion.tsx` | **Remove usage** | Tribe gallery (StoryWorldwideTribe) is stronger |
| `src/components/about/WearTheMissionCTA.tsx` | **Remove usage** | StoryJoinCTA is the cleaner version |
| `src/components/about/BrandFilmHero.tsx` | **Remove usage** | StoryHero is the better hero |

### Section Index Watermarks (Final)

```text
01 -- StoryHero
02 -- StoryCallingSection
03 -- OriginStory
04 -- FounderLetter
05 -- StoryValuesGrid
06 -- ImpactMap
07 -- StoryWorldwideTribe
08 -- StoryJoinCTA
```

### OurStory.tsx (New Structure)

```typescript
import Layout from "@/components/layout/Layout";
import StoryHero from "@/components/about/StoryHero";
import StoryCallingSection from "@/components/about/StoryCallingSection";
import OriginStory from "@/components/about/OriginStory";
import FounderLetter from "@/components/about/FounderLetter";
import StoryValuesGrid from "@/components/about/StoryValuesGrid";
import ImpactMap from "@/components/about/ImpactMap";
import StoryWorldwideTribe from "@/components/about/StoryWorldwideTribe";
import StoryJoinCTA from "@/components/about/StoryJoinCTA";

const OurStory = () => {
  return (
    <Layout>
      <StoryHero />
      <StoryCallingSection />
      <OriginStory />
      <FounderLetter />
      <StoryValuesGrid />
      <ImpactMap />
      <StoryWorldwideTribe />
      <StoryJoinCTA />
    </Layout>
  );
};
```

### OurMission.tsx (Redirect)

```typescript
import { Navigate } from 'react-router-dom';
const OurMission = () => <Navigate to="/about/our-story" replace />;
```

### Editorial Pacing (Dark/Light Rhythm)

```text
01 StoryHero         -- DARK  (stone-950)
02 StoryCallingSection -- LIGHT (stone-50)
03 OriginStory        -- DARK  (stone-950)
04 FounderLetter      -- LIGHT (background)
05 StoryValuesGrid    -- DARK  (stone-950)
06 ImpactMap          -- DARK  (stone-950) *back-to-back dark is intentional for stats weight*
07 StoryWorldwideTribe -- LIGHT (stone-50)
08 StoryJoinCTA       -- DARK  (stone-950)
```

### Why This Is Better

- **Single destination**: One world-class page instead of two mediocre ones
- **Zero content loss**: Every unique section is preserved; only duplicates removed
- **Stronger pacing**: 8 sections with intentional dark/light editorial rhythm
- **Navigation works**: The existing "Our Story" link now leads to the complete brand story
- **Performance**: Removing 4 redundant components reduces bundle size
- **CRO improvement**: One clear journey from hero to CTA, no competing pages

### Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Longer single page | Low | 8 sections with varied pacing prevents monotony |
| Losing /our-mission URL | None | Redirect preserves any external links |
| Back-to-back dark sections (05-06) | Low | Different content types (values vs stats) create visual distinction |
