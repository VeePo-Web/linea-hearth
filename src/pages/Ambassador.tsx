import Layout from "@/components/layout/Layout";
import PageSEO from "@/components/seo/PageSEO";
import AmbassadorHero from "@/components/ambassador/AmbassadorHero";
import AmbassadorBenefits from "@/components/ambassador/AmbassadorBenefits";
import AmbassadorRequirements from "@/components/ambassador/AmbassadorRequirements";
import AmbassadorForm from "@/components/ambassador/AmbassadorForm";
import CurrentAmbassadors from "@/components/ambassador/CurrentAmbassadors";

const Ambassador = () => {
  return (
    <Layout>
      <PageSEO
        title="Become an Ambassador | Line of Judah"
        description="Represent Line of Judah. Apply to become a brand ambassador and earn commission while sharing premium faith-based streetwear."
        path="/ambassador"
      />
      <AmbassadorHero />
      <CurrentAmbassadors />
      <AmbassadorBenefits />
      <AmbassadorRequirements />
      <AmbassadorForm />
    </Layout>
  );
};

export default Ambassador;
