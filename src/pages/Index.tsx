import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HeroBlock from "../components/homepage/HeroBlock";
import ValueStackBanner from "../components/homepage/ValueStackBanner";
import FeaturedCollection from "../components/homepage/FeaturedCollection";
import MissionBlock from "../components/homepage/MissionBlock";
import ReviewsCarousel from "../components/homepage/ReviewsCarousel";
import ProductGridTeaser from "../components/homepage/ProductGridTeaser";
import TestimonySpotlight from "../components/homepage/TestimonySpotlight";
import InstagramFeed from "../components/homepage/InstagramFeed";
import EmailOptIn from "../components/homepage/EmailOptIn";
import SecondaryCTAStrip from "../components/homepage/SecondaryCTAStrip";
import MobileStickyBar from "../components/homepage/MobileStickyBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SecondaryCTAStrip />
      <Header />
      
      <main>
        <HeroBlock />
        <ValueStackBanner />
        <FeaturedCollection />
        <MissionBlock />
        <ReviewsCarousel />
        <ProductGridTeaser />
        <TestimonySpotlight />
        <InstagramFeed />
        <EmailOptIn />
      </main>
      
      <Footer />
      <MobileStickyBar />
    </div>
  );
};

export default Index;
