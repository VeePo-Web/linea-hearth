import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Clock, TrendingUp } from "lucide-react";

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

const trendingProducts = [
  { name: "Stay Holy Hoodie", category: "Hoodies", href: "/product/stay-holy-hoodie", image: "/products/stay-holy-hoodie/flat-front.png" },
  { name: "Heavenly Crewneck", category: "Tees", href: "/product/heavenly-crewneck", image: "/products/heavenly-crewneck/flat-lay.png" },
];

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

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

                {/* Right: Trending products */}
                <motion.div variants={itemVariants}>
                  <h3 className="flex items-center gap-2 text-foreground text-xs uppercase tracking-[0.15em] font-medium mb-5">
                    <TrendingUp size={14} />
                    Trending Now
                  </h3>
                  <div className="space-y-3">
                    {trendingProducts.map((product, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                      >
                        <Link
                          to={product.href}
                          className="flex items-center gap-4 group"
                          onClick={onClose}
                        >
                          <div className="w-16 h-16 bg-muted overflow-hidden">
                            <motion.img
                              src={product.image}
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
                            <p className="text-xs text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
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
