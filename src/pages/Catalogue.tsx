import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import CollectionHero from "@/components/category/CollectionHero";
import ProductCard, { ProductCardData } from "@/components/category/ProductCard";
import QuickViewModal from "@/components/category/QuickViewModal";
import AuthModal from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";

interface Product extends ProductCardData {
  is_featured: boolean;
}

type SortOption = "newest" | "price-asc" | "price-desc" | "featured";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  featured: "Featured",
};

const Catalogue = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardData | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["catalogue-all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, price, sale_price, is_on_sale, is_featured, status, material, created_at,
          categories:category_id ( name, slug ),
          product_images ( image_url, is_primary, display_order ),
          product_variants ( size, color, stock_quantity )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Product[];
    },
  });

  // Unique categories from products
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => {
      if (p.categories) seen.set(p.categories.slug, p.categories.name);
    });
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categories?.slug === selectedCategory);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case "featured":
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      default:
        break;
    }

    return list;
  }, [products, selectedCategory, sort]);

  return (
    <Layout>
      <Helmet>
        <title>Shop All | Line of Judah</title>
        <meta
          name="description"
          content="Browse the full Line of Judah catalogue — premium faith-based streetwear. Filter by category and find your fit."
        />
        <link rel="canonical" href="https://lineofjudah.clothing/catalogue" />
        <meta property="og:title" content="Shop All | Line of Judah" />
        <meta property="og:url" content="https://lineofjudah.clothing/catalogue" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <CollectionHero category="shop" productCount={isLoading ? 0 : filtered.length} />


        {/* Toolbar */}
        <div className="bg-background border-b border-border">
          <div className="px-4 xs:px-6 md:px-12 lg:px-16 flex items-center justify-between h-12 gap-4">
            {/* Category pills — desktop */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`shrink-0 px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors border rounded-full ${
                  selectedCategory === "all"
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`shrink-0 px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors border rounded-full ${
                    selectedCategory === cat.slug
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile filter button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-foreground"
            >
              <SlidersHorizontal size={14} />
              Filter
              {selectedCategory !== "all" && (
                <span className="ml-1 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative ml-auto shrink-0">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {SORT_LABELS[sort]}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-lg z-30"
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSort(opt);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-[11px] tracking-[0.15em] uppercase transition-colors hover:bg-secondary ${
                          sort === opt ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {SORT_LABELS[opt]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-overlay"
                onClick={() => setFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="fixed left-0 top-0 h-full w-72 bg-background z-drawer flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <span className="text-[11px] tracking-[0.3em] uppercase">Filter</span>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                    Category
                  </p>
                  <div className="space-y-1">
                    {[{ slug: "all", name: "All" }, ...categories].map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setFiltersOpen(false);
                        }}
                        className={`w-full text-left py-2.5 text-sm transition-colors ${
                          selectedCategory === cat.slug
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="px-4 xs:px-6 md:px-12 lg:px-16 py-10">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary rounded-sm mb-3" />
                  <div className="h-3 bg-secondary rounded w-2/3 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                Nothing yet
              </p>
              <p className="text-2xl font-light text-foreground">Coming soon.</p>
              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="mt-8 text-xs tracking-[0.2em] uppercase underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all products
                </button>
              )}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.32) }}
                  >
                    <ProductCard
                      product={product}
                      index={i}
                      onQuickView={setQuickViewProduct}
                      onAuthRequired={() => setIsAuthModalOpen(true)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAuthRequired={() => setIsAuthModalOpen(true)}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </Layout>
  );
};

export default Catalogue;
