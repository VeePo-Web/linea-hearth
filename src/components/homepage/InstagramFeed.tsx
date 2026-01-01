import { useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";

interface InstagramPost {
  id: string;
  image: string;
}

const InstagramFeed = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Mock Instagram posts
  const posts: InstagramPost[] = [
    { id: '1', image: '/products/stay-holy-hoodie/flat-front.png' },
    { id: '2', image: '/products/heavenly-crewneck/flat-lay.png' },
    { id: '3', image: '/products/stay-holy-hoodie/female-model-1.png' },
    { id: '4', image: '/products/heavenly-crewneck/front-model.png' },
    { id: '5', image: '/products/stay-holy-hoodie/male-model.png' },
    { id: '6', image: '/products/heavenly-crewneck/female-model.png' },
  ];

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Minimal */}
        <div 
          className={`flex items-center justify-between mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-foreground" />
            <span className="text-sm font-light text-foreground">@lineofjudahwear</span>
          </div>
          <a 
            href="https://instagram.com/lineofjudahwear" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-caption text-muted-foreground hover:text-foreground transition-colors uppercase"
          >
            Follow
          </a>
        </div>

        {/* Collage Grid - DAZED asymmetric offset style */}
        <div className="grid grid-cols-12 gap-2">
          {/* Large left image */}
          <a
            href="https://instagram.com/lineofjudahwear"
            target="_blank"
            rel="noopener noreferrer"
            className={`col-span-6 md:col-span-4 row-span-2 relative aspect-[3/4] overflow-hidden group transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <img 
              src={posts[0].image}
              alt="Instagram post"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>

          {/* Top right small images */}
          {posts.slice(1, 3).map((post, index) => (
            <a
              key={post.id}
              href="https://instagram.com/lineofjudahwear"
              target="_blank"
              rel="noopener noreferrer"
              className={`col-span-6 md:col-span-4 relative aspect-square overflow-hidden group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          ))}

          {/* Bottom images - offset */}
          {posts.slice(3, 6).map((post, index) => (
            <a
              key={post.id}
              href="https://instagram.com/lineofjudahwear"
              target="_blank"
              rel="noopener noreferrer"
              className={`col-span-4 relative aspect-square overflow-hidden group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              <img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          ))}
        </div>

        {/* Tag CTA */}
        <p 
          className={`text-center text-caption text-muted-foreground mt-8 transition-all duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          Tag us for a chance to be featured
        </p>
      </div>
    </section>
  );
};

export default InstagramFeed;