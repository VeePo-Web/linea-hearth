import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import ImageTextBlock from "../../components/about/ImageTextBlock";
import AboutSidebar from "../../components/about/AboutSidebar";

const OurStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader 
            title="Our Story" 
            subtitle="A calling to create clothing that speaks truth"
          />
          
          <ContentSection>
            <ImageTextBlock
              image="/products/heavenly-crewneck/lifestyle.png"
              imageAlt="Line of Judah founders"
              title="Founded on Faith"
              content="Line of Judah was born from a calling to create clothing that speaks truth. We believe that what you wear can be a testament to your faith — a daily reminder of who you are and whose you are. Every piece is designed to inspire conversations and strengthen your walk."
              imagePosition="left"
            />
          </ContentSection>

          <ContentSection title="Our Mission">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">Premium Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every piece in our collection is crafted with intention. We use premium fabrics, 
                  heavyweight materials, and quality construction that's built to last. When you 
                  wear Line of Judah, you're wearing your faith in style.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">Purpose-Driven</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe fashion can be a ministry. Our designs spark conversations, encourage 
                  connection, and remind both the wearer and those around them of God's love. 
                  Each purchase supports our mission to spread faith through fashion.
                </p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Our Values">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Faith</h3>
                <p className="text-muted-foreground">
                  Everything we create is rooted in our faith and designed to glorify God.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Quality</h3>
                <p className="text-muted-foreground">
                  We never compromise on materials or craftsmanship. Your faith deserves the best.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Community</h3>
                <p className="text-muted-foreground">
                  We're building more than a brand — we're building a community of believers.
                </p>
              </div>
            </div>
          </ContentSection>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default OurStory;
