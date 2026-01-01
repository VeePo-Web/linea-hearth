import Layout from '@/components/layout/Layout';
import BrandFilmHero from '@/components/about/BrandFilmHero';
import FounderLetter from '@/components/about/FounderLetter';
import OriginStory from '@/components/about/OriginStory';
import MinistryInMotion from '@/components/about/MinistryInMotion';
import ImpactMap from '@/components/about/ImpactMap';
import ValuesPillars from '@/components/about/ValuesPillars';
import WearTheMissionCTA from '@/components/about/WearTheMissionCTA';

const OurMission = () => {
  return (
    <Layout>
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
    </Layout>
  );
};

export default OurMission;
