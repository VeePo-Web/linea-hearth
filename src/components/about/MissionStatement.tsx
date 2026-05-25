import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const MissionStatement = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone-950 text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-white/10 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        03
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Left: Eyebrow + vertical rule */}
          <div className="lg:col-span-4 space-y-8">
            <motion.p
              className="text-[10px] tracking-[0.4em] text-champagne-500"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              THE MISSION
            </motion.p>

            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ transformOrigin: "top" }}
            >
              <div className="w-px h-32 bg-champagne-500/40" />
            </motion.div>

            <motion.p
              className="hidden lg:block text-[10px] tracking-[0.4em] text-white/30"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              EXODUS 28:2
            </motion.p>
          </div>

          {/* Right: Headline + body */}
          <div className="lg:col-span-8 space-y-8">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Wear what you believe. Carry it with you<span className="text-champagne-500">.</span>
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl font-light text-white/70 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Line of Judah exists to put sacred conviction onto everyday armor —
              pieces engineered to outlast trend, built for the believer who refuses to whisper.
            </motion.p>

            <motion.p
              className="text-lg md:text-xl font-light text-white/50 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Every drop is a quiet declaration: that craft can be ministry, that clothing can be
              testimony, and that <span className="italic text-white/80">"for glory and for beauty"</span> is not a relic — it's a standard.
            </motion.p>

            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <div className="w-16 h-px bg-champagne-500" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionStatement;
