import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TestimonySpotlight = () => {
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
      className="w-full bg-muted"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        {/* Portrait Image - i-D style full-height */}
        <div 
          className={`relative min-h-[60vh] lg:min-h-full transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
        >
          <img 
            src="/products/stay-holy-hoodie/female-model-2.png"
            alt="Customer wearing Line of Judah"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Quote Block */}
        <div 
          className={`flex items-center p-8 md:p-12 lg:p-16 transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="max-w-lg">
            {/* Large Quote - No quote icon, just big text */}
            <blockquote className="text-hero text-foreground leading-tight mb-8">
              "People stop me all the time. It's not just a conversation starter—
              <span className="text-accent"> it's an opportunity to share my faith.</span>"
            </blockquote>

            {/* Customer Info - Minimal */}
            <div className="mb-8">
              <p className="text-sm font-medium text-foreground">Marcus T.</p>
              <p className="text-caption text-muted-foreground">Youth Pastor • Atlanta, GA</p>
            </div>

            {/* CTA */}
            <Link 
              to="/community"
              className="inline-flex items-center gap-2 text-foreground text-sm font-light hover:text-accent transition-colors group"
            >
              Read More Stories
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonySpotlight;