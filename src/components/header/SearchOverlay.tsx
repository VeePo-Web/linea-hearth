import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Clock, TrendingUp, Plus, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
};

const popularSearches = [
  "Stay Holy",
  "Heavenly Crewneck",
  "Black Hoodies",
  "Premium Tees",
];

// Individual trending product with quick-add
interface TrendingProductProps {
  product: ProductForQuickAdd & { image_url: string; category_name: string };
  onClose: () => void;
}

const TrendingProduct = ({ product, onClose }: TrendingProductProps) => {
  const quickAdd = useQuickAdd(product);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 group"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex items-center gap-4 flex-1"
        onClick={onClose}
      >
        <div className="w-16 h-16 bg-muted overflow-hidden">
          <motion.img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div>
          <p className="text-sm font-normal text-foreground group-hover:underline">
            {product.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {product.category_name}
            </span>
            {quickAdd.canOneTap && (
              <span className="text-[10px] text-amber-600 font-medium px-1.5 py-0.5 bg-amber-500/10 rounded-sm">
                {quickAdd.rememberedSize}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Quick Add Button */}
      <motion.button
        onClick={(e) => quickAdd.handleQuickAdd(e)}
        disabled={quickAdd.isAdding || quickAdd.isAdded}
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
          "border border-border hover:border-foreground hover:bg-foreground hover:text-background",
          quickAdd.isAdded && "bg-emerald-500 border-emerald-500 text-white"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={quickAdd.canOneTap ? `Quick add in ${quickAdd.rememberedSize}` : "Add to bag"}
      >
        {quickAdd.isAdded ? (
          <Check className="w-4 h-4" />
        ) : quickAdd.isAdding ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
};

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  // Fetch trending products from database with variants for quick-add
  const { data: trendingProducts } = useQuery({
    queryKey: ['trending-products-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, price, sale_price, is_on_sale,
          categories:category_id(name, slug),
          product_images(image_url, is_primary, display_order),
          product_variants(size, color, stock_quantity)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map to quick-add format
  const productsForDisplay = trendingProducts?.map(product => {
    const primaryImage = product.product_images?.find(img => img.is_primary) 
      || product.product_images?.[0];
    
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      sale_price: product.sale_price,
      is_on_sale: product.is_on_sale,
      category_slug: product.categories?.slug,
      product_images: product.product_images,
      product_variants: product.product_variants,
      image_url: primaryImage?.image_url || '/placeholder.svg',
      category_name: product.categories?.name || 'Apparel',
    };
  }) || [];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearchValue("");
    }
  }, [isOpen]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-background border-b border-border z-50 shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="px-8 py-10">
            <div className="max-w-4xl mx-auto">
              {/* Search input */}
              <motion.div className="relative mb-10" variants={itemVariants}>
                <div className="flex items-center border-b-2 border-border pb-3 group focus-within:border-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 text-muted-foreground mr-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search for apparel..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-2xl md:text-3xl font-light"
                  />
                  {searchValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchValue("")}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={20} />
                    </motion.button>
                  )}
                  <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground ml-4">
                    <kbd className="px-2 py-1 bg-muted rounded text-[11px] font-mono">esc</kbd>
                    <span>to close</span>
                  </span>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-10">
                {/* Left: Popular searches */}
                <motion.div variants={itemVariants}>
                  <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-5">
                    <Clock size={14} />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <motion.button
                        key={index}
                        className="text-muted-foreground hover:text-foreground text-sm font-light py-2 px-4 border border-border hover:border-foreground transition-all duration-200"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSearchValue(search)}
                      >
                        {search}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Right: Trending products with quick-add */}
                <motion.div variants={itemVariants}>
                  <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-5">
                    <TrendingUp size={14} />
                    Trending Now
                  </h3>
                  <div className="space-y-4">
                    {productsForDisplay.map((product) => (
                      <TrendingProduct 
                        key={product.id} 
                        product={product} 
                        onClose={onClose} 
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
