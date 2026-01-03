import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Crown, Gem, Users } from "lucide-react";

const values = [
  {
    index: "01",
    icon: Crown,
    title: "PREMIUM QUALITY",
    description: "Every piece in our collection is crafted with intention. We use premium fabrics, heavyweight materials, and quality construction that's built to last. When you wear Line of Judah, you're wearing your faith in style.",
    highlight: "Your faith deserves the best."
  },
  {
    index: "02",
    icon: Gem,
    title: "PURPOSE-DRIVEN",
    description: "We believe fashion can be a ministry. Our designs spark conversations, encourage connection, and remind both the wearer and those around them of God's love. Each purchase supports our mission to spread faith through fashion.",
    highlight: "Fashion as ministry."
  },
  {
    index: "03",
    icon: Users,
    title: "COMMUNITY FIRST",
    description: "We're building more than a brand — we're building a community of believers. A tribe of people who aren't ashamed to rep their faith, who support each other, and who wear their convictions boldly.",
    highlight: "More than a brand. A movement."
  }
];

const StoryValuesGrid = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="relative bg-stone-950 text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Index watermark */}
      <motion.span 
        className="absolute top-8 right-8 text-[10px] tracking-[0.4em] text-white/20 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        03
      </motion.span>

      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <motion.p
          className="text-[10px] tracking-[0.4em] text-amber-500 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          THE PILLARS
        </motion.p>
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          What We Stand For<span className="text-amber-500">.</span>
        </motion.h2>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {values.map((value, index) => (
          <motion.div
            key={value.index}
            className={`relative py-16 md:py-24 border-t border-white/10 ${index === values.length - 1 ? 'border-b' : ''}`}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 + index * 0.15, duration: 0.8 }}
          >
            <div className={`grid md:grid-cols-12 gap-8 md:gap-12 items-start ${index % 2 === 1 ? 'md:text-right' : ''}`}>
              {/* Index */}
              <div className={`md:col-span-1 ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                <span className="text-[10px] tracking-[0.4em] text-white/20">{value.index}</span>
              </div>

              {/* Icon + Title */}
              <div className={`md:col-span-4 ${index % 2 === 1 ? 'md:order-3' : ''}`}>
                <value.icon className="w-12 h-12 text-amber-500 mb-6" strokeWidth={1} />
                <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
                  {value.title}
                </h3>
                <p className="text-sm text-amber-500/80 tracking-wide">
                  {value.highlight}
                </p>
              </div>

              {/* Description */}
              <div className={`md:col-span-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <p className="text-lg font-light text-white/60 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StoryValuesGrid;
