import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, MessageCircle, Instagram, ExternalLink, Share2, Copy } from "lucide-react";
import { StoryCardData } from "./StoryCard";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface StoryModalProps {
  story: StoryCardData | null;
  onClose: () => void;
}

export default function StoryModal({ story, onClose }: StoryModalProps) {
  if (!story) return null;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this story with your community.",
      });
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!story} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Image/Video */}
          <div className="relative aspect-square md:aspect-auto md:min-h-[500px] bg-stone-100 dark:bg-stone-800">
            {story.video_url ? (
              <iframe
                src={story.video_url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : story.customer_photo_url ? (
              <img
                src={story.customer_photo_url}
                alt={story.customer_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl font-light text-stone-300 dark:text-stone-600">
                  {story.customer_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div className="p-6 lg:p-8 flex flex-col">
            <DialogHeader className="text-left mb-6">
              {/* Rating */}
              {story.rating && (
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < story.rating!
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {story.rating}/5
                  </span>
                </div>
              )}

              <DialogTitle className="text-2xl lg:text-3xl font-light leading-tight">
                {story.headline || `"${story.story_text.slice(0, 50)}..."`}
              </DialogTitle>
            </DialogHeader>

            {/* Customer Info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              {story.customer_photo_url ? (
                <img
                  src={story.customer_photo_url}
                  alt={story.customer_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 font-medium text-lg">
                    {story.customer_name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{story.customer_name}</p>
                {story.customer_location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {story.customer_location}
                  </p>
                )}
              </div>
              {story.instagram_handle && (
                <a
                  href={`https://instagram.com/${story.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-amber-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Full Story */}
            <div className="flex-1 mb-6">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {story.story_text}
              </p>
            </div>

            {/* Product Link */}
            {story.product_name && story.product_slug && (
              <div className="mb-6 p-4 bg-muted/50 rounded-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Featured Product
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{story.product_name}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/product/${story.product_slug}`}>
                      View Product
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              {story.is_contactable && (
                <Button className="flex-1 bg-amber-500 text-stone-900 hover:bg-amber-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask Me Anything
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
