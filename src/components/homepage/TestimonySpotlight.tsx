import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="w-full py-16 md:py-24 bg-stone-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Video/Image Block */}
          <div 
            className={`relative transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="aspect-[4/3] overflow-hidden relative group cursor-pointer">
              <img 
                src="/products/stay-holy-hoodie/female-model-1.png"
                alt="Customer wearing Stay Holy Hoodie"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/40">
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-8 h-8 text-stone-900 ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4">
                <p className="text-stone-900 text-sm font-medium">Watch: Marcus shares how Line of Judah changed his daily witness</p>
              </div>
            </div>
          </div>

          {/* Quote Block */}
          <div 
            className={`transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Quote Icon */}
            <div className="mb-6">
              <svg 
                className="w-12 h-12 text-amber-500/40"
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>

            {/* Featured Quote */}
            <blockquote className="text-foreground text-2xl md:text-3xl font-light leading-relaxed mb-8">
              "People stop me all the time to ask about my hoodie. It's not just a conversation starter—it's an opportunity to share my faith. 
              <span className="text-amber-600"> Line of Judah made me a walking testimony.</span>"
            </blockquote>

            {/* Customer Info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img 
                  src="/products/stay-holy-hoodie/female-model-2.png"
                  alt="Marcus T."
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-foreground font-medium">Marcus T.</p>
                <p className="text-muted-foreground text-sm">Youth Pastor • Atlanta, GA</p>
              </div>
            </div>

            {/* CTA */}
            <Link 
              to="/about/our-story"
              className="text-foreground text-sm font-light flex items-center gap-2 hover:text-amber-600 transition-colors group"
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
