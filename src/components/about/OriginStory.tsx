import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const OriginStory = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-stone-950 text-white overflow-hidden py-24 md:py-32"
    >
      {/* JUDAH watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        style={{ y: parallaxY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span className="text-[30vw] md:text-[25vw] font-light text-white tracking-tighter whitespace-nowrap">
          JUDAH
        </span>
      </motion.div>

      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-8 left-8 text-[20vw] font-light text-white leading-none select-none pointer-events-none z-0"
      >
        03
      </motion.span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Lion imagery */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative order-2 lg:order-1"
          >
            <div className="aspect-square relative overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-stone-900 to-stone-950" />
              
              {/* Premium lion silhouette */}
              <svg 
                viewBox="0 0 200 200" 
                className="absolute inset-0 w-full h-full p-8 md:p-12"
                fill="none"
              >
                {/* Stylized lion head */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  d="M100 20 C60 20 30 50 30 90 C30 110 40 125 40 140 C30 150 20 165 20 180 C20 195 35 200 55 200 L145 200 C165 200 180 195 180 180 C180 165 170 150 160 140 C160 125 170 110 170 90 C170 50 140 20 100 20"
                  stroke="url(#lionGradient)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                />
                {/* Eyes */}
                <motion.circle
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2 }}
                  cx="70" cy="90" r="8"
                  className="fill-amber-500/60"
                />
                <motion.circle
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2.1 }}
                  cx="130" cy="90" r="8"
                  className="fill-amber-500/60"
                />
                {/* Nose */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
                  d="M100 120 L90 135 L100 145 L110 135 Z"
                  className="fill-amber-500/40"
                />
                <defs>
                  <linearGradient id="lionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent opacity-50" />
            </div>

            {/* Corner accents */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-amber-500/30" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-amber-500/30" />
          </motion.div>

          {/* Right: Story content */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[10px] uppercase tracking-[0.4em] text-amber-500"
            >
              The Name
            </motion.p>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight"
            >
              Line of
              <span className="block text-amber-500">Judah</span>
            </motion.h2>

            {/* Body */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6 text-white/70 font-light leading-relaxed text-lg"
            >
              <p>
                <span className="text-amber-500 font-medium">Judah</span> means "praise." 
                The lion is the symbol of the tribe of Judah — from which the Messiah descended. 
                Genesis 49:9 declares:
              </p>
              <p className="text-xl text-white/90 italic">
                "Judah is a lion's cub... like a lion he crouches and lies down."
              </p>
              <p>
                Line of Judah is a declaration of identity. When you wear it, you're 
                not just wearing a brand — you're wearing your lineage as a child of
                the King.
              </p>
            </motion.div>

            {/* Scripture pull-quote */}
            <motion.blockquote
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="relative pl-8 border-l-4 border-amber-500"
            >
              <p className="text-2xl md:text-3xl font-light text-amber-500 italic leading-relaxed">
                "The Lion of the tribe of Judah has triumphed."
              </p>
              <cite className="text-sm text-white/50 not-italic mt-4 block uppercase tracking-[0.2em]">
                — Revelation 5:5
              </cite>
            </motion.blockquote>

            {/* Bottom line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-white font-light text-xl"
            >
              You carry the roar of the Lion within you.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OriginStory;
