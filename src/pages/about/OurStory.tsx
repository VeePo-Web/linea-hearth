import { useRef } from "react";
import Layout from "@/components/layout/Layout";
import PageSEO from "@/components/seo/PageSEO";
import StoryHero from "@/components/about/StoryHero";
import StoryCallingSection from "@/components/about/StoryCallingSection";
import MissionStatement from "@/components/about/MissionStatement";
import OriginStory from "@/components/about/OriginStory";
import FounderLetter from "@/components/about/FounderLetter";
import StoryValuesGrid from "@/components/about/StoryValuesGrid";
import ImpactMap from "@/components/about/ImpactMap";
import StoryWorldwideTribe from "@/components/about/StoryWorldwideTribe";
import StoryJoinCTA from "@/components/about/StoryJoinCTA";
import ScrollProgress from "@/components/about/ScrollProgress";

const OurStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Layout>
      <PageSEO
        title="Our Story | Line of Judah"
        description="The origin story behind Line of Judah — how a calling became premium faith-based streetwear designed for those who walk different."
        path="/about/our-story"
        type="article"
      />
      <div ref={containerRef}>
        <ScrollProgress containerRef={containerRef} />
        <StoryHero />
        <div className="bg-stone-950 flex justify-center py-0"><div className="w-24 h-px bg-champagne-500/40" /></div>
        <StoryCallingSection />
        <div className="bg-stone-950 flex justify-center py-0"><div className="w-24 h-px bg-champagne-500/40" /></div>
        <MissionStatement />
        <div className="bg-stone-950 flex justify-center py-0"><div className="w-24 h-px bg-champagne-500/40" /></div>
        <OriginStory />
        <FounderLetter />
        <StoryValuesGrid />
        <ImpactMap />
        <div className="bg-stone-950 flex justify-center py-0"><div className="w-24 h-px bg-champagne-500/40" /></div>
        <StoryWorldwideTribe />
        <div className="bg-stone-950 flex justify-center py-0"><div className="w-24 h-px bg-champagne-500/40" /></div>
        <StoryJoinCTA />
      </div>
    </Layout>
  );
};

export default OurStory;
