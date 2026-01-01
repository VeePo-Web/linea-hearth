import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SubCategory {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href: string;
  subcategories?: SubCategory[];
}

interface MenuImage {
  src: string;
  alt: string;
  label: string;
}

interface MegaMenuProps {
  isOpen: boolean;
  activeDropdown: string | null;
  items: MenuItem[];
  images: MenuImage[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
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
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay: 0.2 },
  },
};

const MegaMenu = ({
  isOpen,
  activeDropdown,
  items,
  images,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) => {
  // Determine link destinations for images
  const getImageLink = (imageLabel: string) => {
    if (activeDropdown === "Shop") {
      if (imageLabel === "Hoodies") return "/category/hoodies";
      if (imageLabel === "Tees") return "/category/tees";
    } else if (activeDropdown === "About") {
      return "/about/our-story";
    }
    return "/";
  };

  return (
    <AnimatePresence>
      {isOpen && items.length > 0 && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              {/* Left side - Menu items with subcategories */}
              <div className="flex-1">
                <div className="flex gap-12">
                  {items.map((subItem, index) => (
                    <motion.div
                      key={index}
                      className="min-w-[140px]"
                      variants={itemVariants}
                    >
                      <Link
                        to={subItem.href}
                        className="group relative text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-medium block pb-3 border-b border-border/30 mb-3"
                      >
                        <span className="relative">
                          {subItem.name}
                          <motion.span
                            className="absolute -bottom-1 left-0 h-px bg-foreground origin-left"
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: "100%" }}
                          />
                        </span>
                      </Link>
                      {subItem.subcategories && subItem.subcategories.length > 0 && (
                        <ul className="space-y-2">
                          {subItem.subcategories.map((sub, subIndex) => (
                            <motion.li
                              key={subIndex}
                              variants={itemVariants}
                            >
                              <Link
                                to={sub.href}
                                className="group relative text-nav-foreground/70 hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-1"
                              >
                                <span className="relative">
                                  {sub.name}
                                  <motion.span
                                    className="absolute -bottom-0.5 left-0 h-px bg-foreground/50 origin-left"
                                    initial={{ scaleX: 0 }}
                                    whileHover={{ scaleX: 1 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ width: "100%" }}
                                  />
                                </span>
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right side - Images */}
              <div className="flex space-x-6">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    variants={imageVariants}
                    className="overflow-hidden"
                  >
                    <Link
                      to={getImageLink(image.label)}
                      className="w-[320px] h-[220px] cursor-pointer group relative overflow-hidden block"
                    >
                      <motion.img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <motion.div
                        className="absolute bottom-3 left-3 text-white text-xs font-light flex items-center gap-1.5"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span>{image.label}</span>
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight size={12} />
                        </motion.span>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
