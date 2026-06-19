import { motion, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Set to false to restore the full impact map when stats are ready
const COMING_SOON = true;

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
  isInView: boolean;
}

const AnimatedCounter = ({ value, suffix = '', label, delay = 0, isInView }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const timeout = setTimeout(() => {
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [value, delay, hasAnimated, isInView]);

  return (
    <div className="text-center">
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: delay / 1000 }}
        className="text-[80px] md:text-[100px] lg:text-[140px] font-light text-white leading-none tracking-tighter"
      >
        {count}
        <span className="text-white">{suffix}</span>
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, delay: delay / 1000 + 0.3 }}
        className="text-[10px] uppercase tracking-[0.3em] text-white/50 mt-2"
      >
        {label}
      </motion.p>
    </div>
  );
};

const ImpactMap = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const cities = [
    'Calgary', 'Toronto', 'Vancouver', 'Los Angeles', 'Dallas',
    'Atlanta', 'Houston', 'Phoenix', 'Denver', 'Seattle',
    'Chicago', 'Miami', 'New York', 'Austin', 'Portland'
  ];

  const cityPositions = [
    { top: '25%', left: '18%' },
    { top: '35%', left: '78%' },
    { top: '22%', left: '12%' },
    { top: '55%', left: '15%' },
    { top: '62%', left: '45%' },
    { top: '58%', left: '72%' },
    { top: '68%', left: '42%' },
    { top: '58%', left: '25%' },
    { top: '42%', left: '32%' },
    { top: '28%', left: '10%' },
    { top: '38%', left: '55%' },
    { top: '72%', left: '78%' },
    { top: '40%', left: '85%' },
    { top: '65%', left: '38%' },
    { top: '32%', left: '8%' },
  ];

  if (COMING_SOON) {
    return (
      <section ref={sectionRef} className="relative py-24 md:py-32 bg-stone-950 overflow-hidden flex items-center justify-center">
        <p className="text-white/40 font-light tracking-[0.3em] text-sm uppercase">
          Outreach: Coming soon...
        </p>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-stone-950 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.02 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 left-8 text-[20vw] font-light text-white leading-none select-none pointer-events-none z-0"
      >
        06
      </motion.span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-white mb-4">
            Outreach
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight">
            The Mission<br />
            <span className="text-white/40">Spreads</span>
          </h2>
        </motion.div>

        <div className="flex items-center justify-center py-8 mb-24">
          <p className="text-sm text-white/40 font-light tracking-wide">
            Coming soon...
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative h-48 md:h-72 lg:h-80 mb-12"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full h-full opacity-10" fill="currentColor">
              <path
                d="M50 60 Q80 40 120 50 Q140 35 180 45 Q220 40 260 55 Q300 50 340 70 Q350 90 340 120 Q320 140 280 150 Q240 155 200 145 Q160 150 120 140 Q80 145 50 130 Q30 110 50 60"
                className="text-white"
              />
            </svg>
          </div>

          <div className="absolute inset-0">
            {cityPositions.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                className="absolute"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="w-2 h-2 bg-white/60 rounded-full" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="overflow-hidden"
        >
          <div className="flex gap-8 animate-[marquee_30s_linear_infinite]">
            {[...cities, ...cities].map((city, i) => (
              <span
                key={i}
                className="text-sm text-white/30 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-8"
              >
                {city}
                <span className="w-1 h-1 bg-white/30 rounded-full" />
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default ImpactMap;
