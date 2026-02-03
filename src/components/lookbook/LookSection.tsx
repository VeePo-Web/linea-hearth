import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import ShopTheLook from "./ShopTheLook";
import TextReveal from "@/components/motion/TextReveal";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { easing, timing } from "@/lib/animations";

interface LookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface Look {
  id: string;
  name: string;
  headline: string;
  scripture_reference: string | null;
  description: string | null;
  image_url: string;
  video_url: string | null;
  gender: string;
  products: LookProduct[];
}

interface LookSectionProps {
  look: Look;
  index: number;
}

const LookSection = ({ look, index }: LookSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  // Alternate layout for visual interest
  const isReversed = index % 2 === 1;
  
  // Format index as 01, 02, 03, etc.
  const lookIndex = String(index + 1).padStart(2, '0');
  
  // Gender badge label
  const genderLabel = look.gender === 'male' ? "MEN'S" : look.gender === 'female' ? "WOMEN'S" : "UNISEX";

  // Image reveal direction based on layout
  const imageClipPath = {
    hidden: isReversed ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
    visible: "inset(0% 0% 0% 0%)"
  };

  return (
    <section
      ref={sectionRef}
      data-look-index={index}
      className="lookbook-section-height w-full snap-start relative flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Oversized Look Index - Background Element */}
      <motion.div
        className={`absolute ${isReversed ? 'left-8' : 'right-8'} top-1/2 -translate-y-1/2 pointer-events-none z-0 hidden lg:block`}
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 0.03, scale: 1 } : {}}
        transition={{ duration: timing.cinematic, ease: easing.editorial, delay: 0.2 }}
      >
        <span 
          className="text-[20rem] font-extralight text-white leading-none select-none"
          style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.05em' }}
        >
          {lookIndex}
        </span>
      </motion.div>

      {/* Image Side */}
      <div 
        className={`w-full lg:w-3/5 lookbook-half-height lg:h-full relative overflow-hidden ${
          isReversed ? 'lg:order-2' : ''
        }`}
      >
        {/* Image with mask reveal */}
        <motion.div
          className="w-full h-full"
          initial={prefersReducedMotion ? {} : { clipPath: imageClipPath.hidden }}
          animate={isInView ? { clipPath: imageClipPath.visible } : {}}
          transition={{ duration: timing.cinematic, ease: easing.editorial }}
        >
          <motion.img
            src={look.image_url}
            alt={look.name}
            className="w-full h-full object-cover"
            initial={prefersReducedMotion ? {} : { scale: 1.15 }}
            animate={isInView ? { scale: 1.02 } : {}}
            transition={{ 
              duration: timing.cinematic * 1.5, 
              ease: easing.editorial 
            }}
            style={{
              transformOrigin: isReversed ? 'right center' : 'left center'
            }}
          />
        </motion.div>
        
        {/* Gradient overlay */}
        <div 
          className={`absolute inset-0 ${
            isReversed 
              ? 'bg-gradient-to-l from-stone-900/80 via-stone-900/20 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-stone-900/20 to-stone-900/80'
          }`}
        />

        {/* Mobile gradient for content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent lg:hidden" />

        {/* Look Index Badge - Mobile */}
        <motion.div
          className="absolute top-4 left-4 lg:hidden"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.3 }}
        >
          <span className="text-5xl md:text-4xl font-extralight text-white/25">
            {lookIndex}
          </span>
        </motion.div>
      </div>

      {/* Content Side */}
      <div 
        className={`w-full lg:w-2/5 lookbook-half-height lg:h-full flex items-center justify-center bg-stone-900 px-4 md:px-6 lg:px-12 py-6 md:py-8 pb-safe relative z-10 ${
          isReversed ? 'lg:order-1' : ''
        }`}
      >
        <div className="max-w-md w-full">
          {/* Gender Badge */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.4 }}
            className="mb-4"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-light border border-white/10 px-3 py-1 rounded-full">
              {genderLabel}
            </span>
          </motion.div>

          {/* Scripture Reference */}
          {look.scripture_reference && (
            <motion.p 
              className="text-sm md:text-xs uppercase tracking-[0.25em] text-amber-500 mb-4 font-light"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.5 }}
            >
              {look.scripture_reference}
            </motion.p>
          )}

          {/* Headline (Faith Statement) - Word by Word */}
          <div className="mb-3">
            <TextReveal 
              text={`"${look.headline}"`}
              as="h2"
              className="text-xl xs:text-2xl md:text-3xl lg:text-4xl font-extralight italic text-white leading-tight"
              delay={0.6}
            />
          </div>

          {/* Look Name */}
          <motion.h3 
            className="text-lg md:text-xl font-light text-white/80 mb-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.8 }}
          >
            {look.name}
          </motion.h3>

          {/* Description */}
          {look.description && (
            <motion.p 
              className="text-sm text-white/60 font-light leading-relaxed mb-6 md:mb-8 line-clamp-3 md:line-clamp-none"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.9 }}
            >
              {look.description}
            </motion.p>
          )}

          {/* Shop the Look */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 1.0 }}
          >
            <ShopTheLook products={look.products} lookName={look.name} lookId={look.id} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LookSection;
