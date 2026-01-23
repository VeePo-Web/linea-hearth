import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
}

interface FAQCategoryTabsProps {
  categories: readonly Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const FAQCategoryTabs = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: FAQCategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 mb-10">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "px-4 py-2 text-xs font-medium tracking-widest whitespace-nowrap uppercase transition-all border",
            activeCategory === category.id
              ? "bg-stone-900 text-white border-stone-900 dark:bg-white dark:text-stone-900 dark:border-white"
              : "bg-transparent text-muted-foreground border-stone-300 hover:border-stone-900 hover:text-foreground dark:border-stone-600 dark:hover:border-white"
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default FAQCategoryTabs;
