import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface StoryFiltersProps {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedGender: string;
  setSelectedGender: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const storyTypes = [
  { value: "all", label: "All Stories" },
  { value: "product_review", label: "Reviews" },
  { value: "testimony", label: "Testimonies" },
  { value: "transformation", label: "Transformations" },
];

const genderOptions = [
  { value: "all", label: "All" },
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "non-binary", label: "Non-binary" },
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "featured", label: "Featured" },
];

export default function StoryFilters({
  selectedProduct,
  setSelectedProduct,
  selectedType,
  setSelectedType,
  selectedGender,
  setSelectedGender,
  sortBy,
  setSortBy,
}: StoryFiltersProps) {
  const { data: categories } = useQuery({
    queryKey: ["categories-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const hasActiveFilters =
    selectedProduct !== "all" ||
    selectedType !== "all" ||
    selectedGender !== "all";

  const clearFilters = () => {
    setSelectedProduct("all");
    setSelectedType("all");
    setSelectedGender("all");
    setSortBy("recent");
  };

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Product Filter */}
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-[160px] bg-background border-border">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Story Type Pills */}
          <div className="flex items-center gap-2">
            {storyTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className={
                  selectedType === type.value
                    ? "bg-amber-500 text-stone-900 hover:bg-amber-600 border-amber-500"
                    : "border-border hover:border-amber-500 hover:text-amber-600"
                }
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Gender Pills - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Gender:</span>
            {genderOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedGender === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedGender(option.value)}
                className={
                  selectedGender === option.value
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Sort + Clear */}
          <div className="flex items-center gap-3 ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
