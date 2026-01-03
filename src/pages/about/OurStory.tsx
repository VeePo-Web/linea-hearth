import Layout from "@/components/layout/Layout";
import StoryHero from "@/components/about/StoryHero";
import StoryCallingSection from "@/components/about/StoryCallingSection";
import StoryValuesGrid from "@/components/about/StoryValuesGrid";
import StoryCommunityStats from "@/components/about/StoryCommunityStats";
import StoryWorldwideTribe from "@/components/about/StoryWorldwideTribe";
import StoryJoinCTA from "@/components/about/StoryJoinCTA";

const OurStory = () => {
  return (
    <Layout>
      <StoryHero />
      <StoryCallingSection />
      <StoryValuesGrid />
      <StoryCommunityStats />
      <StoryWorldwideTribe />
      <StoryJoinCTA />
    </Layout>
  );
};

export default OurStory;
