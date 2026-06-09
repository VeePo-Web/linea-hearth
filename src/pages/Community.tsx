import Layout from "@/components/layout/Layout";
import PageSEO from "@/components/seo/PageSEO";
import CommunityHero from "@/components/community/CommunityHero";
import StoryGrid from "@/components/community/StoryGrid";
// import SocialFeed from "@/components/community/SocialFeed"; // hidden until social feed is ready
import SubmitStoryCTA from "@/components/community/SubmitStoryCTA";

export default function Community() {
  return (
    <Layout>
      <PageSEO
        title="Community Stories | Line of Judah"
        description="Real stories from the Line of Judah tribe. Read how faith-based streetwear sparks conversations and builds community."
        path="/community"
      />
      <CommunityHero />
      <StoryGrid />
      <div className="h-px bg-border" />
      <SubmitStoryCTA />
    </Layout>
  );
}
