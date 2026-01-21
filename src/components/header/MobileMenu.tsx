import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Search, Heart, Instagram, Mail, ChevronDown, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

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
  onAuthOpen: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, delay: 0.1 },
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
      staggerChildren: 0.06,
      delayChildren: 0.15,
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
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: 0.15 },
  },
};

const secondaryVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.4, duration: 0.3 },
  },
};

const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  onSearchOpen,
  onFavoritesOpen,
  onAuthOpen,
}: MobileMenuProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Account';

  const toggleExpand = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

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
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-background z-50 flex flex-col shadow-2xl"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header with logo and close */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <img src="/LINEA-1.svg" alt="LINEA" className="h-5 w-auto" />
              <motion.button
                className="p-2 text-foreground hover:text-muted-foreground transition-colors relative group"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
                  initial={false}
                />
                <X size={22} strokeWidth={1.5} className="relative z-10" />
              </motion.button>
            </div>

            {/* Main navigation */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <motion.div key={item.name} variants={navItemVariants}>
                    {item.submenuItems.length > 0 ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className="w-full flex items-center justify-between text-2xl font-light text-foreground hover:text-muted-foreground transition-colors uppercase tracking-[0.15em] py-3"
                        >
                          <span>{item.name}</span>
                          <motion.span
                            animate={{ rotate: expandedItem === item.name ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={20} strokeWidth={1.5} />
                          </motion.span>
                        </button>
                        
                        <AnimatePresence>
                          {expandedItem === item.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pb-4 space-y-3">
                                {item.submenuItems.map((subItem, idx) => (
                                  <motion.div
                                    key={subItem.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                  >
                                    <Link
                                      to={subItem.href}
                                      className="block text-base font-light text-muted-foreground hover:text-foreground transition-colors py-2"
                                      onClick={onClose}
                                    >
                                      {subItem.name}
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className="block text-2xl font-light text-foreground hover:text-muted-foreground transition-colors uppercase tracking-[0.15em] py-3"
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Divider */}
              <motion.div
                className="w-16 h-px bg-border my-8"
                variants={secondaryVariants}
              />

              {/* Secondary links */}
              <motion.div
                className="space-y-3"
                variants={secondaryVariants}
              >
                <Link
                  to="/about/our-story"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={onClose}
                >
                  Our Story
                </Link>
                <Link
                  to="/about/size-guide"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={onClose}
                >
                  Size Guide
                </Link>
                <Link
                  to="/about/customer-care"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={onClose}
                >
                  Customer Care
                </Link>
              </motion.div>
            </div>

            {/* Bottom actions */}
            <motion.div
              className="px-6 py-6 border-t border-border bg-secondary/30"
              variants={secondaryVariants}
            >
              {/* Action buttons */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-border hover:border-foreground hover:bg-muted/50 transition-all text-sm"
                  onClick={() => {
                    onClose();
                    setTimeout(onSearchOpen, 300);
                  }}
                  aria-label="Search"
                >
                  <Search size={16} strokeWidth={1.5} />
                  <span>Search</span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-border hover:border-foreground hover:bg-muted/50 transition-all text-sm"
                  onClick={() => {
                    onClose();
                    setTimeout(onFavoritesOpen, 300);
                  }}
                  aria-label="Favorites"
                >
                  <Heart size={16} strokeWidth={1.5} />
                  <span>Favorites</span>
                </button>
              </div>

              {/* Account + Social row */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link 
                      to="/account"
                      onClick={onClose}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
                    >
                      <User size={16} strokeWidth={1.5} />
                      <span>Hi, {firstName}</span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LogOut size={16} strokeWidth={1.5} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      onClose();
                      setTimeout(onAuthOpen, 300);
                    }}
                  >
                    <User size={16} strokeWidth={1.5} />
                    <span>Sign In</span>
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} strokeWidth={1.5} />
                  </a>
                  <a
                    href="mailto:hello@linea.com"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Email"
                  >
                    <Mail size={18} strokeWidth={1.5} />
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
