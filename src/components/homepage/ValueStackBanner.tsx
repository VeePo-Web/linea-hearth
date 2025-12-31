import { useEffect, useRef, useState } from "react";
import { Cross, Truck, RotateCcw, Shield } from "lucide-react";

interface ValueItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const values: ValueItem[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Faith-Forward Quality",
      description: "Premium materials crafted with purpose and integrity"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Free Shipping $75+",
      description: "Fast, reliable delivery on qualifying orders"
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: "Easy 30-Day Returns",
      description: "Hassle-free returns if you're not completely satisfied"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-stone-900 py-8 md:py-12"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {values.map((value, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Icon */}
              <div className="text-amber-500 mb-4">
                {value.icon}
              </div>

              {/* Title */}
              <h3 className="text-white text-sm font-medium tracking-wide uppercase mb-2">
                {value.title}
              </h3>

              {/* Description */}
              <p className="text-white/60 text-sm font-light max-w-xs">
                {value.description}
              </p>

              {/* Separator for mobile */}
              {index < values.length - 1 && (
                <div className="w-16 h-px bg-white/10 mt-8 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueStackBanner;
