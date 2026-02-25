import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import CharacterReveal from "@/components/motion/CharacterReveal";
import DropBadgeCluster from "./DropBadgeCluster";
import ScrollInvitation from "./ScrollInvitation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPrice } from "@/lib/currency";

const EditorialHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms - disabled on mobile for performance
  const mainImageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const secondaryImageY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Disable parallax on mobile to save GPU/battery
  const shouldAnimate = !prefersReducedMotion && !isMobile;

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-dvh bg-foreground overflow-hidden hero-noise group"
      style={{ position: "relative" }}
    >
      {/* Index Number - 032c Editorial Watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 right-8 z-10 hero-index text-background/5 hidden lg:block"
      >
        01
      </motion.div>

      {/* Main Image Layer - Brave Crop */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: shouldAnimate ? mainImageY : 0 }}
      >
        <motion.div
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src="/products/stay-holy-hoodie/male-model.png"
            alt="Stay Holy Hoodie - Male Model"
            className="w-full h-full object-cover object-top hero-image-grayscale"
            loading="eager"
            /* @ts-ignore — valid HTML attribute, not a React prop */
            fetchpriority="high"
          />
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/40" />
        </motion.div>
      </motion.div>

      {/* Secondary Image - Offset Collage Layer */}
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[35vw] max-w-[400px] h-[45vh] z-[5] hidden lg:block"
        style={{ y: shouldAnimate ? secondaryImageY : 0 }}
      >
        <motion.div
          initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-full"
        >
          <img
            src="/products/stay-holy-hoodie/female-model-1.png"
            alt="Stay Holy Hoodie - Female Model"
            className="w-full h-full object-cover object-center hero-image-grayscale"
            loading="lazy"
          />
        </motion.div>
      </motion.div>

      {/* Floating Product - Small Detail Layer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: -5 }}
        transition={{ delay: 1.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute top-[15%] right-[8%] w-[12vw] max-w-[140px] z-[6] hidden xl:block"
      >
        <img
          src="/products/stay-holy-hoodie/flat-front.png"
          alt="Stay Holy Hoodie - Product"
          className="w-full h-auto drop-shadow-2xl"
          loading="lazy"
        />
      </motion.div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 min-h-dvh flex flex-col justify-between px-4 xs:px-6 md:px-12 lg:px-16 pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-12 lg:pb-16 safe-area-bottom"
        style={{ opacity: shouldAnimate ? textOpacity : 1 }}
      >

        {/* Center Section - Massive Typography */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Mobile Typography - Refined scaling */}
          <div className="block lg:hidden">
            <h1 className="text-hero-massive-mobile-refined text-background leading-[0.85]">
              <CharacterReveal 
                text="WEAR" 
                className="block"
                delay={0.7}
                staggerDelay={0.04}
              />
              <CharacterReveal 
                text="YOUR" 
                className="block"
                delay={0.9}
                staggerDelay={0.04}
              />
              <CharacterReveal 
                text="FAITH." 
                className="block text-accent"
                delay={1.1}
                staggerDelay={0.04}
              />
            </h1>
          </div>

          {/* Desktop Typography - Offset Layout */}
          <div className="hidden lg:block">
            <h1 className="text-hero-massive text-background leading-[0.85]">
              <CharacterReveal 
                text="WEAR" 
                className="block"
                delay={0.7}
                staggerDelay={0.025}
              />
              <CharacterReveal 
                text="YOUR" 
                className="block ml-[15vw]"
                delay={0.9}
                staggerDelay={0.025}
              />
              <CharacterReveal 
                text="FAITH." 
                className="block text-accent"
                delay={1.1}
                staggerDelay={0.025}
              />
            </h1>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 md:mt-8 lg:mt-12 max-w-md text-sm xs:text-base md:text-lg font-light leading-relaxed text-muted-foreground"
          >
            Some people wear crosses as accessories.<br />
            You wear yours as a declaration.<br />
            <span className="text-background">This is for you.</span>
          </motion.p>
        </div>

        {/* Bottom Section - CTA + Drop Badge */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8 pb-4 md:pb-8">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-4 md:gap-6"
          >
            <Link
              to="/category/shop"
              className="editorial-link text-background inline-flex items-center gap-3 group/cta touch-target py-2"
            >
              Enter the Drop
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>

            {/* Secondary CTA */}
            <Link
              to="/about/our-story"
              className="text-[10px] font-light tracking-[0.2em] uppercase text-muted-foreground hover:text-background transition-colors duration-300 touch-target-sm py-2"
            >
              Read Our Story
            </Link>
          </motion.div>

          {/* Right - Drop Badge Cluster */}
          <div className="md:text-right">
            <DropBadgeCluster 
              dropNumber="001"
              collectionName="Stay Holy Collection"
              limitedPieces={250}
              isLive={true}
              delay={1.6}
            />
          </div>
        </div>
      </motion.div>

      {/* Product Tag - Editorial Float */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute bottom-24 right-8 z-20 bg-white/95 backdrop-blur-sm px-5 py-4 hidden lg:block"
      >
        <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-1">
          Featured
        </p>
        <p className="text-sm font-medium text-stone-950">Stay Holy Hoodie</p>
        <p className="text-sm font-light text-stone-700">{formatPrice(79)}</p>
      </motion.div>

      {/* Scroll Invitation - positioned above safe area on mobile */}
      <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-20">
        <ScrollInvitation delay={2.2} />
      </div>
    </section>
  );
};

export default EditorialHero;