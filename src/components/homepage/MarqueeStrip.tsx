import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

interface Review {
  quote: string;
  name: string;
  rating: number;
}

const MarqueeStrip = () => {
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

  const reviews: Review[] = [
    { quote: "Finally, a brand that gets it.", name: "Marcus T.", rating: 5 },
    { quote: "The quality is insane.", name: "Sarah M.", rating: 5 },
    { quote: "Premium quality, meaningful designs.", name: "David K.", rating: 5 },
    { quote: "My whole youth group loves them.", name: "Michelle R.", rating: 5 },
    { quote: "Worth every penny.", name: "James L.", rating: 5 },
    { quote: "This isn't just clothing, it's armor.", name: "Priscilla W.", rating: 5 },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-accent text-accent" />
    ));
  };

  // Duplicate for seamless loop
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section 
      ref={sectionRef}
      className={`w-full py-6 bg-foreground overflow-hidden transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative">
        {/* Marquee Container */}
        <div className="flex animate-marquee whitespace-nowrap">
          {duplicatedReviews.map((review, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 mx-8"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {renderStars(review.rating)}
              </div>
              
              {/* Quote */}
              <span className="text-sm text-background font-light">
                "{review.quote}"
              </span>
              
              {/* Separator */}
              <span className="text-background/30">—</span>
              
              {/* Name */}
              <span className="text-sm text-background/60 font-light">
                {review.name}
              </span>
              
              {/* Dot separator */}
              <span className="text-background/20 mx-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarqueeStrip;