import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import CartDrawer from "@/components/cart/CartDrawer";
import NavLink from "./NavLink";
import MegaMenu from "./MegaMenu";
import SearchOverlay from "./SearchOverlay";
import MobileMenu from "./MobileMenu";

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { itemCount, openCart, addItem, items } = useCart();

  useEffect(() => {
    if (items.length === 0) {
      addItem({
        id: 1,
        name: "Stay Holy Hoodie",
        price: 79.99,
        priceFormatted: "$79.99",
        image: "/products/stay-holy-hoodie/flat-front.png",
        category: "Hoodies"
      });
      addItem({
        id: 2,
        name: "Heavenly Crewneck",
        price: 49.99,
        priceFormatted: "$49.99",
        image: "/products/heavenly-crewneck/flat-lay.png",
        category: "Tees"
      });
    }
  }, []);

  useEffect(() => {
    const imagesToPreload = [
      "/products/stay-holy-hoodie/flat-front.png",
      "/products/heavenly-crewneck/flat-lay.png",
      "/founders.png"
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const navItems = [
    {
      name: "Shop",
      href: "/category/shop",
      submenuItems: [
        { name: "Bottoms", href: "/category/bottoms", subcategories: [{ name: "Shorts", href: "/category/shorts" }, { name: "Joggers", href: "/category/joggers" }, { name: "Sweatpants", href: "/category/sweatpants" }] },
        { name: "Tees", href: "/category/tees", subcategories: [{ name: "Short Sleeve", href: "/category/short-sleeve" }, { name: "Long Sleeve", href: "/category/long-sleeve" }, { name: "Cropped", href: "/category/cropped" }] },
        { name: "Hoodies", href: "/category/hoodies", subcategories: [{ name: "Pullover Hoodies", href: "/category/pullover-hoodies" }, { name: "Zip-Up Hoodies", href: "/category/zip-up-hoodies" }, { name: "Crewnecks", href: "/category/crewnecks" }, { name: "Quarter Zips", href: "/category/quarter-zips" }, { name: "Lightweight Hoodies", href: "/category/lightweight-hoodies" }] },
        { name: "Hats", href: "/category/hats", subcategories: [{ name: "Snapbacks", href: "/category/snapbacks" }, { name: "Dad Hats", href: "/category/dad-hats" }, { name: "Beanies", href: "/category/beanies" }] },
        { name: "Accessories", href: "/category/accessories", subcategories: [{ name: "Bags", href: "/category/bags" }, { name: "Socks", href: "/category/socks" }, { name: "Stickers", href: "/category/stickers" }] }
      ],
      images: [
        { src: "/products/stay-holy-hoodie/flat-front.png", alt: "Hoodies Collection", label: "Hoodies" },
        { src: "/products/heavenly-crewneck/flat-lay.png", alt: "Tees Collection", label: "Tees" }
      ]
    },
    { name: "Lookbook", href: "/lookbook", submenuItems: [], images: [] },
    { name: "Community", href: "/community", submenuItems: [], images: [] },
    {
      name: "About",
      href: "/about/our-story",
      submenuItems: [
        { name: "Our Story", href: "/about/our-story", subcategories: [] },
        { name: "Size Guide", href: "/about/size-guide", subcategories: [] },
        { name: "Customer Care", href: "/about/customer-care", subcategories: [] }
      ],
      images: [{ src: "/founders.png", alt: "Company Founders", label: "Read our story" }]
    }
  ];

  const currentDropdownData = navItems.find(item => item.name === activeDropdown);

  return (
    <nav className="relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile hamburger */}
        <motion.button
          className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-5 h-5 relative">
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2.5' : 'top-1.5'}`} />
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2.5' : 'top-3.5'}`} />
          </div>
        </motion.button>

        {/* Left navigation */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div key={item.name} className="relative" onMouseEnter={() => setActiveDropdown(item.name)} onMouseLeave={() => setActiveDropdown(null)}>
              <NavLink href={item.href}>{item.name}</NavLink>
            </div>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="block">
            <img src="/LINEA-1.svg" alt="LINEA" className="h-6 w-auto" />
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-2">
          <motion.button className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200" aria-label="Search" onClick={() => setIsSearchOpen(!isSearchOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </motion.button>
          <motion.button className="hidden lg:block p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200" aria-label="Favorites" onClick={() => setOffCanvasType('favorites')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </motion.button>
          <motion.button className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative" aria-label="Shopping bag" onClick={openCart} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {itemCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-black pointer-events-none">
                {itemCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mega Menu */}
      <MegaMenu isOpen={!!activeDropdown && !!currentDropdownData?.submenuItems.length} activeDropdown={activeDropdown} items={currentDropdownData?.submenuItems || []} images={currentDropdownData?.images || []} onMouseEnter={() => setActiveDropdown(activeDropdown)} onMouseLeave={() => setActiveDropdown(null)} />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} navItems={navItems} onSearchOpen={() => setIsSearchOpen(true)} onFavoritesOpen={() => setOffCanvasType('favorites')} />

      {/* Cart Drawer */}
      <CartDrawer onViewFavorites={() => setOffCanvasType('favorites')} />

      {/* Favorites Off-canvas */}
      {offCanvasType === 'favorites' && (
        <div className="fixed inset-0 z-50 h-screen">
          <div className="absolute inset-0 bg-black/50 h-screen" onClick={() => setOffCanvasType(null)} />
          <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-light text-foreground">Your Favorites</h2>
              <button onClick={() => setOffCanvasType(null)} className="p-2 text-foreground hover:text-muted-foreground transition-colors" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm mb-6">Save your favorite items to view them later.</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
