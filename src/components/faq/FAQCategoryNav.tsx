import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
}

interface FAQCategoryNavProps {
  categories: readonly Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const FAQCategoryNav = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: FAQCategoryNavProps) => {
  return (
    <div className="sticky top-16 z-40 bg-background border-b border-border">
      <div className="max-w-4xl mx-auto px-6">
        <nav className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "px-4 py-2 text-sm font-light whitespace-nowrap transition-all border",
                activeCategory === category.id
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-transparent text-muted-foreground border-stone-300 hover:border-stone-900 hover:text-foreground"
              )}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default FAQCategoryNav;
