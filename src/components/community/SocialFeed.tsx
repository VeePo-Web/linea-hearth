import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

// TikTok icon component
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

// Placeholder social posts
const placeholderPosts: SocialPost[] = [
  {
    id: "1",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "faithfulwarrior",
    likes: 234,
    comments: 18,
    caption: "Wearing my faith boldly 🦁",
    postUrl: "#",
  },
  {
    id: "2",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "praisevibes",
    likes: 456,
    comments: 32,
    caption: "This hoodie is everything 🙌",
    postUrl: "#",
  },
  {
    id: "3",
    platform: "tiktok",
    imageUrl: "/founders.png",
    username: "crowned.king",
    likes: 1200,
    comments: 89,
    caption: "POV: Someone asks about your shirt",
    postUrl: "#",
  },
  {
    id: "4",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "jesusfreak",
    likes: 189,
    comments: 14,
    caption: "Campus ministry fit check ✨",
    postUrl: "#",
  },
  {
    id: "5",
    platform: "tiktok",
    imageUrl: "/founders.png",
    username: "streetfaith",
    likes: 2300,
    comments: 156,
    caption: "When the lion speaks 🔥",
    postUrl: "#",
  },
  {
    id: "6",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "anointed.apparel",
    likes: 567,
    comments: 45,
    caption: "Tribe worldwide 🌍",
    postUrl: "#",
  },
  {
    id: "7",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "boldbelievers",
    likes: 892,
    comments: 67,
    caption: "Sunday ready 🙏",
    postUrl: "#",
  },
  {
    id: "8",
    platform: "tiktok",
    imageUrl: "/founders.png",
    username: "faithfit",
    likes: 3400,
    comments: 234,
    caption: "Walking different 🦁",
    postUrl: "#",
  },
];

export default function SocialFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 lg:py-28 bg-muted/30 overflow-hidden">
      {/* Header */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 lg:px-8 mb-12"
      >
        <motion.p 
          variants={staggerItem}
          className="text-[10px] uppercase tracking-[0.4em] text-amber-600 mb-4"
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

      {/* Horizontal Scroll Gallery */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 lg:px-8 pb-4 cursor-grab active:cursor-grabbing"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {placeholderPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ rotate: index % 2 === 0 ? 2 : -2, scale: 1.02 }}
              className="group relative shrink-0 w-[280px] aspect-square overflow-hidden bg-muted"
              style={{ scrollSnapAlign: "start" }}
            >
              <img
                src={post.imageUrl}
                alt={`Post by @${post.username}`}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              
              {/* Hover Overlay - Username slides up */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">@{post.username}</p>
                  <p className="text-white/60 text-xs mt-1 line-clamp-1">{post.caption}</p>
                </div>
              </div>

              {/* Platform Badge - Corner */}
              <div className="absolute top-3 right-3 opacity-60">
                {post.platform === "instagram" ? (
                  <Instagram className="w-4 h-4 text-white drop-shadow-md" />
                ) : (
                  <TikTokIcon className="w-4 h-4 text-white drop-shadow-md" />
                )}
              </div>
            </motion.a>
          ))}
        </div>

        {/* Scroll hint gradient */}
        <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* Single Follow CTA */}
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
          <a
            href="https://instagram.com/lineofjudah"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow @lineofjudah
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </motion.div>
    </section>
  );
}
