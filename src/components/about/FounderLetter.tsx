import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { fadeUp, slideInLeft, slideInRight } from '@/lib/animations';

const FounderLetter = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 right-8 text-[20vw] font-light text-foreground leading-none select-none pointer-events-none z-0"
      >
        02
      </motion.span>

      {/* Rotated vertical text */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10"
      >
        <span 
          className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Founder's Note — Jordan Williams
        </span>
      </motion.div>

      <div className="relative z-10 grid lg:grid-cols-2 min-h-screen">
        {/* Left: Full-bleed portrait */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative h-[50vh] lg:h-auto overflow-hidden"
        >
          <img
            src="/founders.png"
            alt="Jordan Williams, Founder of Line of Judah"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 lg:to-background hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden" />

          {/* Mobile caption */}
          <div className="absolute bottom-4 left-4 lg:hidden">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/80">
              Founder's Note
            </p>
          </div>
        </motion.div>

        {/* Right: Letter content */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex items-center px-6 md:px-12 lg:px-16 py-16 lg:py-0"
        >
          <div className="max-w-lg">
            {/* Giant quotation mark */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="block text-[120px] md:text-[160px] lg:text-[200px] font-serif text-amber-500/20 leading-none -mb-20 md:-mb-28 lg:-mb-36 select-none"
            >
              "
            </motion.span>

            {/* Quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative z-10"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-relaxed tracking-tight">
                I got tired of hiding.
              </p>
              <p className="text-lg md:text-xl font-light text-muted-foreground leading-relaxed mt-6">
                Not my faith — I never hid that. But I was tired of my clothes 
                not matching my conviction. Everything in the market was either 
                corny Christian or watered-down safe.
              </p>
              <p className="text-xl md:text-2xl font-light text-foreground leading-relaxed mt-6 italic">
                So I built what I wanted to wear.
              </p>
            </motion.blockquote>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-12"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-px bg-amber-500" />
                <p className="text-lg font-light text-foreground italic tracking-wide">
                  Jordan Williams
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2 ml-20">
                Founder & Creative Director
              </p>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-muted-foreground font-light leading-relaxed mt-10 border-l-2 border-amber-500/30 pl-6"
            >
              For the believer who won't apologize. Who starts conversations. 
              Who knows that if you're not for us, you're against us.
              <br /><br />
              <span className="text-foreground">This is Line of Judah.</span> You're here because you're supposed to be.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderLetter;
