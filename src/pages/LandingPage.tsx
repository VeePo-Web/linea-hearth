import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Editorial easing curve (Fear of God / 032c style)
const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();

  // Full animation variants - cinematic choreography
  const backgroundVariants = {
    initial: { opacity: 0, scale: 1 },
    animate: {
      opacity: 0.15,
      scale: 1,
      transition: { duration: 1.4, delay: 0.5, ease: editorialEase },
    },
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 1, delay: 1, ease: editorialEase },
    },
  };

  const brandVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 1.8, delay: 1.4, ease: editorialEase },
    },
  };

  const verseVariants = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, delay: 2.4, ease: editorialEase },
    },
  };

  const verseRefVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.8, delay: 2.8, ease: editorialEase },
    },
  };

  const ctaVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.6, delay: 3.2, ease: editorialEase },
    },
  };

  // Simple variants for reduced motion
  const simpleVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  const v = prefersReducedMotion
    ? {
        background: { ...simpleVariants, animate: { ...simpleVariants.animate, opacity: 0.18 } },
        glow: simpleVariants,
        brand: simpleVariants,
        verse: simpleVariants,
        verseRef: simpleVariants,
        cta: simpleVariants,
      }
    : {
        background: backgroundVariants,
        glow: glowVariants,
        brand: brandVariants,
        verse: verseVariants,
        verseRef: verseRefVariants,
        cta: ctaVariants,
      };

  return (
    <>
      <Helmet>
        <title>Line of Judah | Premium Faith-Based Streetwear</title>
        <meta
          name="description"
          content="Premium streetwear for those set apart. Holy garments for glory and for beauty. Enter the world of Line of Judah."
        />
      </Helmet>

      <main className="fixed inset-0 h-[100dvh] overflow-hidden landing-abyss">
        {/* Layer 0: Ken Burns Background Image - Sepia-warm Seventh Heaven LA */}
        <motion.div
          className="absolute inset-0 ken-burns-slow overflow-hidden"
          variants={v.background}
          initial="initial"
          animate="animate"
        >
          <img
            src="/nav-hero-hoodie.png"
            alt=""
            className="w-full h-full object-cover ken-burns-sepia"
            style={{
              objectPosition: "center 40%",
            }}
          />
        </motion.div>

        {/* Layer 1: Glitch Split Layer - Travis Scott distortion (desktop only) */}
        {!prefersReducedMotion && (
          <div className="glitch-layer">
            <img
              src="/nav-hero-hoodie.png"
              alt=""
              className="w-full h-full object-cover ken-burns-sepia"
              style={{ objectPosition: "center 40%" }}
            />
          </div>
        )}

        {/* Layer 2: Smoke/Mist Layer - Travis Scott Astroworld atmosphere */}
        {!prefersReducedMotion && <div className="smoke-layer" />}

        {/* Layer 3: Extreme Vignette - Softened */}
        <div className="absolute inset-0 landing-extreme-vignette" />

        {/* Layer 4: Center Glow with Pulse - Lion focal point */}
        <motion.div
          className="absolute inset-0 landing-glow"
          variants={v.glow}
          initial="initial"
          animate="animate"
        />

        {/* Layer 5: Animated Film Grain */}
        <div className="absolute inset-0 hero-noise-animated" />

        {/* Layer 6: Subtle Scan Lines (032c Industrial) */}
        <div className="absolute inset-0 scan-lines" />


        {/* Content Layer - Dead Center */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {/* Safe area spacer top */}
          <div
            className="shrink-0"
            style={{ height: "max(env(safe-area-inset-top), 24px)" }}
          />

          {/* Centered Brand Statement + Verse */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Brand Statement - Chrome Hearts metallic treatment */}
            <motion.div
              className="text-center"
              variants={v.brand}
              initial="initial"
              animate="animate"
            >
              <h1
                className="text-brand-statement text-chrome animate-breathe select-none"
              >
                LINE OF JUDAH
              </h1>
              {/* Chrome Underline - Restored */}
              <div className="chrome-underline" aria-hidden="true" />
            </motion.div>

            {/* Unified Verse Block - Zero-Shift Expansion */}
            <motion.div
              className="verse-unified-block mt-20 md:mt-32"
              variants={v.verse}
              initial="initial"
              animate="animate"
            >
              {/* Prepend - The context that fades in ABOVE */}
              <div className="verse-prepend" aria-hidden="true">
                <p className="verse-archival verse-prepend-text">
                  "And thou shalt make holy garments<br />
                  for Aaron thy brother,
                </p>
              </div>

              {/* Core Quote - Always visible */}
              <p className="verse-archival verse-core text-[0.8rem] md:text-[0.9rem]">
                for{' '}
                <span className="glory-word">glory</span>
                {' '}and for{' '}
                <span className="beauty-word">beauty</span>
                ."
              </p>

              {/* ASV Attribution - Fades in */}
              <span className="verse-asv-attribution">— ASV</span>

              {/* Reference - Never moves */}
              <motion.span 
                className="verse-reference-archival verse-ref-fixed mt-3"
                variants={v.verseRef}
                initial="initial"
                animate="animate"
                tabIndex={0}
              >
                Exodus 28:2
              </motion.span>
            </motion.div>

            {/* Enter Portal - Chrome Hearts Luxury CTA */}
            <motion.div
              className="mt-20 md:mt-24"
              variants={v.cta}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/home"
                className="enter-portal-chrome block text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/55 hover:text-white/85 focus-visible:outline-none"
              >
                Enter
              </Link>
            </motion.div>
          </div>

          {/* Safe area spacer bottom */}
          <div
            className="shrink-0"
            style={{ height: "max(env(safe-area-inset-bottom), 24px)" }}
          />
        </div>
      </main>
    </>
  );
};

export default LandingPage;
