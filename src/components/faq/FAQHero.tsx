import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FAQHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FAQHero = ({ searchQuery, onSearchChange }: FAQHeroProps) => {
  return (
    <section className="bg-stone-900 text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block text-xs font-medium tracking-widest text-amber-500 mb-4">
          HELP CENTER
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">
          QUESTIONS? ANSWERED.
        </h1>
        <p className="text-lg text-white/70 font-light mb-10 max-w-xl mx-auto">
          Everything you need to know about Line of Judah
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <Input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white text-stone-900 border-0 placeholder:text-stone-400 text-base focus-visible:ring-amber-500"
          />
        </div>
      </div>
    </section>
  );
};

export default FAQHero;
