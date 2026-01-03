import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const StoryCallingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-stone-50 text-stone-950 py-32 md:py-48 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span 
        className="absolute top-8 right-8 text-[10px] tracking-[0.4em] text-stone-950/10 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        02
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left: Giant quote */}
          <div className="relative">
            {/* Giant quotation mark */}
            <motion.span
              className="absolute -top-16 -left-4 text-[200px] md:text-[300px] font-serif text-amber-500/10 leading-none select-none pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              "
            </motion.span>

            <motion.blockquote
              className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Every piece is designed to inspire conversations and strengthen your walk
              <span className="text-amber-500">.</span>
            </motion.blockquote>

            {/* Rotated vertical text */}
            <motion.span
              className="hidden lg:block absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[0.4em] text-stone-950/20 whitespace-nowrap origin-center"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              THE CALLING
            </motion.span>
          </div>

          {/* Right: Story text */}
          <div className="space-y-8">
            <motion.p
              className="text-[10px] tracking-[0.4em] text-amber-500"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              OUR STORY
            </motion.p>

            <motion.p
              className="text-lg md:text-xl font-light text-stone-700 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Line of Judah was born from a calling to create clothing that speaks truth. 
              We believe that what you wear can be a testament to your faith — a daily 
              reminder of who you are and whose you are.
            </motion.p>

            <motion.p
              className="text-lg md:text-xl font-light text-stone-500 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              This isn't a clothing company. It's a movement. A community of believers 
              who wear their faith like armor, who use fashion as a form of ministry, 
              and who refuse to let their wardrobes stay neutral.
            </motion.p>

            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="w-16 h-px bg-amber-500" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryCallingSection;
