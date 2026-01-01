import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import TextReveal from "@/components/motion/TextReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerItem } from "@/lib/animations";

interface Category {
  name: string;
  slug: string;
  subtitle: string;
  image: string;
}

const CategoryTiles = () => {
  const prefersReducedMotion = useReducedMotion();

  const categories: Category[] = [
    {
      name: "Hoodies",
      slug: "hoodies",
      subtitle: "Premium comfort, bold faith",
      image: "/products/stay-holy-hoodie/flat-full.png"
    },
    {
      name: "Tops",
      slug: "tops",
      subtitle: "Elevated everyday essentials",
      image: "/products/heavenly-crewneck/front-model.png"
    },
    {
      name: "Tees",
      slug: "tees",
      subtitle: "Statements that start conversations",
      image: "/products/heavenly-crewneck/female-model.png"
    },
    {
      name: "Accessories",
      slug: "accessories",
      subtitle: "Finishing touches with purpose",
      image: "/products/stay-holy-hoodie/female-model-2.png"
    }
  ];

  return (
    <section className="w-full py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Editorial Section Header */}
        <div className="mb-12 md:mb-16">
          <div className="overflow-hidden">
            <TextReveal 
              text="SHOP BY" 
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground block"
            />
          </div>
          <div className="overflow-hidden">
            <TextReveal 
              text="CATEGORY" 
              as="span"
              className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground block"
              delay={0.15}
            />
          </div>
          {/* Editorial Divider */}
          <motion.div 
            className="w-16 h-px bg-foreground mt-8"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Balanced 2x2 Editorial Grid */}
        <StaggerContainer 
          className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4" 
          staggerDelay={0.1}
        >
          {categories.map((category) => (
            <motion.div
              key={category.slug}
              variants={staggerItem}
              whileHover={prefersReducedMotion ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group"
            >
              <Link
                to={`/category/${category.slug}`}
                className="block relative aspect-[3/4] md:aspect-[4/5] overflow-hidden"
              >
                {/* Image with Ken Burns Effect */}
                <motion.img 
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-foreground/25 group-hover:bg-foreground/10 transition-colors duration-500" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      {/* Category Name - Large Editorial */}
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-background uppercase tracking-tight">
                        {category.name}
                      </h3>
                      {/* Subtitle - Editorial Context */}
                      <p className="text-xs md:text-sm text-background/80 tracking-wide mt-1 md:mt-2 font-light">
                        {category.subtitle}
                      </p>
                    </div>
                    
                    {/* Arrow Icon - Slide In on Hover */}
                    <motion.div
                      className="opacity-0 group-hover:opacity-100"
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-background" />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default CategoryTiles;
