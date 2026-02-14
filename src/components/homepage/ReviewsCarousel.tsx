import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  customer_name: string;
  customer_location?: string;
  rating: number;
  review_text: string;
  verified: boolean;
}

const ReviewsCarousel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      customer_name: 'Marcus T.',
      customer_location: 'Atlanta, GA',
      rating: 5,
      review_text: "The quality is incredible. I get compliments every time I wear my hoodie, and it's opened up so many conversations about faith.",
      verified: true
    },
    {
      id: '2',
      customer_name: 'Sarah M.',
      customer_location: 'Dallas, TX',
      rating: 5,
      review_text: "Finally, a Christian brand that doesn't compromise on style. These pieces are modern, built to last, and make a bold statement.",
      verified: true
    },
    {
      id: '3',
      customer_name: 'David K.',
      customer_location: 'Los Angeles, CA',
      rating: 5,
      review_text: "Line of Judah gets it. Premium quality, meaningful designs, and a brand that actually cares about the community. I'm a customer for life.",
      verified: true
    },
    {
      id: '4',
      customer_name: 'Michelle R.',
      customer_location: 'Chicago, IL',
      rating: 5,
      review_text: "I bought matching pieces for my whole youth group. The kids love them and wear them with pride. Thank you for creating something special.",
      verified: true
    },
    {
      id: '5',
      customer_name: 'James L.',
      customer_location: 'Houston, TX',
      rating: 5,
      review_text: "The attention to detail is unmatched. From the packaging to the fabric quality, everything screams premium. Worth every penny.",
      verified: true
    },
    {
      id: '6',
      customer_name: 'Priscilla W.',
      customer_location: 'Miami, FL',
      rating: 5,
      review_text: "This isn't just clothing, it's armor. I feel empowered wearing my faith on my sleeve—literally. The designs are fire!",
      verified: true
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
      />
    ));
  };

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-stone-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-amber-500 text-xs tracking-[0.2em] uppercase mb-2">
            Testimonials
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-light">
            What Our Community Says
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Reviews Container */}
          <div 
            className={`overflow-hidden transition-all duration-700 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => (
                <div 
                  key={review.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="max-w-2xl mx-auto text-center">
                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-6">
                      {renderStars(review.rating)}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-white text-xl md:text-2xl font-light leading-relaxed mb-8">
                      "{review.review_text}"
                    </blockquote>

                    {/* Customer Info */}
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-white font-medium">{review.customer_name}</span>
                      {review.customer_location && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="text-white/60 font-light">{review.customer_location}</span>
                        </>
                      )}
                      {review.verified && (
                        <>
                          <span className="text-white/30">•</span>
                          <span className="text-amber-500 text-sm font-light">Verified Buyer</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10 rounded-full hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10 rounded-full hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-amber-500 w-6' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
