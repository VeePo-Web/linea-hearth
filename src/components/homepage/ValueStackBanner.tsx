import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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
    <Link to="/shipping">
      <section 
        ref={sectionRef}
        className={`w-full py-3 md:py-4 bg-muted border-y border-border transition-opacity duration-700 group ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 xs:px-6">
          <div className="flex items-center justify-center gap-2 xs:gap-3 md:gap-8 text-center">
            <span className="text-[9px] xs:text-[10px] md:text-caption text-muted-foreground uppercase whitespace-nowrap">
              Free Shipping ${CURRENCY.freeShippingThreshold}+
            </span>
            <span className="text-muted-foreground/30 hidden xs:inline">•</span>
            <span className="text-[9px] xs:text-[10px] md:text-caption text-muted-foreground uppercase whitespace-nowrap">
              30-Day Returns
            </span>
            <span className="text-muted-foreground/30 hidden md:inline">•</span>
            <span className="text-[9px] xs:text-[10px] md:text-caption text-muted-foreground uppercase whitespace-nowrap hidden md:inline">
              Premium Quality
            </span>
            {/* Mobile chevron indicator */}
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors md:hidden" />
          </div>
        </div>
      </section>
    </Link>
  );
};

export default ValueStackBanner;