import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface SocialPost {
  id: string;
  platform: "instagram" | "tiktok";
  imageUrl: string;
  username: string;
  likes: number;
  comments: number;
  caption: string;
  postUrl: string;
}

const placeholderPosts: SocialPost[] = [
  { id: "1", platform: "instagram", imageUrl: "/founders.png", username: "faithfulwarrior", likes: 234, comments: 18, caption: "Wearing my faith boldly 🦁", postUrl: "#" },
  { id: "2", platform: "instagram", imageUrl: "/founders.png", username: "praisevibes", likes: 456, comments: 32, caption: "This hoodie is everything 🙌", postUrl: "#" },
  { id: "3", platform: "tiktok", imageUrl: "/founders.png", username: "crowned.king", likes: 1200, comments: 89, caption: "POV: Someone asks about your shirt", postUrl: "#" },
  { id: "4", platform: "instagram", imageUrl: "/founders.png", username: "jesusfreak", likes: 189, comments: 14, caption: "Campus ministry fit check ✨", postUrl: "#" },
  { id: "5", platform: "tiktok", imageUrl: "/founders.png", username: "streetfaith", likes: 2300, comments: 156, caption: "When the lion speaks 🔥", postUrl: "#" },
  { id: "6", platform: "instagram", imageUrl: "/founders.png", username: "anointed.apparel", likes: 567, comments: 45, caption: "Tribe worldwide 🌍", postUrl: "#" },
  { id: "7", platform: "instagram", imageUrl: "/founders.png", username: "boldbelievers", likes: 892, comments: 67, caption: "Sunday ready 🙏", postUrl: "#" },
  { id: "8", platform: "tiktok", imageUrl: "/founders.png", username: "faithfit", likes: 3400, comments: 234, caption: "Walking different 🦁", postUrl: "#" },
];

const formatLikes = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

// Alternating tint overlays for visual variety from same source image
const tintOverlays = [
  "bg-champagne-900/20",
  "bg-stone-700/30",
  "bg-champagne-800/25",
  "bg-stone-600/20",
  "bg-champagne-700/15",
  "bg-stone-800/25",
  "bg-champagne-600/20",
  "bg-stone-500/15",
];

export default function SocialFeed() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30 overflow-hidden">
      {/* Header */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 lg:px-8 mb-8"
      >
        <div className="flex items-baseline gap-4 mb-6">
          <motion.span variants={staggerItem} className="text-[10px] uppercase tracking-[0.2em] text-champagne-500 font-medium">03</motion.span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <motion.p 
          variants={staggerItem}
          className="text-[10px] uppercase tracking-[0.4em] text-champagne-600 mb-4"
        >
          Join The Movement
        </motion.p>
        <motion.h2 
          variants={staggerItem}
          className="text-4xl lg:text-5xl font-extralight mb-4"
        >
          #LineOfJudah
        </motion.h2>
        <motion.p 
          variants={staggerItem}
          className="text-muted-foreground max-w-lg"
        >
          Tag us. Get featured. Join 10K+ believers wearing bold.
        </motion.p>
      </motion.div>

      {/* Desktop: CSS Grid | Mobile: Horizontal scroll */}
      {/* Mobile horizontal scroll */}
      <MobileScrollFeed posts={placeholderPosts} />

      {/* Desktop grid */}
      <div className="hidden lg:block container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-4 gap-3">
          {placeholderPosts.map((post, index) => (
            <SocialCard key={post.id} post={post} index={index} isGrid />
          ))}
        </div>
      </div>

      {/* Follow CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 lg:px-8 mt-12"
      >
        <Button 
          variant="outline" 
          asChild
          className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background text-xs uppercase tracking-[0.2em] px-8"
        >
          <a href="https://instagram.com/lineofjudah" target="_blank" rel="noopener noreferrer">
            Follow @lineofjudah
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </motion.div>
    </section>
  );
}

function MobileScrollFeed({ posts }: { posts: SocialPost[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = 260 + 16; // w-[260px] + gap-4
    setActiveIndex(Math.round(scrollLeft / cardWidth));
  };

  return (
    <div className="lg:hidden relative">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pl-4 pr-8 pb-4 snap-x snap-mandatory"
      >
        {posts.map((post, index) => (
          <SocialCard key={post.id} post={post} index={index} />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-muted/80 via-muted/40 to-transparent pointer-events-none" />
      {/* Scroll indicator dots */}
      <div className="flex justify-center gap-1.5 pt-3 pb-1">
        {posts.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              i === activeIndex ? 'bg-champagne-500' : 'bg-foreground/15'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SocialCard({ post, index, isGrid }: { post: SocialPost; index: number; isGrid?: boolean }) {
  // Every 3rd card is taller for masonry rhythm
  const isTall = index % 3 === 2;
  const aspectClass = isGrid 
    ? (isTall ? "aspect-[3/4]" : "aspect-square")
    : "aspect-square";

  return (
    <motion.a
      href={post.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative overflow-hidden bg-muted ${
        isGrid ? "" : "shrink-0 w-[260px] snap-start"
      } ${aspectClass}`}
    >
      <img
        src={post.imageUrl}
        alt={`Post by @${post.username}`}
        className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ${
          index % 2 === 1 ? 'scale-x-[-1]' : ''
        } ${
          index === 2 || index === 5 ? 'scale-[1.3] object-top' : ''
        } ${
          index === 3 || index === 6 ? 'object-[80%_80%]' : ''
        }`}
      />
      
      {/* Color tint overlay for variety */}
      <div className={`absolute inset-0 ${tintOverlays[index % tintOverlays.length]} mix-blend-multiply group-hover:opacity-0 transition-opacity duration-500`} />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium">@{post.username}</p>
          <p className="text-white/60 text-xs mt-1 line-clamp-1">{post.caption}</p>
          <p className="text-white/40 text-[10px] mt-2">{formatLikes(post.likes)} likes</p>
        </div>
      </div>

      {/* Platform Badge */}
      <div className="absolute top-3 right-3 opacity-60">
        {post.platform === "instagram" ? (
          <Instagram className="w-4 h-4 text-white drop-shadow-md" />
        ) : (
          <TikTokIcon className="w-4 h-4 text-white drop-shadow-md" />
        )}
      </div>
    </motion.a>
  );
}
