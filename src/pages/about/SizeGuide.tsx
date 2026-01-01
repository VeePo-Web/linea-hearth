import Layout from "@/components/layout/Layout";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import AboutSidebar from "../../components/about/AboutSidebar";

const SizeGuide = () => {
  return (
    <Layout>
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
        <PageHeader 
          title="Size Guide" 
          subtitle="Find your perfect fit with our comprehensive sizing guide"
        />
        
        <ContentSection title="Apparel Sizing">
          <div className="space-y-8">
            <div className="bg-muted/10 rounded-lg p-8">
              <h3 className="text-xl font-light text-foreground mb-6">How to Measure</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Chest</h4>
                  <p className="text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape horizontal.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Length</h4>
                  <p className="text-muted-foreground">
                    Measure from the highest point of your shoulder down to where you want 
                    the garment to end.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="border border-border p-3 text-left font-light">Size</th>
                    <th className="border border-border p-3 text-left font-light">Chest (in)</th>
                    <th className="border border-border p-3 text-left font-light">Length (in)</th>
                    <th className="border border-border p-3 text-left font-light">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "S", chest: "36-38", length: "27", sleeve: "33" },
                    { size: "M", chest: "39-41", length: "28", sleeve: "34" },
                    { size: "L", chest: "42-44", length: "29", sleeve: "35" },
                    { size: "XL", chest: "45-47", length: "30", sleeve: "36" },
                    { size: "2XL", chest: "48-50", length: "31", sleeve: "37" },
                    { size: "3XL", chest: "51-53", length: "32", sleeve: "38" }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-muted/10">
                      <td className="border border-border p-3 font-medium">{row.size}</td>
                      <td className="border border-border p-3">{row.chest}</td>
                      <td className="border border-border p-3">{row.length}</td>
                      <td className="border border-border p-3">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Fit Guide">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-light text-foreground">Regular Fit</h3>
              <p className="text-muted-foreground">
                Our regular fit offers a classic, comfortable silhouette that's not too 
                tight or too loose. Great for everyday wear.
              </p>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-light text-foreground">Oversized Fit</h3>
              <p className="text-muted-foreground">
                Our oversized pieces are designed with extra room for a relaxed, 
                streetwear-inspired look. Consider sizing down if you prefer less volume.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Need Help?">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Still unsure about sizing? Our team is here to help you find the perfect fit. 
              Reach out to us or check out our model info on product pages for reference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="rounded-none">
                Download PDF Guide
              </Button>
              <Button className="rounded-none">
                Contact Support
              </Button>
            </div>
          </div>
        </ContentSection>
        </main>
      </div>
    </Layout>
  );
};

export default SizeGuide;
