import { useState } from "react";
import { Star } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { useIsMobile } from "@/hooks/use-mobile";

interface Review {
  quote: string;
  name: string;
  rating: number;
}

const MarqueeStrip = () => {
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

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
    <ScrollReveal variant="fadeIn" threshold={0.5}>
      <section 
        className="w-full py-5 md:py-6 bg-background overflow-hidden"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative">
          {/* Marquee Container - Slower on mobile for readability */}
          <div 
            className="flex whitespace-nowrap"
            style={{
              animation: `marquee ${isMobile ? '45s' : '30s'} linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {duplicatedReviews.map((review, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 mx-6 md:mx-8"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {renderStars(review.rating)}
                </div>
                
                {/* Quote - slightly larger on mobile for WCAG */}
                <span className="text-sm md:text-sm text-foreground font-light">
                  "{review.quote}"
                </span>
                
                {/* Separator */}
                <span className="text-foreground/30">—</span>
                
                {/* Name */}
                <span className="text-sm md:text-sm text-foreground/60 font-light">
                  {review.name}
                </span>
                
                {/* Dot separator */}
                <span className="text-foreground/20 mx-3 md:mx-4">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};

export default MarqueeStrip;