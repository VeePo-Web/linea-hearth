

# Remove the Sticky Filter Bar from the Community Page

## What Changes

**File: `src/pages/Community.tsx`**

- Remove the `useState` imports and all four filter state variables (`selectedProduct`, `selectedType`, `selectedGender`, `sortBy`)
- Remove the `StoryFilters` import and its `<StoryFilters />` JSX block
- Pass hardcoded defaults (`"all"`, `"all"`, `"all"`, `"recent"`) directly to `<StoryGrid />` so it continues to show all stories sorted by most recent

The simplified component becomes:

```tsx
import Layout from "@/components/layout/Layout";
import CommunityHero from "@/components/community/CommunityHero";
import StoryGrid from "@/components/community/StoryGrid";
import SocialFeed from "@/components/community/SocialFeed";
import SubmitStoryCTA from "@/components/community/SubmitStoryCTA";

export default function Community() {
  return (
    <Layout>
      <CommunityHero />
      <StoryGrid
        selectedProduct="all"
        selectedType="all"
        selectedGender="all"
        sortBy="recent"
      />
      <SocialFeed />
      <SubmitStoryCTA />
    </Layout>
  );
}
```

## What Does NOT Change

- `StoryFilters.tsx` file stays in the codebase (can be cleaned up later if desired)
- `StoryGrid` component and its filtering logic remain intact
- No other pages affected

