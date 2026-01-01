import { ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import CartDrawer from "@/components/cart/CartDrawer";

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { itemCount, openCart, addItem, items } = useCart();

  // Initialize cart with demo items if empty (for demo purposes)
  useEffect(() => {
    if (items.length === 0) {
      // Add demo items to cart
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
  }, []); // Only run once on mount

  // Preload dropdown images for faster display
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

  const popularSearches = [
    "Stay Holy",
    "Heavenly Crewneck",
    "Black Hoodies",
    "Premium Tees",
    "New Arrivals",
    "Best Sellers"
  ];

  const navItems = [
    {
      name: "Shop",
      href: "/category/shop",
      submenuItems: [
        { 
          name: "Bottoms", 
          href: "/category/bottoms",
          subcategories: [
            { name: "Shorts", href: "/category/shorts" },
            { name: "Joggers", href: "/category/joggers" },
            { name: "Sweatpants", href: "/category/sweatpants" }
          ]
        },
        { 
          name: "Tees", 
          href: "/category/tees",
          subcategories: [
            { name: "Short Sleeve", href: "/category/short-sleeve" },
            { name: "Long Sleeve", href: "/category/long-sleeve" },
            { name: "Cropped", href: "/category/cropped" }
          ]
        },
        { 
          name: "Hoodies", 
          href: "/category/hoodies",
          subcategories: [
            { name: "Pullover Hoodies", href: "/category/pullover-hoodies" },
            { name: "Zip-Up Hoodies", href: "/category/zip-up-hoodies" },
            { name: "Crewnecks", href: "/category/crewnecks" },
            { name: "Quarter Zips", href: "/category/quarter-zips" },
            { name: "Lightweight Hoodies", href: "/category/lightweight-hoodies" }
          ]
        },
        { 
          name: "Hats", 
          href: "/category/hats",
          subcategories: [
            { name: "Snapbacks", href: "/category/snapbacks" },
            { name: "Dad Hats", href: "/category/dad-hats" },
            { name: "Beanies", href: "/category/beanies" }
          ]
        },
        { 
          name: "Accessories", 
          href: "/category/accessories",
          subcategories: [
            { name: "Bags", href: "/category/bags" },
            { name: "Socks", href: "/category/socks" },
            { name: "Stickers", href: "/category/stickers" }
          ]
        }
      ],
      images: [
        { src: "/products/stay-holy-hoodie/flat-front.png", alt: "Hoodies Collection", label: "Hoodies" },
        { src: "/products/heavenly-crewneck/flat-lay.png", alt: "Tees Collection", label: "Tees" }
      ]
    },
    {
      name: "Lookbook",
      href: "/lookbook",
      submenuItems: [],
      images: []
    },
    {
      name: "Community",
      href: "/community",
      submenuItems: [],
      images: []
    },
    {
      name: "About",
      href: "/about/our-story",
      submenuItems: [
        { name: "Our Story", href: "/about/our-story", subcategories: [] },
        { name: "Size Guide", href: "/about/size-guide", subcategories: [] },
        { name: "Customer Care", href: "/about/customer-care", subcategories: [] }
      ],
      images: [
        { src: "/founders.png", alt: "Company Founders", label: "Read our story" }
      ]
    }
  ];

  return (
    <nav
      className="relative"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile hamburger button */}
        <button
          className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-5 relative">
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-2.5' : 'top-1.5'
              }`}></span>
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-2.5' : 'top-3.5'
              }`}></span>
          </div>
        </button>

        {/* Left navigation - Hidden on tablets and mobile */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="block">
            <img
              src="/LINEA-1.svg"
              alt="LINEA"
              className="h-6 w-auto"
            />
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          <button
            className="hidden lg:block p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Favorites"
            onClick={() => setOffCanvasType('favorites')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
            onClick={openCart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-black pointer-events-none">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Full width dropdown */}
      {activeDropdown && (
        <div
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              {/* Left side - Menu items with subcategories */}
              <div className="flex-1">
                <div className="flex gap-12">
                  {navItems
                    .find(item => item.name === activeDropdown)
                    ?.submenuItems.map((subItem, index) => (
                      <div key={index} className="min-w-[140px]">
                        <Link
                          to={subItem.href}
                          className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-medium block pb-3 border-b border-border/30 mb-3"
                        >
                          {subItem.name}
                        </Link>
                        {subItem.subcategories && subItem.subcategories.length > 0 && (
                          <ul className="space-y-2">
                            {subItem.subcategories.map((sub, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  to={sub.href}
                                  className="text-nav-foreground/70 hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-1"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Right side - Images */}
              <div className="flex space-x-6">
                {navItems
                  .find(item => item.name === activeDropdown)
                  ?.images.map((image, index) => {
                    // Determine the link destination based on dropdown and image
                    let linkTo = "/";
                    if (activeDropdown === "Shop") {
                      if (image.label === "Hoodies") linkTo = "/category/hoodies";
                      else if (image.label === "Tees") linkTo = "/category/tees";
                    } else if (activeDropdown === "About") {
                      linkTo = "/about/our-story";
                    }

                    return (
                      <Link key={index} to={linkTo} className="w-[280px] h-[200px] cursor-pointer group relative overflow-hidden block">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                        />
                        {(activeDropdown === "Shop" || activeDropdown === "About") && (
                          <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                            <span>{image.label}</span>
                            <ArrowRight size={12} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          className="absolute top-full left-0 right-0 bg-nav border-b border-border z-50"
        >
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              {/* Search input */}
              <div className="relative mb-8">
                <div className="flex items-center border-b border-border pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-nav-foreground mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for apparel..."
                    className="flex-1 bg-transparent text-nav-foreground placeholder:text-nav-foreground/60 outline-none text-lg"
                    autoFocus
                  />
                </div>
              </div>

              {/* Popular searches */}
              <div>
                <h3 className="text-nav-foreground text-sm font-light mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="text-nav-foreground hover:text-nav-hover text-sm font-light py-2 px-4 border border-border rounded-full transition-colors duration-200 hover:border-nav-hover"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-nav border-b border-border z-50 max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-8">
            <div className="space-y-6">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-lg font-light block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  <div className="mt-3 pl-4 space-y-4">
                    {item.submenuItems.map((subItem, subIndex) => (
                      <div key={subIndex}>
                        <Link
                          to={subItem.href}
                          className="text-nav-foreground hover:text-nav-hover text-sm font-medium block py-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                        {subItem.subcategories && subItem.subcategories.length > 0 && (
                          <div className="pl-3 mt-2 space-y-1">
                            {subItem.subcategories.map((sub, idx) => (
                              <Link
                                key={idx}
                                to={sub.href}
                                className="text-nav-foreground/60 hover:text-nav-hover text-xs font-light block py-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Component */}
      <CartDrawer
        onViewFavorites={() => {
          setOffCanvasType('favorites');
        }}
      />

      {/* Favorites Off-canvas overlay */}
      {offCanvasType === 'favorites' && (
        <div className="fixed inset-0 z-50 h-screen">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 h-screen"
            onClick={() => setOffCanvasType(null)}
          />

          {/* Off-canvas panel */}
          <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-light text-foreground">Your Favorites</h2>
              <button
                onClick={() => setOffCanvasType(null)}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-muted-foreground text-sm mb-6">
                You haven't added any favorites yet. Browse our collection and click the heart icon to save items you love.
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
