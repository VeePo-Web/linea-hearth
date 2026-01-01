import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import ParallaxImage from "@/components/motion/ParallaxImage";
import TextReveal from "@/components/motion/TextReveal";
import { hoverScale, tapScale } from "@/lib/animations";

const MissionBlock = () => {
  return (
    <section className="relative w-full min-h-[70vh] overflow-hidden">
      {/* Full-bleed Background with Parallax */}
      <ParallaxImage 
        src="/products/stay-holy-hoodie/female-model-1.png"
        alt="Line of Judah Community"
        className="absolute inset-0"
        speed={0.2}
      />
      
      <motion.div 
        className="absolute inset-0 bg-foreground/40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Content Overlay - Magazine ad style */}
      <div className="relative z-10 min-h-[70vh] flex items-center justify-center px-6">
        <ScrollReveal variant="fadeUp" delay={0.2}>
          <motion.div 
            className="bg-background p-8 md:p-12 lg:p-16 max-w-2xl text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Eyebrow */}
            <motion.p 
              className="text-eyebrow text-accent mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Our Mission
            </motion.p>

            {/* Headline */}
            <div className="mb-6">
              <TextReveal 
                text="MORE THAN CLOTHING." 
                className="text-hero text-foreground"
                as="h2"
                delay={0.4}
              />
            </div>

            {/* Quote */}
            <motion.p 
              className="text-editorial text-muted-foreground mb-8 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              A movement of believers wearing their faith boldly. Every piece designed with intention, rooted in Scripture.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={hoverScale}
              whileTap={tapScale}
            >
              <Link 
                to="/about/our-story"
                className="inline-flex items-center gap-2 text-foreground text-sm font-medium tracking-wide hover:text-accent transition-colors group"
              >
                Our Story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MissionBlock;
