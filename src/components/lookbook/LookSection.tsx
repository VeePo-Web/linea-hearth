import { useEffect, useRef, useState } from "react";
import ShopTheLook from "./ShopTheLook";

interface LookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface Look {
  id: string;
  name: string;
  headline: string;
  scripture_reference: string | null;
  description: string | null;
  image_url: string;
  video_url: string | null;
  gender: string;
  products: LookProduct[];
}

interface LookSectionProps {
  look: Look;
  index: number;
}

const LookSection = ({ look, index }: LookSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Alternate layout for visual interest
  const isReversed = index % 2 === 1;

  return (
    <section
      ref={sectionRef}
      data-look-index={index}
      className="h-screen w-full snap-start relative flex flex-col lg:flex-row"
    >
      {/* Image Side */}
      <div 
        className={`w-full lg:w-3/5 h-[50vh] lg:h-full relative overflow-hidden ${
          isReversed ? 'lg:order-2' : ''
        }`}
      >
        <img
          src={look.image_url}
          alt={look.name}
          className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${
            isVisible ? 'scale-105' : 'scale-100'
          }`}
          style={{
            transformOrigin: isReversed ? 'right center' : 'left center'
          }}
        />
        
        {/* Gradient overlay */}
        <div 
          className={`absolute inset-0 ${
            isReversed 
              ? 'bg-gradient-to-l from-stone-900/80 via-stone-900/20 to-transparent lg:bg-gradient-to-l' 
              : 'bg-gradient-to-r from-transparent via-stone-900/20 to-stone-900/80 lg:bg-gradient-to-r'
          } lg:from-transparent lg:via-transparent lg:to-stone-900`}
        />

        {/* Mobile gradient for content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent lg:hidden" />
      </div>

      {/* Content Side */}
      <div 
        className={`w-full lg:w-2/5 h-[50vh] lg:h-full flex items-center justify-center bg-stone-900 px-6 lg:px-12 py-8 ${
          isReversed ? 'lg:order-1' : ''
        }`}
      >
        <div 
          className={`max-w-md transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Scripture Reference */}
          {look.scripture_reference && (
            <p className="text-xs uppercase tracking-[0.25em] text-amber-500 mb-4 font-light">
              {look.scripture_reference}
            </p>
          )}

          {/* Headline (Faith Statement) */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extralight italic text-white mb-3 leading-tight">
            "{look.headline}"
          </h2>

          {/* Look Name */}
          <h3 className="text-lg md:text-xl font-light text-white/80 mb-4">
            {look.name}
          </h3>

          {/* Description */}
          {look.description && (
            <p className="text-sm text-white/60 font-light leading-relaxed mb-8">
              {look.description}
            </p>
          )}

          {/* Shop the Look */}
          <ShopTheLook products={look.products} lookName={look.name} />
        </div>
      </div>
    </section>
  );
};

export default LookSection;
