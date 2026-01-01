import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Search, Heart, Instagram, Mail } from "lucide-react";

interface SubCategory {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href: string;
  subcategories?: SubCategory[];
}

interface NavItem {
  name: string;
  href: string;
  submenuItems: MenuItem[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onSearchOpen: () => void;
  onFavoritesOpen: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, delay: 0.2 },
  },
};

const panelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 40,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 40, letterSpacing: "0.3em" },
  visible: {
    opacity: 1,
    x: 0,
    letterSpacing: "0.15em",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 40,
    transition: { duration: 0.15 },
  },
};

const secondaryVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.5, duration: 0.3 },
  },
};

const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  onSearchOpen,
  onFavoritesOpen,
}: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-background z-50 flex flex-col"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            <motion.button
              className="absolute top-6 right-6 p-2 text-foreground hover:text-muted-foreground transition-colors"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={24} strokeWidth={1} />
            </motion.button>

            {/* Main navigation */}
            <div className="flex-1 flex flex-col justify-center px-8">
              <nav className="space-y-6">
                {navItems.map((item) => (
                  <motion.div key={item.name} variants={navItemVariants}>
                    <Link
                      to={item.href}
                      className="block text-3xl font-extralight text-foreground hover:text-muted-foreground transition-colors uppercase tracking-[0.2em]"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Divider */}
              <motion.div
                className="w-16 h-px bg-border my-10"
                variants={secondaryVariants}
              />

              {/* Secondary links */}
              <motion.div
                className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
                variants={secondaryVariants}
              >
                <Link
                  to="/about/our-story"
                  className="hover:text-foreground transition-colors"
                  onClick={onClose}
                >
                  Our Story
                </Link>
                <span className="text-border">·</span>
                <Link
                  to="/about/size-guide"
                  className="hover:text-foreground transition-colors"
                  onClick={onClose}
                >
                  Size Guide
                </Link>
                <span className="text-border">·</span>
                <Link
                  to="/about/customer-care"
                  className="hover:text-foreground transition-colors"
                  onClick={onClose}
                >
                  Care
                </Link>
              </motion.div>
            </div>

            {/* Bottom actions */}
            <motion.div
              className="px-8 py-8 border-t border-border"
              variants={secondaryVariants}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    className="p-3 border border-border hover:border-foreground transition-colors"
                    onClick={() => {
                      onClose();
                      setTimeout(onSearchOpen, 300);
                    }}
                    aria-label="Search"
                  >
                    <Search size={18} strokeWidth={1} />
                  </button>
                  <button
                    className="p-3 border border-border hover:border-foreground transition-colors"
                    onClick={() => {
                      onClose();
                      setTimeout(onFavoritesOpen, 300);
                    }}
                    aria-label="Favorites"
                  >
                    <Heart size={18} strokeWidth={1} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} strokeWidth={1} />
                  </a>
                  <a
                    href="mailto:hello@linea.com"
                    className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Email"
                  >
                    <Mail size={18} strokeWidth={1} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
