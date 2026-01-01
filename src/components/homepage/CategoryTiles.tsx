import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface Category {
  name: string;
  slug: string;
  image: string;
  featured?: boolean;
}

const CategoryTiles = () => {
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

  const categories: Category[] = [
    {
      name: "Hoodies",
      slug: "hoodies",
      image: "/products/stay-holy-hoodie/flat-full.png",
      featured: true
    },
    {
      name: "Tops",
      slug: "tops",
      image: "/products/heavenly-crewneck/front-model.png"
    },
    {
      name: "Tees",
      slug: "tees",
      image: "/products/heavenly-crewneck/female-model.png"
    },
    {
      name: "Accessories",
      slug: "accessories",
      image: "/products/stay-holy-hoodie/female-model-2.png"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Minimal */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-eyebrow text-muted-foreground">Shop by Category</p>
        </div>

        {/* Asymmetric Grid - 032c style */}
        <div className="grid grid-cols-12 gap-2">
          {/* Featured Large Tile */}
          <Link
            to={`/category/${categories[0].slug}`}
            className={`col-span-12 md:col-span-7 relative aspect-[4/5] md:aspect-[4/3] overflow-hidden group transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <img 
              src={categories[0].image}
              alt={categories[0].name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-foreground/20 group-hover:bg-transparent transition-colors duration-500" />
            
            {/* Category Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-end justify-between">
                <h3 className="text-hero text-background uppercase">{categories[0].name}</h3>
                <ArrowUpRight className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          {/* Stacked Right Tiles */}
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-2">
            {categories.slice(1, 3).map((category, index) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className={`relative aspect-square md:aspect-[16/9] overflow-hidden group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <img 
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-transparent transition-colors duration-500" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="flex items-end justify-between">
                    <h3 className="text-section text-background uppercase">{category.name}</h3>
                    <ArrowUpRight className="w-5 h-5 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Full-Width Tile */}
          <Link
            to={`/category/${categories[3].slug}`}
            className={`col-span-12 relative aspect-[21/9] overflow-hidden group transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <img 
              src={categories[3].image}
              alt={categories[3].name}
              className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-foreground/20 group-hover:bg-transparent transition-colors duration-500" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-end justify-between">
                <h3 className="text-hero text-background uppercase">{categories[3].name}</h3>
                <ArrowUpRight className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryTiles;