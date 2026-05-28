import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CompleteTheLookBundle from "./CompleteTheLookBundle";
import WearWithSection from "./WearWithSection";

interface LookbookLookSectionProps {
  currentProductId: string;
  fallbackCategoryId?: string | null;
}

/**
 * Lightweight orchestrator: does the current product belong to any active
 * lookbook look with at least one sibling? If yes, render the Complete-the-Look
 * bundle. Otherwise, render the editorial WearWith fallback.
 */
const LookbookLookSection = ({ currentProductId, fallbackCategoryId }: LookbookLookSectionProps) => {
  const { data: hasLook, isLoading } = useQuery({
    queryKey: ["pdp-has-look", currentProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookbook_look_products")
        .select("look_id, lookbook_looks!inner(is_active)")
        .eq("product_id", currentProductId)
        .limit(5);
      if (error) return false;
      const lookIds = (data || [])
        .filter((r: any) => r.lookbook_looks?.is_active)
        .map((r: any) => r.look_id);
      if (!lookIds.length) return false;
      const { count } = await supabase
        .from("lookbook_look_products")
        .select("*", { count: "exact", head: true })
        .in("look_id", lookIds)
        .neq("product_id", currentProductId);
      return (count ?? 0) > 0;
    },
    enabled: !!currentProductId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;
  if (hasLook) return <CompleteTheLookBundle currentProductId={currentProductId} />;
  return <WearWithSection currentProductId={currentProductId} categoryId={fallbackCategoryId} />;
};

export default LookbookLookSection;

