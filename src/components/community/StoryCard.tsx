import { Star, MapPin, Play, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export interface StoryCardData {
  id: string;
  type: "review" | "story";
  customer_name: string;
  customer_photo_url?: string | null;
  customer_location?: string | null;
  headline?: string;
  story_text: string;
  rating?: number;
  video_url?: string | null;
  product_name?: string;
  product_slug?: string;
  is_contactable?: boolean;
  instagram_handle?: string | null;
}

interface StoryCardProps {
  story: StoryCardData;
  onOpenStory: (story: StoryCardData) => void;
  index: number;
  size?: "regular" | "large" | "wide";
}

export default function StoryCard({ story, onOpenStory, index, size = "regular" }: StoryCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // Determine aspect ratio based on size
  const aspectClass = size === "large" 
    ? "aspect-[3/4]" 
    : size === "wide" 
      ? "aspect-[16/9]" 
      : "aspect-[4/5]";

  // Determine row span for grid
  const spanClass = size === "large" ? "row-span-2" : size === "wide" ? "col-span-2" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`group relative cursor-pointer ${spanClass}`}
      onClick={() => onOpenStory(story)}
    >
      {/* Card Container - DAZED hover effects */}
      <div className={`${aspectClass} relative overflow-hidden bg-muted`}>
        {/* Background Image or Placeholder */}
        {story.customer_photo_url ? (
          <motion.img
            src={story.customer_photo_url}
            alt={story.customer_name}
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center">
            <span className="text-[80px] font-extralight text-stone-400/40 dark:text-stone-600/40 uppercase">
              {story.customer_name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient Overlay - Intensifies on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />

        {/* Video Play Button - Pulsing */}
        {story.video_url && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div 
              className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Play className="w-4 h-4 text-stone-900 ml-0.5" fill="currentColor" />
            </motion.div>
          </div>
        )}

        {/* Product Badge - Minimal */}
        {story.product_name && (
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-medium">
              {story.product_name}
            </span>
          </div>
        )}

        {/* AMA Badge - Rotated 90° on right edge (032c style) */}
        {story.is_contactable && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block">
            <div className="bg-amber-500 px-2 py-1 -rotate-90 origin-right">
              <span className="text-[9px] uppercase tracking-[0.15em] text-stone-900 font-medium whitespace-nowrap">
                AMA
              </span>
            </div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          {/* Rating - Only visible on hover for cleaner default */}
          {story.rating && (
            <div className="flex items-center gap-0.5 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < story.rating!
                      ? "text-amber-500 fill-amber-500"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Headline or Story Snippet */}
          <p className="text-white font-light text-sm md:text-base leading-relaxed mb-4 italic">
            "{truncateText(story.headline || story.story_text, size === "large" ? 120 : 80)}"
          </p>

          {/* Customer Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {story.customer_photo_url ? (
                <img 
                  src={story.customer_photo_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-medium">
                  {story.customer_name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {story.customer_name}
              </p>
              {story.customer_location && (
                <p className="text-white/50 text-xs flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {story.customer_location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hover CTA - Subtle slide up */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-amber-500 to-amber-500/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
        >
          <span className="text-stone-900 text-xs uppercase tracking-[0.2em] font-medium">
            Read Story →
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
