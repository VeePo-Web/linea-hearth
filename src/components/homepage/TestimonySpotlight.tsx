import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import TextReveal from "@/components/motion/TextReveal";

const TestimonySpotlight = () => {
  return (
    <section className="w-full bg-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] md:min-h-[80vh]">
        {/* Portrait Image - i-D style full-height - reduced on mobile to prevent over-cropping */}
        <ImageReveal 
          src="/products/stay-holy-hoodie/female-model-2.png"
          alt="Customer wearing Line of Judah"
          className="min-h-[50vh] md:min-h-[60vh] lg:min-h-full"
          direction="left"
        />

        {/* Quote Block */}
        <div className="flex items-center p-6 xs:p-8 md:p-12 lg:p-16">
          <div className="max-w-lg">
            {/* Customer Info - Moved above quote on mobile for hierarchy */}
            <ScrollReveal variant="fadeUp" delay={0.1} className="lg:hidden mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">From the tribe</p>
                <p className="text-sm font-medium text-background">Marcus T.</p>
                <p className="text-caption text-background/50">Youth Pastor • Atlanta, GA</p>
              </div>
            </ScrollReveal>

            {/* Large Quote - No quote icon, just big text */}
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <blockquote className="mb-6 md:mb-8">
                <TextReveal 
                  text="People stop me all the time. It's not just a conversation starter—" 
                  className="text-2xl xs:text-3xl md:text-4xl lg:text-hero text-background leading-snug md:leading-tight"
                  as="span"
                  delay={0.3}
                />
                <motion.span 
                  className="text-2xl xs:text-3xl md:text-4xl lg:text-hero text-accent leading-snug md:leading-tight block mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  it's an opportunity to share my faith.
                </motion.span>
              </blockquote>
            </ScrollReveal>

            {/* Customer Info - Desktop only (already shown above on mobile) */}
            <ScrollReveal variant="fadeUp" delay={0.6} className="hidden lg:block">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">From the tribe</p>
                <p className="text-sm font-medium text-background">Marcus T.</p>
                <p className="text-caption text-background/50">Youth Pastor • Atlanta, GA</p>
              </div>
            </ScrollReveal>

            {/* CTA - Enhanced touch target */}
            <ScrollReveal variant="fadeUp" delay={0.8}>
              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                <Link 
                  to="/community"
                  className="inline-flex items-center gap-2 text-background text-sm font-light hover:text-accent transition-colors group touch-target py-3 -my-3"
                >
                  Read More Stories
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonySpotlight;