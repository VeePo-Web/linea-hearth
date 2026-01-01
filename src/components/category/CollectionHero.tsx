import { useMemo } from "react";

interface CollectionHeroProps {
  category: string;
  productCount?: number;
}

interface CollectionContent {
  title: string;
  tagline: string;
  bgClass: string;
}

const collectionData: Record<string, CollectionContent> = {
  // Parent Categories
  "bottoms": {
    title: "Bottoms",
    tagline: "Move in Faith",
    bgClass: "bg-gradient-to-br from-stone-800 to-neutral-900",
  },
  "tees": {
    title: "Tees",
    tagline: "Wear Your Faith Daily",
    bgClass: "bg-gradient-to-br from-stone-800 to-stone-900",
  },
  "hoodies": {
    title: "Hoodies",
    tagline: "Comfort Meets Conviction",
    bgClass: "bg-gradient-to-br from-zinc-800 to-zinc-900",
  },
  "hats": {
    title: "Hats",
    tagline: "Crown Your Style",
    bgClass: "bg-gradient-to-br from-slate-800 to-slate-900",
  },
  "accessories": {
    title: "Accessories",
    tagline: "Complete the Look",
    bgClass: "bg-gradient-to-br from-amber-900/80 to-stone-900",
  },

  // Bottoms Subcategories
  "shorts": {
    title: "Shorts",
    tagline: "Warm Weather Ministry",
    bgClass: "bg-gradient-to-br from-amber-800/60 to-stone-900",
  },
  "joggers": {
    title: "Joggers",
    tagline: "Run Your Race",
    bgClass: "bg-gradient-to-br from-stone-700 to-neutral-900",
  },
  "sweatpants": {
    title: "Sweatpants",
    tagline: "Rest in Purpose",
    bgClass: "bg-gradient-to-br from-neutral-700 to-stone-900",
  },

  // Tees Subcategories
  "short-sleeve": {
    title: "Short Sleeve",
    tagline: "Classic Faith Forward",
    bgClass: "bg-gradient-to-br from-stone-700 to-stone-900",
  },
  "long-sleeve": {
    title: "Long Sleeve",
    tagline: "Extended Grace",
    bgClass: "bg-gradient-to-br from-zinc-700 to-stone-900",
  },
  "cropped": {
    title: "Cropped",
    tagline: "Bold & Set Apart",
    bgClass: "bg-gradient-to-br from-amber-700/60 to-neutral-900",
  },

  // Hoodies Subcategories (Professional Structure)
  "pullover-hoodies": {
    title: "Pullover Hoodies",
    tagline: "Classic Comfort",
    bgClass: "bg-gradient-to-br from-zinc-700 to-zinc-900",
  },
  "zip-up-hoodies": {
    title: "Zip-Up Hoodies",
    tagline: "Versatile Devotion",
    bgClass: "bg-gradient-to-br from-neutral-700 to-zinc-900",
  },
  "crewnecks": {
    title: "Crewnecks",
    tagline: "Clean & Called",
    bgClass: "bg-gradient-to-br from-stone-600 to-zinc-900",
  },
  "quarter-zips": {
    title: "Quarter Zips",
    tagline: "Athletic Heritage",
    bgClass: "bg-gradient-to-br from-slate-700 to-stone-900",
  },
  "lightweight-hoodies": {
    title: "Lightweight Hoodies",
    tagline: "Layered in Light",
    bgClass: "bg-gradient-to-br from-zinc-600 to-neutral-900",
  },

  // Hats Subcategories
  "snapbacks": {
    title: "Snapbacks",
    tagline: "Street Ministry",
    bgClass: "bg-gradient-to-br from-stone-700 to-slate-900",
  },
  "dad-hats": {
    title: "Dad Hats",
    tagline: "Relaxed & Righteous",
    bgClass: "bg-gradient-to-br from-neutral-700 to-slate-900",
  },
  "beanies": {
    title: "Beanies",
    tagline: "Covered in Faith",
    bgClass: "bg-gradient-to-br from-zinc-700 to-slate-900",
  },

  // Accessories Subcategories
  "bags": {
    title: "Bags",
    tagline: "Carry the Message",
    bgClass: "bg-gradient-to-br from-amber-800/70 to-stone-900",
  },
  "socks": {
    title: "Socks",
    tagline: "Grounded in Truth",
    bgClass: "bg-gradient-to-br from-stone-700 to-amber-900/50",
  },
  "stickers": {
    title: "Stickers",
    tagline: "Spread the Word",
    bgClass: "bg-gradient-to-br from-amber-700/50 to-neutral-900",
  },

  // Special Collections
  "t-shirts": {
    title: "T-Shirts",
    tagline: "Wear Your Faith Daily",
    bgClass: "bg-gradient-to-br from-stone-800 to-stone-900",
  },
  "sweatshirts": {
    title: "Sweatshirts",
    tagline: "Bold Warmth, Timeless Message",
    bgClass: "bg-gradient-to-br from-neutral-800 to-neutral-900",
  },
  "new-arrivals": {
    title: "New Arrivals",
    tagline: "Fresh Drops, Timeless Truth",
    bgClass: "bg-gradient-to-br from-stone-700 to-zinc-900",
  },
  "best-sellers": {
    title: "Best Sellers",
    tagline: "Community Favorites",
    bgClass: "bg-gradient-to-br from-amber-800/60 to-stone-900",
  },
  "sale": {
    title: "Sale",
    tagline: "Faith at a Blessing",
    bgClass: "bg-gradient-to-br from-red-900/40 to-stone-900",
  },
};

const defaultContent: CollectionContent = {
  title: "Shop All",
  tagline: "Faith-Forward Apparel",
  bgClass: "bg-gradient-to-br from-stone-700 to-stone-900",
};

const CollectionHero = ({ category, productCount }: CollectionHeroProps) => {
  const content = useMemo(() => {
    const slug = category.toLowerCase().replace(/\s+/g, "-");
    return collectionData[slug] || {
      ...defaultContent,
      title: category.charAt(0).toUpperCase() + category.slice(1),
    };
  }, [category]);

  return (
    <section className={`relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] ${content.bgClass} overflow-hidden`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
        <p className="text-white/70 text-xs md:text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">
          {content.tagline}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide animate-fade-in">
          {content.title}
        </h1>
        {productCount !== undefined && productCount > 0 && (
          <p className="text-white/60 text-sm md:text-base font-light mt-6 animate-fade-in">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default CollectionHero;
