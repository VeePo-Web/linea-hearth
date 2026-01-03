import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { value: 10, suffix: "K+", label: "Believers Armed" },
  { value: 45, suffix: "", label: "Cities Deployed" },
  { value: 5, suffix: "", label: "Countries Strong" },
];

const testimonials = [
  "Wearing my armor everywhere I go. — Marcus, Atlanta",
  "They ask about my shirt. I tell them about my King. — Aaliyah, Toronto",
  "Finally, faith fashion that feels like a weapon. — Devon, Calgary",
  "Not just clothes. A declaration. — Sarah, Houston",
  "The lion walks with me now. — James, London",
  "Suited up and ready for battle. — Priya, Vancouver",
];

interface CountUpNumberProps {
  target: number;
  suffix: string;
  isInView: boolean;
}

const CountUpNumber = ({ target, suffix, isInView }: CountUpNumberProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0);
    }
    return num.toString();
  };

  return (
    <span>
      {target >= 1000 ? formatNumber(count * 1000) : count}
      {suffix}
    </span>
  );
};

const StoryCommunityStats = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone-950 text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        className="absolute top-8 right-8 text-[10px] tracking-[0.4em] text-white/20 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        04
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <div className="text-center mb-20 md:mb-32">
          <motion.p
            className="text-[10px] tracking-[0.4em] text-amber-500 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            THE FORCES
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            The Movement Grows<span className="text-amber-500">.</span>
          </motion.h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 mb-24 md:mb-32">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
            >
              <span className="block text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-2">
                <CountUpNumber
                  target={stat.value}
                  suffix={stat.suffix}
                  isInView={isInView}
                />
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.2em] text-white/40 uppercase">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Testimonial marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-950 to-transparent z-10" />

          <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: [0, -1500] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <span
                key={index}
                className="text-lg md:text-xl font-light text-white/30 italic"
              >
                "{testimonial}"
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StoryCommunityStats;
