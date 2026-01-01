import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const EditorialHero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-foreground overflow-hidden">
      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Content - Text Block */}
        <div className="lg:col-span-5 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-24 lg:py-0 order-2 lg:order-1 bg-foreground">
          <div 
            className={`max-w-xl transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Eyebrow */}
            <p 
              className="text-eyebrow text-muted-foreground mb-6"
              style={{ transitionDelay: '200ms' }}
            >
              New Collection
            </p>

            {/* Main Headline - Oversized 032c style */}
            <h1 className="text-display text-background mb-8">
              WEAR
              <br />
              YOUR
              <br />
              <span className="text-accent">FAITH.</span>
            </h1>

            {/* Tagline */}
            <p 
              className={`text-editorial text-muted-foreground max-w-md mb-12 transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              Premium streetwear for the modern believer. Bold statements. Timeless purpose.
            </p>

            {/* CTA */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <Link 
                to="/category/shop"
                className="inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-sm font-medium tracking-wide hover:bg-accent hover:text-foreground transition-colors group"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Floating Badge - Hypebeast style */}
            <div 
              className={`mt-16 inline-flex items-center gap-2 transition-all duration-1000 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-caption text-muted-foreground uppercase">
                New Drop • Stay Holy Hoodie
              </span>
            </div>
          </div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="lg:col-span-7 relative order-1 lg:order-2 min-h-[60vh] lg:min-h-screen">
          <div 
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img 
              src="/products/stay-holy-hoodie/male-model.png"
              alt="Stay Holy Hoodie"
              className="w-full h-full object-cover object-top"
            />
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-foreground/20 lg:to-foreground/40" />
          </div>

          {/* Product Tag - Editorial style */}
          <div 
            className={`absolute bottom-8 right-8 bg-background px-4 py-3 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '1000ms' }}
          >
            <p className="text-caption text-muted-foreground uppercase mb-1">Featured</p>
            <p className="text-sm font-medium text-foreground">Stay Holy Hoodie</p>
            <p className="text-sm text-foreground">$79</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialHero;