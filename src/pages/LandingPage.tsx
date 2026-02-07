import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Editorial easing curve (Fear of God / 032c style)
const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion();

  // Full animation variants
  const backgroundVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 0.15,
      transition: { duration: 1.2, delay: 0.3, ease: editorialEase },
    },
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.8, delay: 0.6, ease: editorialEase },
    },
  };

  const brandVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 1.5, delay: 0.8, ease: editorialEase },
    },
  };

  const ctaVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 0.3,
      transition: { duration: 0.5, delay: 2.5, ease: editorialEase },
    },
  };

  // Simple variants for reduced motion
  const simpleVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  const simpleCtaVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 0.3, transition: { duration: 0.3 } },
  };

  const v = prefersReducedMotion
    ? {
        background: { ...simpleVariants, animate: { ...simpleVariants.animate, opacity: 0.15 } },
        glow: simpleVariants,
        brand: simpleVariants,
        cta: simpleCtaVariants,
      }
    : {
        background: backgroundVariants,
        glow: glowVariants,
        brand: brandVariants,
        cta: ctaVariants,
      };

  return (
    <>
      <Helmet>
        <title>Line of Judah | Premium Faith-Based Streetwear</title>
        <meta
          name="description"
          content="Premium streetwear for those set apart. Enter the world of Line of Judah."
        />
      </Helmet>

      <main className="fixed inset-0 h-[100dvh] overflow-hidden landing-abyss">
        {/* Layer 0: Background Image (heavily desaturated, low opacity) */}
        <motion.div
          className="absolute inset-0"
          variants={v.background}
          initial="initial"
          animate="animate"
        >
          <img
            src="/nav-hero-hoodie.png"
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: "grayscale(100%) contrast(1.2)",
            }}
          />
        </motion.div>

        {/* Layer 1: Center Glow */}
        <motion.div
          className="absolute inset-0 landing-glow"
          variants={v.glow}
          initial="initial"
          animate="animate"
        />

        {/* Layer 2: Extreme Vignette */}
        <div className="absolute inset-0 landing-extreme-vignette" />

        {/* Layer 3: Heavy Film Grain */}
        <div className="absolute inset-0 hero-noise-heavy" />

        {/* Content Layer - Dead Center */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {/* Safe area spacer top */}
          <div
            className="shrink-0"
            style={{ height: "max(env(safe-area-inset-top), 24px)" }}
          />

          {/* Centered Brand Statement */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.h1
              className="text-brand-statement text-white/90 animate-breathe text-center select-none"
              variants={v.brand}
              initial="initial"
              animate="animate"
            >
              LINE OF JUDAH
            </motion.h1>

            {/* Minimal CTA */}
            <motion.div
              className="mt-16 md:mt-20"
              variants={v.cta}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/home"
                className="block py-4 px-8 text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-white/30 hover:text-white/60 transition-colors duration-700 focus-visible:outline-none focus-visible:text-white/60"
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
