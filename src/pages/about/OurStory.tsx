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

export default OurStory;
