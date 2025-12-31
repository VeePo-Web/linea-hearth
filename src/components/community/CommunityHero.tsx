import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Star, MapPin, Users, MessageCircle } from "lucide-react";
import { useState } from "react";

interface FeaturedStory {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  customer_location: string | null;
  headline: string;
  story_text: string;
  video_url: string | null;
}

export default function CommunityHero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const { data: featuredStory } = useQuery({
    queryKey: ["featured-community-story"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_stories")
        .select("*")
        .eq("is_featured", true)
        .eq("is_approved", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FeaturedStory | null;
    },
  });

  // Fallback featured story for display
  const displayStory = featuredStory || {
    customer_name: "Marcus T.",
    customer_location: "Calgary, AB",
    headline: "This Hoodie Changed My Train Ride",
    story_text: "A stranger asked about my hoodie on the C-Train. Twenty minutes later, we were praying together. That's when I knew — this isn't just apparel, it's armor.",
    customer_photo_url: null,
    video_url: null,
  };

  return (
    <section className="relative min-h-[70vh] bg-stone-900 flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/95 to-stone-900/70" />
      
      {/* Decorative lion pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-5">
        <div className="absolute inset-0 bg-[url('/founders.png')] bg-cover bg-center" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-medium">
                Stories From The Tribe
              </p>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-[1.1]">
                "{displayStory.headline}"
              </h1>
            </div>

            <blockquote className="text-lg lg:text-xl text-white/80 font-light leading-relaxed max-w-lg">
              {displayStory.story_text}
            </blockquote>

            <div className="flex items-center gap-4">
              {displayStory.customer_photo_url ? (
                <img
                  src={displayStory.customer_photo_url}
                  alt={displayStory.customer_name}
                  className="w-12 h-12 rounded-full object-cover grayscale"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 font-medium text-lg">
                    {displayStory.customer_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-white font-medium">{displayStory.customer_name}</p>
                {displayStory.customer_location && (
                  <p className="text-white/60 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {displayStory.customer_location}
                  </p>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-500" />
                <span className="text-white font-light">
                  <span className="font-medium">500+</span> Stories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span className="text-white font-light">
                  <span className="font-medium">45</span> Cities
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span className="text-white font-light">
                  <span className="font-medium">10K+</span> Tribe Members
                </span>
              </div>
            </div>
          </div>

          {/* Right: Featured Video/Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-stone-800">
              {displayStory.video_url && !isVideoPlaying ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent z-10" />
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="absolute inset-0 z-20 flex items-center justify-center group"
                    aria-label="Play video"
                  >
                    <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Play className="w-8 h-8 text-stone-900 ml-1" fill="currentColor" />
                    </div>
                  </button>
                  <img
                    src={displayStory.customer_photo_url || "/founders.png"}
                    alt="Featured story"
                    className="w-full h-full object-cover"
                  />
                </>
              ) : displayStory.video_url && isVideoPlaying ? (
                <iframe
                  src={displayStory.video_url}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star className="w-12 h-12 text-amber-500" />
                    </div>
                    <p className="text-white/60 text-sm max-w-xs">
                      Real stories from real believers wearing their faith boldly
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-amber-500 px-6 py-3 rounded-sm">
              <p className="text-stone-900 font-medium text-sm">Featured Story</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
