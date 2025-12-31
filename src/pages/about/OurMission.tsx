import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import BrandFilmHero from '@/components/about/BrandFilmHero';
import FounderLetter from '@/components/about/FounderLetter';
import OriginStory from '@/components/about/OriginStory';
import MinistryInMotion from '@/components/about/MinistryInMotion';
import ImpactMap from '@/components/about/ImpactMap';
import ValuesPillars from '@/components/about/ValuesPillars';
import WearTheMissionCTA from '@/components/about/WearTheMissionCTA';

const OurMission = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero: Brand Film with Overlay */}
        <BrandFilmHero />

        {/* Founder Letter: Personal Story */}
        <FounderLetter />

        {/* Origin Story: Lion of Judah */}
        <OriginStory />

        {/* Ministry in Motion: UGC Carousel */}
        <MinistryInMotion />

        {/* Impact Map: Stats + Cities */}
        <ImpactMap />

        {/* Values Pillars: Evangelism, Identity, Conviction */}
        <ValuesPillars />

        {/* CTA: Wear the Mission */}
        <WearTheMissionCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default OurMission;
