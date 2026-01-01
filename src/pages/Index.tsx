import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import EditorialHero from "../components/homepage/EditorialHero";
import ValueStackBanner from "../components/homepage/ValueStackBanner";
import FeaturedDrop from "../components/homepage/FeaturedDrop";
import CategoryTiles from "../components/homepage/CategoryTiles";
import MarqueeStrip from "../components/homepage/MarqueeStrip";
import MissionBlock from "../components/homepage/MissionBlock";
import DropGrid from "../components/homepage/DropGrid";
import FeaturedCollection from "../components/homepage/FeaturedCollection";
import TestimonySpotlight from "../components/homepage/TestimonySpotlight";
import InstagramFeed from "../components/homepage/InstagramFeed";
import EmailOptIn from "../components/homepage/EmailOptIn";
import MobileStickyBar from "../components/homepage/MobileStickyBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Editorial Hero - Asymmetric split layout */}
        <EditorialHero />
        
        {/* Value Strip - Compressed single line */}
        <ValueStackBanner />
        
        {/* Featured Drop - Magazine spread */}
        <FeaturedDrop />
        
        {/* Category Tiles - 032c asymmetric grid */}
        <CategoryTiles />
        
        {/* Social Proof Marquee */}
        <MarqueeStrip />
        
        {/* Bestsellers Grid */}
        <FeaturedCollection />
        
        {/* Mission Block - Full-bleed editorial */}
        <MissionBlock />
        
        {/* New Arrivals - Drop culture grid */}
        <DropGrid />
        
        {/* Testimony - i-D portrait style */}
        <TestimonySpotlight />
        
        {/* Instagram Collage */}
        <InstagramFeed />
        
        {/* Newsletter - Bold full-width */}
        <EmailOptIn />
      </main>
      
      <Footer />
      <MobileStickyBar />
    </div>
  );
};

export default Index;