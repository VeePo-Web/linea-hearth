import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StoryCard, { StoryCardData } from "./StoryCard";
import StoryModal from "./StoryModal";

interface StoryGridProps {
  selectedProduct: string;
  selectedType: string;
  selectedGender: string;
  sortBy: string;
}

const ITEMS_PER_PAGE = 12;

export default function StoryGrid({
  selectedProduct,
  selectedType,
  selectedGender,
  sortBy,
}: StoryGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedStory, setSelectedStory] = useState<StoryCardData | null>(null);

  // Fetch community stories
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["community-stories", selectedProduct, selectedType, selectedGender, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("community_stories")
        .select(`
          id,
          customer_name,
          customer_photo_url,
          customer_location,
          headline,
          story_text,
          video_url,
          gender,
          is_contactable,
          instagram_handle,
          is_featured,
          product_id,
          products (name, slug)
        `)
        .eq("is_approved", true);

      if (selectedGender !== "all") {
        query = query.eq("gender", selectedGender);
      }

      if (sortBy === "featured") {
        query = query.order("is_featured", { ascending: false });
      }
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["community-reviews", selectedProduct, selectedType, selectedGender, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          id,
          customer_name,
          customer_avatar_url,
          customer_location,
          review_text,
          rating,
          video_url,
          gender,
          is_contactable,
          is_featured,
          product_id,
          products (name, slug)
        `)
        .eq("is_approved", true);

      if (selectedType !== "all" && selectedType !== "testimony" && selectedType !== "transformation") {
        // Only fetch reviews if type is "all" or "product_review"
      }

      if (selectedGender !== "all") {
        query = query.eq("gender", selectedGender);
      }

      if (sortBy === "featured") {
        query = query.order("is_featured", { ascending: false });
      }
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Combine and transform data
  const allStories: StoryCardData[] = [
    // Transform stories
    ...(stories || []).map((s: any) => ({
      id: s.id,
      type: "story" as const,
      customer_name: s.customer_name,
      customer_photo_url: s.customer_photo_url,
      customer_location: s.customer_location,
      headline: s.headline,
      story_text: s.story_text,
      video_url: s.video_url,
      product_name: s.products?.name,
      product_slug: s.products?.slug,
      is_contactable: s.is_contactable,
      instagram_handle: s.instagram_handle,
    })),
    // Transform reviews (only if type filter allows)
    ...((selectedType === "all" || selectedType === "product_review") && reviews
      ? reviews.map((r: any) => ({
          id: r.id,
          type: "review" as const,
          customer_name: r.customer_name,
          customer_photo_url: r.customer_avatar_url,
          customer_location: r.customer_location,
          story_text: r.review_text,
          rating: r.rating,
          video_url: r.video_url,
          product_name: r.products?.name,
          product_slug: r.products?.slug,
          is_contactable: r.is_contactable,
        }))
      : []),
  ];

  // Filter by product if needed
  const filteredStories = selectedProduct === "all"
    ? allStories
    : allStories.filter((s) => s.product_slug === selectedProduct);

  const visibleStories = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;

  const isLoading = storiesLoading || reviewsLoading;

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-sm" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback placeholder stories if none exist
  const displayStories = visibleStories.length > 0 ? visibleStories : [
    {
      id: "placeholder-1",
      type: "story" as const,
      customer_name: "Sarah M.",
      customer_location: "Toronto, ON",
      headline: "My coworker asked about my shirt",
      story_text: "I was nervous to wear faith-based apparel to my corporate job. But the design was subtle enough to start a conversation. My coworker asked, and I got to share my testimony.",
      is_contactable: true,
    },
    {
      id: "placeholder-2",
      type: "review" as const,
      customer_name: "James K.",
      customer_location: "Vancouver, BC",
      story_text: "Quality is insane. I've washed this hoodie 50+ times and it still looks brand new. The print hasn't cracked at all.",
      rating: 5,
      product_name: "Lion Hoodie",
    },
    {
      id: "placeholder-3",
      type: "story" as const,
      customer_name: "Priya D.",
      customer_location: "Calgary, AB",
      headline: "Wore it to campus every day",
      story_text: "As a university student, I wanted something that represented my faith without being preachy. Line of Judah gets it. People ask about the lion all the time.",
      is_contactable: false,
    },
    {
      id: "placeholder-4",
      type: "review" as const,
      customer_name: "Michael R.",
      customer_location: "Edmonton, AB",
      story_text: "Best Christian streetwear I've found. The fit is perfect, the message is bold but not obnoxious. Exactly what I was looking for.",
      rating: 5,
      product_name: "Crown Tee",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-8">
          Showing {displayStories.length} {displayStories.length === 1 ? "story" : "stories"}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              onOpenStory={setSelectedStory}
              index={index}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              Load More Stories
            </Button>
          </div>
        )}

        {/* Story Modal */}
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      </div>
    </section>
  );
}
