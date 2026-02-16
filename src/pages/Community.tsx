import Layout from "@/components/layout/Layout";
import CommunityHero from "@/components/community/CommunityHero";
import StoryGrid from "@/components/community/StoryGrid";
import SocialFeed from "@/components/community/SocialFeed";
import SubmitStoryCTA from "@/components/community/SubmitStoryCTA";
import { motion } from "framer-motion";

function StatStrip() {
  return (
    <div className="w-full border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-12 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          <span>500+ Stories</span>
          <span className="text-border">|</span>
          <span>45 Cities</span>
          <span className="text-border">|</span>
          <span>10K Tribe</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hidden md:block">
          01 — Community
        </span>
      </div>
    </div>
  );
}

export default function Community() {
  return (
    <Layout>
      <CommunityHero />
      <StatStrip />
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
