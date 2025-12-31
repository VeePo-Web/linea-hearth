import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
      className="w-full py-16 md:py-24 bg-stone-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image */}
          <div 
            className={`order-2 lg:order-1 transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
                alt="Line of Judah - Faith Forward Fashion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div 
            className={`order-1 lg:order-2 transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Eyebrow */}
            <p className="text-amber-600 text-xs tracking-[0.2em] uppercase mb-6">
              Our Mission
            </p>

            {/* Headline */}
            <h2 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-6">
              More Than Clothing.
              <br />
              <span className="text-amber-600">A Movement.</span>
            </h2>

            {/* Body Copy */}
            <div className="space-y-4 text-muted-foreground font-light mb-8">
              <p>
                Line of Judah was born from a simple belief: your wardrobe should reflect 
                your values. We create premium apparel that empowers believers to boldly 
                express their faith in everyday life.
              </p>
              <p>
                Every piece is designed with intention, crafted with excellence, and 
                rooted in Scripture. When you wear Line of Judah, you're not just wearing 
                clothes — you're joining a community of believers committed to living 
                out their purpose.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
              <div>
                <p className="text-amber-600 text-2xl md:text-3xl font-light mb-1">10K+</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Community Members</p>
              </div>
              <div>
                <p className="text-amber-600 text-2xl md:text-3xl font-light mb-1">50+</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Unique Designs</p>
              </div>
              <div>
                <p className="text-amber-600 text-2xl md:text-3xl font-light mb-1">$25K</p>
                <p className="text-muted-foreground text-xs uppercase tracking-wider">Given Back</p>
              </div>
            </div>

            {/* CTA */}
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background rounded-none px-8 group"
            >
              <Link to="/about/our-story">
                Why Line of Judah
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionBlock;
