import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface InstagramPost {
  id: string;
  image: string;
}

const InstagramFeed = () => {
  const prefersReducedMotion = useReducedMotion();

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
    <section className="w-full py-12 md:py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 xs:px-6">
        {/* Section Header - Minimal */}
        <ScrollReveal variant="fadeUp">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-foreground" />
              <span className="text-sm font-light text-foreground">@lineofjudahwear</span>
            </div>
            <motion.a 
              href="https://instagram.com/lineofjudahwear" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-caption text-muted-foreground hover:text-foreground transition-colors uppercase touch-target px-3 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Follow
            </motion.a>
          </div>
        </ScrollReveal>

        {/* Mobile Grid - Simple 2 columns */}
        <StaggerContainer className="grid grid-cols-2 gap-2 md:hidden" staggerDelay={0.08}>
          {posts.slice(0, 6).map((post) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/lineofjudahwear"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group tap-feedback active:scale-[0.98] transition-transform duration-150"
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Instagram icon overlay on tap/hover */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 group-active:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </StaggerContainer>

        {/* Desktop Grid - Collage style with row spanning */}
        <StaggerContainer className="hidden md:grid grid-cols-12 gap-2" staggerDelay={0.08}>
          {/* Large left image - spans 2 rows */}
          <motion.a
            href="https://instagram.com/lineofjudahwear"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-4 row-span-2 relative aspect-[3/4] overflow-hidden group"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.img 
              src={posts[0].image}
              alt="Instagram post"
              className="w-full h-full object-cover"
              whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
              transition={{ duration: 0.6 }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
              <Instagram className="w-8 h-8 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.a>

          {/* Top right small images */}
          {posts.slice(1, 3).map((post) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/lineofjudahwear"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-4 relative aspect-square overflow-hidden group"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover"
                whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}

          {/* Bottom images - offset */}
          {posts.slice(3, 6).map((post) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/lineofjudahwear"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-4 relative aspect-square overflow-hidden group"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover"
                whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                transition={{ duration: 0.6 }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </StaggerContainer>

        {/* Tag CTA */}
        <ScrollReveal variant="fadeIn" delay={0.4}>
          <p className="text-center text-caption text-muted-foreground mt-6 md:mt-8">
            Tag us for a chance to be featured
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default InstagramFeed;