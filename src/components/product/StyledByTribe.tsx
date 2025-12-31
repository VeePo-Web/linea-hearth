import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StyledByTribeProps {
  productId?: string;
}

const StyledByTribe = ({ productId }: StyledByTribeProps) => {
  const { data: ugcImages = [], isLoading } = useQuery({
    queryKey: ["product-ugc", productId],
    queryFn: async () => {
      const query = supabase
        .from("product_ugc")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (productId) {
        query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Mock data for display when no UGC exists
  const mockUGC = [
    { id: "1", customer_name: "Marcus T.", instagram_handle: "@marcust_faith", image_url: "", caption: "Walking in purpose daily" },
    { id: "2", customer_name: "Sarah W.", instagram_handle: "@sarahworship", image_url: "", caption: "Sunday best" },
    { id: "3", customer_name: "David K.", instagram_handle: "@davidkingdom", image_url: "", caption: "Bold and blessed" },
    { id: "4", customer_name: "Grace M.", instagram_handle: "@gracemoves", image_url: "", caption: "Faith over fear" },
  ];

  const displayImages = ugcImages.length > 0 ? ugcImages : mockUGC;

  return (
    <section className="w-full py-12 lg:py-16">
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-2">
              Styled By The Tribe
            </h2>
            <p className="text-sm font-light text-muted-foreground">
              Tag us <span className="text-foreground">@lineofjudahwear</span> for a chance to be featured
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 h-9 text-xs font-light border-border hover:bg-muted/50"
          >
            <Camera className="w-3.5 h-3.5" />
            Submit Your Photo
          </Button>
        </div>
      </div>

      {/* Horizontal Scrolling Gallery */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-6 pb-4" style={{ width: "max-content" }}>
          {displayImages.map((item) => (
            <div
              key={item.id}
              className="relative w-[200px] md:w-[240px] aspect-square bg-muted group cursor-pointer overflow-hidden flex-shrink-0"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={`${item.customer_name}'s style`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <span className="text-4xl opacity-20">✝</span>
                </div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-background p-4">
                <p className="text-sm font-light text-center mb-1">
                  {item.customer_name}
                </p>
                {item.instagram_handle && (
                  <div className="flex items-center gap-1 text-xs font-light opacity-80">
                    <Instagram className="w-3 h-3" />
                    {item.instagram_handle}
                  </div>
                )}
                {item.caption && (
                  <p className="text-xs font-light text-center mt-3 opacity-80 italic">
                    "{item.caption}"
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div className="w-[200px] md:w-[240px] aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-3 flex-shrink-0 hover:border-foreground transition-colors cursor-pointer">
            <Camera className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
            <div className="text-center">
              <p className="text-sm font-light text-foreground">Share Your Style</p>
              <p className="text-xs font-light text-muted-foreground mt-1">
                Tag @lineofjudahwear
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submit Button */}
      <div className="px-6 mt-4 md:hidden">
        <Button
          variant="outline"
          className="w-full h-10 text-xs font-light border-border hover:bg-muted/50"
        >
          <Camera className="w-3.5 h-3.5 mr-2" />
          Submit Your Photo
        </Button>
      </div>
    </section>
  );
};

export default StyledByTribe;
