import { Star, MapPin, Play, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
}

export default function StoryCard({ story, onOpenStory, index }: StoryCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <div
      className="group relative cursor-pointer animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
      onClick={() => onOpenStory(story)}
    >
      {/* Card Container */}
      <div className="aspect-[4/5] relative rounded-sm overflow-hidden bg-stone-100 dark:bg-stone-800 transition-transform duration-300 group-hover:scale-[1.02]">
        {/* Background Image or Placeholder */}
        {story.customer_photo_url ? (
          <img
            src={story.customer_photo_url}
            alt={story.customer_name}
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800 flex items-center justify-center">
            <span className="text-6xl font-light text-stone-400 dark:text-stone-600">
              {story.customer_name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Video Play Button */}
        {story.video_url && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Product Badge */}
        {story.product_name && (
          <Badge
            variant="secondary"
            className="absolute top-4 left-4 z-10 bg-amber-500 text-stone-900 hover:bg-amber-600"
          >
            {story.product_name}
          </Badge>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          {/* Rating */}
          {story.rating && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < story.rating!
                      ? "text-amber-500 fill-amber-500"
                      : "text-white/30"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Headline or Story Snippet */}
          <p className="text-white font-light text-sm leading-relaxed mb-3">
            "{truncateText(story.headline || story.story_text, 80)}"
          </p>

          {/* Customer Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">
                {story.customer_name}
              </p>
              {story.customer_location && (
                <p className="text-white/60 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {story.customer_location}
                </p>
              )}
            </div>

            {story.is_contactable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-transparent border-white/30 text-white hover:bg-white hover:text-stone-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle AMA click
                  }}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  AMA
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-white text-stone-900 px-4 py-2 text-sm font-medium rounded-sm">
            Read Full Story
          </span>
        </div>
      </div>
    </div>
  );
}
