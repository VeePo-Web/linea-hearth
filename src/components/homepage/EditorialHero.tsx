import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import TextReveal from "@/components/motion/TextReveal";
import ImageReveal from "@/components/motion/ImageReveal";
import { hoverScale, tapScale } from "@/lib/animations";

const EditorialHero = () => {
  return (
    <section className="relative w-full min-h-screen bg-foreground overflow-hidden">
      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Content - Text Block */}
        <div className="lg:col-span-5 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-24 lg:py-0 order-2 lg:order-1 bg-foreground">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <p className="text-eyebrow text-muted-foreground mb-6">
                New Collection
              </p>
            </ScrollReveal>

            {/* Main Headline - Oversized 032c style with word reveal */}
            <div className="mb-8">
              <TextReveal 
                text="WEAR YOUR" 
                className="text-display text-background block"
                as="h1"
                delay={0.2}
              />
              <motion.span 
                className="text-display text-accent block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                FAITH.
              </motion.span>
            </div>

            {/* Tagline */}
            <ScrollReveal variant="fadeUp" delay={0.4}>
              <p className="text-editorial text-muted-foreground max-w-md mb-12">
                Premium streetwear for the modern believer. Bold statements. Timeless purpose.
              </p>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal variant="fadeUp" delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={hoverScale} whileTap={tapScale}>
                  <Link 
                    to="/category/shop"
                    className="inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-sm font-medium tracking-wide hover:bg-accent hover:text-foreground transition-colors group"
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Floating Badge - Hypebeast style */}
            <ScrollReveal variant="fadeIn" delay={0.8}>
              <div className="mt-16 inline-flex items-center gap-2">
                <motion.span 
                  className="w-2 h-2 bg-destructive rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-caption text-muted-foreground uppercase">
                  New Drop • Stay Holy Hoodie
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="lg:col-span-7 relative order-1 lg:order-2 min-h-[60vh] lg:min-h-screen">
          <ImageReveal 
            src="/products/stay-holy-hoodie/male-model.png"
            alt="Stay Holy Hoodie"
            className="absolute inset-0"
            direction="right"
          />
          
          {/* Subtle gradient overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-foreground/20 lg:to-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          />

          {/* Product Tag - Editorial style */}
          <ScrollReveal variant="fadeUp" delay={1}>
            <div className="absolute bottom-8 right-8 bg-background px-4 py-3">
              <p className="text-caption text-muted-foreground uppercase mb-1">Featured</p>
              <p className="text-sm font-medium text-foreground">Stay Holy Hoodie</p>
              <p className="text-sm text-foreground">$79</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default EditorialHero;
