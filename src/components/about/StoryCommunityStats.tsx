import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { value: 10000, suffix: "+", label: "BELIEVERS" },
  { value: 45, suffix: "", label: "CITIES" },
  { value: 5, suffix: "", label: "COUNTRIES" }
];

const testimonials = [
  "\"Wearing my faith has never felt this good.\" — Marcus, Atlanta",
  "\"More than clothes. It's a conversation starter.\" — Aaliyah, Toronto",
  "\"Finally, streetwear that represents who I am.\" — Devon, Calgary",
  "\"My whole small group wears Line of Judah now.\" — Grace, LA",
  "\"The quality is unmatched. I rep this everywhere.\" — Isaiah, Houston"
];

const CountUpNumber = ({ target, suffix, isInView }: { target: number; suffix: string; isInView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, isInView]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
  };

  return (
    <span>
      {formatNumber(count)}{suffix}
    </span>
  );
};

const StoryCommunityStats = () => {
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
        04
      </motion.span>

      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20">
        <motion.p
          className="text-[10px] tracking-[0.4em] text-amber-500 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          THE TRIBE
        </motion.p>
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Growing Every Day<span className="text-amber-500">.</span>
        </motion.h2>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <div className="grid grid-cols-3 gap-8 md:gap-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
            >
              <div className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-stone-950 mb-4">
                <CountUpNumber target={stat.value} suffix={stat.suffix} isInView={isInView} />
              </div>
              <p className="text-[10px] md:text-xs tracking-[0.3em] text-stone-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonial marquee */}
      <div className="relative overflow-hidden border-y border-stone-200 py-6">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear"
            }
          }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <span 
              key={index}
              className="text-sm md:text-base font-light text-stone-500 flex items-center gap-16"
            >
              {testimonial}
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StoryCommunityStats;
