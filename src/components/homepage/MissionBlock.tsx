import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const MissionBlock = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-[70vh] overflow-hidden"
    >
      {/* Full-bleed Background Image */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      >
        <img 
          src="/products/stay-holy-hoodie/female-model-1.png"
          alt="Line of Judah Community"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      {/* Content Overlay - Magazine ad style */}
      <div className="relative z-10 min-h-[70vh] flex items-center justify-center px-6">
        <div 
          className={`bg-background p-8 md:p-12 lg:p-16 max-w-2xl text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Eyebrow */}
          <p className="text-eyebrow text-accent mb-6">Our Mission</p>

          {/* Headline */}
          <h2 className="text-hero text-foreground mb-6">
            MORE THAN
            <br />
            CLOTHING.
          </h2>

          {/* Quote */}
          <p className="text-editorial text-muted-foreground mb-8 max-w-md mx-auto">
            A movement of believers wearing their faith boldly. Every piece designed with intention, rooted in Scripture.
          </p>

          {/* CTA */}
          <Link 
            to="/about/our-story"
            className="inline-flex items-center gap-2 text-foreground text-sm font-medium tracking-wide hover:text-accent transition-colors group"
          >
            Our Story
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MissionBlock;