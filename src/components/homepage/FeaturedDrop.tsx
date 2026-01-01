import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedDrop = () => {
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
      className="relative w-full min-h-[90vh] bg-foreground overflow-hidden"
    >
      {/* Full-bleed Background Image */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      >
        <img 
          src="/products/heavenly-crewneck/lifestyle.png"
          alt="Heavenly Crewneck"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/50 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="max-w-xl">
            {/* Drop Badge */}
            <div 
              className={`inline-flex items-center gap-2 mb-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider uppercase px-3 py-1">
                New Drop
              </span>
              <span className="text-caption text-background/60 uppercase">
                Limited Edition
              </span>
            </div>

            {/* Product Name - Editorial oversized */}
            <h2 
              className={`text-display-sm text-background mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              HEAVENLY
              <br />
              CREWNECK
            </h2>

            {/* Description */}
            <p 
              className={`text-editorial text-background/70 mb-8 max-w-md transition-all duration-700 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              Premium heavyweight cotton. Oversized fit. A statement piece for the bold believer.
            </p>

            {/* Price & CTA */}
            <div 
              className={`flex items-center gap-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <span className="text-2xl font-light text-background">$65</span>
              <Link 
                to="/product/heavenly-crewneck"
                className="inline-flex items-center gap-3 text-background text-sm font-medium tracking-wide hover:text-accent transition-colors group"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Index - 032c style */}
      <div 
        className={`absolute bottom-8 right-8 text-background/30 text-[120px] md:text-[200px] font-light leading-none transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '500ms' }}
      >
        01
      </div>
    </section>
  );
};

export default FeaturedDrop;