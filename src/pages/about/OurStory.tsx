import { useRef } from "react";
import Layout from "@/components/layout/Layout";
import StoryHero from "@/components/about/StoryHero";
import StoryCallingSection from "@/components/about/StoryCallingSection";
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
      <div ref={containerRef}>
        <ScrollProgress containerRef={containerRef} />
        <StoryHero />
        <StoryCallingSection />
        <OriginStory />
        <FounderLetter />
        <StoryValuesGrid />
        {/* Amber separator between back-to-back dark sections */}
        <div className="bg-stone-950 flex justify-center py-0">
          <div className="w-24 h-px bg-amber-500/40" />
        </div>
        <ImpactMap />
        <StoryWorldwideTribe />
        <StoryJoinCTA />
      </div>
    </Layout>
  );
};

export default OurStory;
