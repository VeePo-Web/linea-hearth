import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const StoryJoinCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-stone-950 text-white overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span 
        className="absolute top-8 right-8 text-[10px] tracking-[0.4em] text-white/20 font-light z-20"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        05
      </motion.span>

      <div className="grid lg:grid-cols-5">
        {/* Left: Image */}
        <div className="lg:col-span-3 relative min-h-[50vh] lg:min-h-screen">
          <img 
            src="/founders.png"
            alt="Line of Judah community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-stone-950 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Right: CTA Block */}
        <div className="lg:col-span-2 relative flex items-center">
          {/* Amber accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 hidden lg:block" />

          <div className="w-full px-8 md:px-12 lg:px-16 py-20 lg:py-0">
            <motion.p
              className="text-[10px] tracking-[0.4em] text-amber-500 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              JOIN THE MOVEMENT
            </motion.p>

            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Ready to Wear
              <br />
              the Mission<span className="text-amber-500">?</span>
            </motion.h2>

            <motion.p
              className="text-lg font-light text-white/60 mb-12 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Join 10K+ believers who wear their faith boldly. 
              Every piece is a statement. Every purchase supports the mission.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium px-8 h-14 text-sm tracking-wide rounded-none"
              >
                <Link to="/category/all">
                  Shop the Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white font-medium px-8 h-14 text-sm tracking-wide rounded-none"
              >
                <Link to="/ambassador">
                  Become an Ambassador
                </Link>
              </Button>
            </motion.div>

            {/* Social proof footer */}
            <motion.p
              className="text-xs text-white/30 mt-12 tracking-wide"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Trusted by believers in 45 cities across 5 countries
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryJoinCTA;
