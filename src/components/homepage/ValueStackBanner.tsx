import { useEffect, useRef, useState } from "react";
import { CURRENCY } from "@/lib/currency";

const ValueStackBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`w-full py-4 bg-muted border-y border-border transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-4 md:gap-8 text-center">
          <span className="text-caption text-muted-foreground uppercase">Free Shipping ${CURRENCY.freeShippingThreshold}+</span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-caption text-muted-foreground uppercase">30-Day Returns</span>
          <span className="text-muted-foreground/30 hidden md:inline">•</span>
          <span className="text-caption text-muted-foreground uppercase hidden md:inline">Premium Quality</span>
        </div>
      </div>
    </section>
  );
};

export default ValueStackBanner;