import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { easing, timing } from "@/lib/animations";
import TextReveal from "@/components/motion/TextReveal";
import ScrollReveal from "@/components/motion/ScrollReveal";

const LookbookHero = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const scrollToNext = () => {
    const nextSection = document.querySelector('[data-look-index="0"]');
    nextSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      className="h-screen w-full flex items-center justify-center relative bg-stone-900 snap-start overflow-hidden"
    >
      {/* Noise grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: timing.cinematic, ease: easing.editorial }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 w-full max-w-4xl mx-auto">
        {/* Eyebrow - Brand */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.2 }}
          className="mb-12"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-light">
            Line of Judah
          </p>
        </motion.div>

        {/* Main Title - Split with varying weights */}
        <div className="mb-8">
          <div className="overflow-hidden">
            <motion.span
              className="block text-6xl md:text-8xl lg:text-[10rem] font-extralight text-white/90 leading-[0.85] tracking-tight"
              initial={prefersReducedMotion ? {} : { y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: timing.cinematic, ease: easing.editorial, delay: 0.4 }}
            >
              THE
            </motion.span>
          </div>
          <div className="overflow-hidden mt-2">
            <motion.span
              className="block text-6xl md:text-8xl lg:text-[10rem] font-extralight italic text-white leading-[0.85] tracking-tight"
              initial={prefersReducedMotion ? {} : { y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: timing.cinematic, ease: easing.editorial, delay: 0.55 }}
            >
              LOOKBOOK
            </motion.span>
          </div>
        </div>

        {/* Season Tag */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.8 }}
          className="mb-8"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/40 font-light">
            — SS25
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-base md:text-lg font-light text-white/50 max-w-md leading-relaxed"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.9 }}
        >
          Curated fits for the anointed.<br />
          Shop by design, not just category.
        </motion.p>

        {/* Scroll Indicator - Minimal */}
        <motion.button 
          onClick={scrollToNext}
          className="absolute bottom-16 left-6 flex flex-col items-start gap-4 text-white/40 hover:text-white/70 transition-colors cursor-pointer group"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 1.2 }}
          aria-label="Scroll to explore looks"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-light">
            Scroll
          </span>
          <motion.div
            className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"
            animate={prefersReducedMotion ? {} : { scaleY: [1, 0.5, 1] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "top" }}
          />
        </motion.button>
      </div>

      {/* Look count indicator - Right side */}
      <motion.div
        className="absolute right-6 bottom-16 text-right"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: timing.slow, ease: easing.editorial, delay: 1.3 }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-light mb-1">
          Looks
        </p>
        <p className="text-2xl font-extralight text-white/50">
          05
        </p>
      </motion.div>
    </section>
  );
};

export default LookbookHero;
