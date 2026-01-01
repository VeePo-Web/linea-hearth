import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import TextReveal from "@/components/motion/TextReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerItem } from "@/lib/animations";

interface Category {
  name: string;
  slug: string;
  subtitle: string;
  image: string;
  index: string;
  layout: "hero" | "standard" | "wide";
}

const CategoryTiles = () => {
  const prefersReducedMotion = useReducedMotion();

  const categories: Category[] = [
    {
      name: "Hoodies",
      slug: "hoodies",
      subtitle: "PREMIUM WEIGHT. BOLD STATEMENTS.",
      image: "/products/stay-holy-hoodie/male-model.png",
      index: "01",
      layout: "hero"
    },
    {
      name: "Tops",
      slug: "tops",
      subtitle: "ELEVATED ESSENTIALS.",
      image: "/products/heavenly-crewneck/front-model.png",
      index: "02",
      layout: "standard"
    },
    {
      name: "Tees",
      slug: "tees",
      subtitle: "START CONVERSATIONS.",
      image: "/products/heavenly-crewneck/female-model.png",
      index: "03",
      layout: "standard"
    },
    {
      name: "Accessories",
      slug: "accessories",
      subtitle: "FINISHING TOUCHES.",
      image: "/products/stay-holy-hoodie/female-model-2.png",
      index: "04",
      layout: "wide"
    }
  ];

  const heroCategory = categories.find(c => c.layout === "hero")!;
  const standardCategories = categories.filter(c => c.layout === "standard");
  const wideCategory = categories.find(c => c.layout === "wide")!;

  return (
    <section className="w-full py-24 md:py-40 bg-background relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Editorial Section Header - 032c Style */}
        <div className="mb-16 md:mb-24">
          <motion.span
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground block mb-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The
          </motion.span>
          <div className="overflow-hidden">
            <TextReveal 
              text="COLLECTION" 
              as="h2"
              className="text-[12vw] md:text-[8vw] lg:text-[6vw] font-extralight tracking-[-0.04em] text-foreground leading-[0.85]"
            />
          </div>
          {/* Editorial Divider */}
          <motion.div 
            className="w-24 h-px bg-foreground mt-8"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Asymmetric Bento Grid - Desktop */}
        <StaggerContainer 
          className="hidden md:grid grid-cols-2 gap-3" 
          staggerDelay={0.15}
        >
          {/* Hero Tile - Hoodies (spans 2 rows) */}
          <motion.div
            variants={staggerItem}
            className="row-span-2"
          >
            <CategoryTile category={heroCategory} prefersReducedMotion={prefersReducedMotion} />
          </motion.div>

          {/* Standard Tiles - Tops & Tees */}
          {standardCategories.map((category) => (
            <motion.div
              key={category.slug}
              variants={staggerItem}
            >
              <CategoryTile category={category} prefersReducedMotion={prefersReducedMotion} />
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Wide Tile - Accessories (full width) */}
        <motion.div
          className="hidden md:block mt-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <CategoryTile category={wideCategory} prefersReducedMotion={prefersReducedMotion} isWide />
        </motion.div>

        {/* Mobile Stacked Layout */}
        <StaggerContainer 
          className="md:hidden flex flex-col gap-3" 
          staggerDelay={0.1}
        >
          {categories.map((category) => (
            <motion.div
              key={category.slug}
              variants={staggerItem}
              style={{ 
                height: category.layout === "hero" ? "70vh" : 
                        category.layout === "wide" ? "40vh" : "50vh" 
              }}
            >
              <CategoryTile category={category} prefersReducedMotion={prefersReducedMotion} />
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

interface CategoryTileProps {
  category: Category;
  prefersReducedMotion: boolean;
  isWide?: boolean;
}

const CategoryTile = ({ category, prefersReducedMotion, isWide = false }: CategoryTileProps) => {
  const aspectClass = isWide 
    ? "aspect-[21/9]" 
    : category.layout === "hero" 
      ? "h-full min-h-[600px]" 
      : "aspect-[4/5]";

  const titleSize = isWide 
    ? "text-[10vw] md:text-[4vw]" 
    : category.layout === "hero" 
      ? "text-[18vw] md:text-[8vw]" 
      : "text-[15vw] md:text-[5vw]";

  const indexSize = isWide
    ? "text-[40px] md:text-[80px]"
    : category.layout === "hero"
      ? "text-[60px] md:text-[120px]"
      : "text-[50px] md:text-[100px]";

  return (
    <Link
      to={`/category/${category.slug}`}
      className={`group block relative ${aspectClass} overflow-hidden bg-muted`}
    >
      {/* Image with Grayscale → Color Transition */}
      <motion.div
        className="absolute inset-0"
        whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <img 
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700"
        />
      </motion.div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent group-hover:from-foreground/40 group-hover:via-foreground/10 transition-all duration-500" />

      {/* Hover Border Frame */}
      <div className="absolute inset-3 border border-background/0 group-hover:border-background/30 transition-all duration-500 pointer-events-none" />
      
      {/* Index Number - 032c Style */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex flex-col items-end">
        <span className={`${indexSize} font-extralight text-background/15 group-hover:text-background/25 transition-all duration-500 leading-none`}>
          {category.index}
        </span>
        <motion.div 
          className="w-6 md:w-8 h-px bg-background/20 group-hover:bg-background/40 mt-2 transition-all duration-500"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        {/* Category Name - Massive Typography */}
        <h3 className={`${titleSize} font-extralight text-background uppercase tracking-[-0.04em] leading-[0.85] group-hover:tracking-[-0.02em] transition-all duration-500`}>
          {category.name}
        </h3>
        
        {/* Subtitle - Appears on Hover */}
        <div className="overflow-hidden h-0 group-hover:h-6 transition-all duration-500 mt-2">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-background/70 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-100">
            {category.subtitle}
          </p>
        </div>

        {/* CTA - Editorial Underline Style */}
        <div className="mt-4 md:mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-background inline-flex items-center gap-2">
            Shop {category.name}
            <motion.span
              className="inline-block"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
            >
              →
            </motion.span>
          </span>
          <motion.div 
            className="h-px bg-background/60 mt-1 origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </Link>
  );
};

export default CategoryTiles;
