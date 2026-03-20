import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ImageReveal from "@/components/motion/ImageReveal";
import ScrollReveal from "@/components/motion/ScrollReveal";

const TestimonySpotlight = () => {
  return (
    <section className="w-full bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] md:min-h-[80vh]">
        <ImageReveal 
          src="/products/stay-holy-hoodie/female-model-2.png"
          alt="Customer wearing Line of Judah"
          className="min-h-[50vh] md:min-h-[60vh] lg:min-h-full"
          direction="left"
        />

        <div className="flex items-center p-6 xs:p-8 md:p-12 lg:p-16">
          <div className="max-w-lg w-full">
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <p className="text-xs uppercase tracking-[0.2em] text-accent mb-6">From the tribe</p>
            </ScrollReveal>

            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Coming soon...
              </p>
            </div>

            <ScrollReveal variant="fadeUp" delay={0.3}>
              <Link 
                to="/community"
                className="inline-flex items-center gap-2 text-stone-900 text-sm font-light hover:text-champagne-600 transition-colors group touch-target py-3 -my-3"
              >
                Read More Stories
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonySpotlight;
