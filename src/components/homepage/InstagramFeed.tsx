import { useEffect, useRef, useState } from "react";
import { Instagram, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  comments: number;
  link: string;
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

  // Mock Instagram posts - replace with actual API integration
  const posts: InstagramPost[] = [
    {
      id: '1',
      image: '/products/stay-holy-hoodie/flat-front.png',
      likes: 234,
      comments: 12,
      link: 'https://instagram.com/lineofjudahwear'
    },
    {
      id: '2',
      image: '/products/heavenly-crewneck/flat-lay.png',
      likes: 567,
      comments: 34,
      link: 'https://instagram.com/lineofjudahwear'
    },
    {
      id: '3',
      image: '/products/stay-holy-hoodie/female-model-1.png',
      likes: 189,
      comments: 8,
      link: 'https://instagram.com/lineofjudahwear'
    },
    {
      id: '4',
      image: '/products/heavenly-crewneck/front-model.png',
      likes: 423,
      comments: 21,
      link: 'https://instagram.com/lineofjudahwear'
    },
    {
      id: '5',
      image: '/products/stay-holy-hoodie/male-model.png',
      likes: 312,
      comments: 15,
      link: 'https://instagram.com/lineofjudahwear'
    },
    {
      id: '6',
      image: '/products/heavenly-crewneck/female-model.png',
      likes: 678,
      comments: 42,
      link: 'https://instagram.com/lineofjudahwear'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div 
          className={`text-center mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Instagram className="w-5 h-5 text-amber-600" />
            <p className="text-amber-600 text-xs tracking-[0.2em] uppercase">
              Join the Movement
            </p>
          </div>
          <h2 className="text-foreground text-3xl md:text-4xl font-light">
            @lineofjudahwear
          </h2>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-10">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square overflow-hidden transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" fill="white" />
                    <span className="font-light">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" fill="white" />
                    <span className="font-light">{post.comments}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div 
          className={`text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background rounded-none px-8"
          >
            <a 
              href="https://instagram.com/lineofjudahwear" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Follow Us on Instagram
            </a>
          </Button>
          <p className="text-muted-foreground text-sm font-light mt-4">
            Tag us in your photos for a chance to be featured
          </p>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
