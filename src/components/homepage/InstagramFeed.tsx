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
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Minimal */}
        <ScrollReveal variant="fadeUp">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-foreground" />
              <span className="text-sm font-light text-foreground">@lineofjudahwear</span>
            </div>
            <motion.a 
              href="https://instagram.com/lineofjudahwear" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-caption text-muted-foreground hover:text-foreground transition-colors uppercase"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Follow
            </motion.a>
          </div>
        </ScrollReveal>

        {/* Collage Grid - DAZED asymmetric offset style */}
        <StaggerContainer className="grid grid-cols-12 gap-2" staggerDelay={0.08}>
          {/* Large left image */}
          <motion.a
            href="https://instagram.com/lineofjudahwear"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-6 md:col-span-4 row-span-2 relative aspect-[3/4] overflow-hidden group"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.img 
              src={posts[0].image}
              alt="Instagram post"
              className="w-full h-full object-cover"
              whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
              transition={{ duration: 0.6 }}
            />
          </motion.a>

          {/* Top right small images */}
          {posts.slice(1, 3).map((post) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/lineofjudahwear"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-6 md:col-span-4 relative aspect-square overflow-hidden group"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.img 
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover"
                whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                transition={{ duration: 0.6 }}
              />
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
              />
            </motion.a>
          ))}
        </StaggerContainer>

        {/* Tag CTA */}
        <ScrollReveal variant="fadeIn" delay={0.4}>
          <p className="text-center text-caption text-muted-foreground mt-8">
            Tag us for a chance to be featured
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default InstagramFeed;
