import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Category {
  name: string;
  slug: string;
  image: string;
  featured?: boolean;
}

const CategoryTiles = () => {
  const prefersReducedMotion = useReducedMotion();

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

  const tileVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Minimal */}
        <ScrollReveal variant="fadeUp">
          <div className="mb-8">
            <p className="text-eyebrow text-muted-foreground">Shop by Category</p>
          </div>
        </ScrollReveal>

        {/* Asymmetric Grid - 032c style */}
        <StaggerContainer className="grid grid-cols-12 gap-2" staggerDelay={0.1}>
          {/* Featured Large Tile */}
          <motion.div
            className="col-span-12 md:col-span-7"
            whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link
              to={`/category/${categories[0].slug}`}
              className="block relative aspect-[4/5] md:aspect-[4/3] overflow-hidden group"
            >
              <motion.img 
                src={categories[0].image}
                alt={categories[0].name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-foreground/20 group-hover:bg-transparent transition-colors duration-500" />
              
              {/* Category Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-end justify-between">
                  <h3 className="text-hero text-background uppercase">{categories[0].name}</h3>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowUpRight className="w-6 h-6 text-background" />
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Stacked Right Tiles */}
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-2">
            {categories.slice(1, 3).map((category) => (
              <motion.div
                key={category.slug}
                variants={tileVariants}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="block relative aspect-square md:aspect-[16/9] overflow-hidden group"
                >
                  <motion.img 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-foreground/20 group-hover:bg-transparent transition-colors duration-500" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <div className="flex items-end justify-between">
                      <h3 className="text-section text-background uppercase">{category.name}</h3>
                      <ArrowUpRight className="w-5 h-5 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom Full-Width Tile */}
          <motion.div
            className="col-span-12"
            variants={tileVariants}
            whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link
              to={`/category/${categories[3].slug}`}
              className="block relative aspect-[21/9] overflow-hidden group"
            >
              <motion.img 
                src={categories[3].image}
                alt={categories[3].name}
                className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-foreground/20 group-hover:bg-transparent transition-colors duration-500" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-end justify-between">
                  <h3 className="text-hero text-background uppercase">{categories[3].name}</h3>
                  <ArrowUpRight className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </motion.div>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default CategoryTiles;
