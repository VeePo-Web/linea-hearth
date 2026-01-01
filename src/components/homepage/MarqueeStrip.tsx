import { Star } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";

interface Review {
  quote: string;
  name: string;
  rating: number;
}

const MarqueeStrip = () => {
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
      <section className="w-full py-6 bg-foreground overflow-hidden">
        <div className="relative">
          {/* Marquee Container - Keep CSS animation for performance */}
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
    </ScrollReveal>
  );
};

export default MarqueeStrip;
