import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Minus, Plus, Truck, RotateCcw } from "lucide-react";
import SizeSelector from "./SizeSelector";
import ColorSwatchSelector from "./ColorSwatchSelector";
import StyleSelector from "./StyleSelector";
import TestimonialSnippet from "./TestimonialSnippet";
import ProductFAQ from "./ProductFAQ";
import ShippingReturnsAccordion from "./ShippingReturnsAccordion";
import TryItOnButton from "./TryItOnButton";
import ScarcityBadge from "./ScarcityBadge";
import TextReveal from "@/components/motion/TextReveal";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";
import { useProductColors } from "@/hooks/useProductColors";
import { useProductStyles } from "@/hooks/useProductStyles";
import { getColorHex } from "@/lib/cartUtils";

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  style?: string | null;
  stock_quantity: number;
  price_adjustment: number | null;
}

interface Category {
  name: string;
  slug: string;
}

interface ProductInfoProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    is_on_sale: boolean;
    description?: string | null;
    material?: string | null;
    fit_type?: string | null;
    fabric_composition?: string | null;
    care_instructions?: string | null;
    common_questions?: { question: string; answer: string }[] | null;
    categories?: Category;
  };
  variants?: ProductVariant[];
  onColorChange?: (color: string) => void;
  onAuthRequired?: () => void;
  onAddToBag?: (details: { size: string | null; color: string | null; style: string | null; priceDelta: number; quantity: number }) => void;
}

const ProductInfo = ({ product, variants = [], onColorChange, onAuthRequired, onAddToBag }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Load persisted colors + styles for this product (admin-managed).
  const { colors: productColors } = useProductColors(product?.id);
  const { styles: productStyles } = useProductStyles(product?.id);

  // Print-on-demand: never gate on stock.
  const sizes = useMemo(() => {
    const sizeSet = new Set<string>();
    variants.forEach((v) => {
      if (!v.size) return;
      if (selectedColor && v.color?.toLowerCase() !== selectedColor.toLowerCase()) return;
      if (selectedStyle && v.style?.toLowerCase() !== selectedStyle.toLowerCase()) return;
      sizeSet.add(v.size);
    });
    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
    return Array.from(sizeSet)
      .map((size) => ({ size, stock: 999 }))
      .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));
  }, [variants, selectedColor, selectedStyle]);

  // Colors: prefer admin-managed product_colors; fall back to variant-derived.
  const colors = useMemo(() => {
    if (productColors.length > 0) {
      return productColors.map((c) => ({
        color: c.name.toLowerCase(),
        colorCode: c.hex,
        swatchImage: c.swatch_image_url || null,
        available: true,
      }));
    }
    const colorSet = new Set<string>();
    variants.forEach((v) => {
      if (v.color) colorSet.add(v.color.toLowerCase());
    });
    return Array.from(colorSet).map((color) => ({
      color,
      colorCode: getColorHex(color),
      swatchImage: null as string | null,
      available: true,
    }));
  }, [productColors, variants]);

  // Style-aware availability: which colors actually exist for the active style?
  // Returns null (= no restriction) for legacy products with no per-variant style data.
  const colorsForActiveStyle = useMemo<Set<string> | null>(() => {
    const hasAnyStyle = variants.some((v) => v.style);
    if (!hasAnyStyle || !selectedStyle) return null;
    const set = new Set<string>();
    variants.forEach((v) => {
      if (v.style?.toLowerCase() === selectedStyle.toLowerCase() && v.color) {
        set.add(v.color.toLowerCase());
      }
    });
    return set;
  }, [variants, selectedStyle]);

  // Style options (admin-managed). When 0/1, the selector hides itself.
  const styleOptions = useMemo(() => {
    return productStyles.map((s) => ({
      name: s.name,
      label: s.label,
      iconUrl: s.icon_url,
      priceDelta: s.price_delta,
      available: true,
    }));
  }, [productStyles]);

  // Auto-select color when only one option exists
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0].color);
      onColorChange?.(colors[0].color);
    }
  }, [colors]);

  // Auto-select style when only one option exists
  useEffect(() => {
    if (styleOptions.length === 1 && !selectedStyle) {
      setSelectedStyle(styleOptions[0].name);
    }
  }, [styleOptions]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reset size when color changes
    onColorChange?.(color);
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    setSelectedSize(null);
    // If the active color isn't carried by the new style's variant matrix,
    // clear it so the user must pick a valid color before adding to bag.
    const styleHasAnyVariants = variants.some((v) => v.style);
    if (styleHasAnyVariants && selectedColor) {
      const validColors = new Set(
        variants
          .filter((v) => v.style?.toLowerCase() === style.toLowerCase() && v.color)
          .map((v) => v.color!.toLowerCase())
      );
      if (validColors.size > 0 && !validColors.has(selectedColor.toLowerCase())) {
        setSelectedColor(null);
        onColorChange?.('');
      }
    }
  };

  // Calculate price (base ± selected style's delta)
  const basePrice = product?.is_on_sale && product?.sale_price
    ? product.sale_price
    : product?.price || 0;
  const activeStyleDelta = productStyles.find((s) => s.name === selectedStyle)?.price_delta || 0;
  const displayPrice = basePrice + activeStyleDelta;
  const totalPrice = displayPrice * quantity;

  // Check if can add to bag
  const canAddToBag = variants.length === 0 || (
    (colors.length === 0 || selectedColor) &&
    (styleOptions.length === 0 || selectedStyle) &&
    (sizes.length === 0 || selectedSize)
  );

  // Fallback data for display
  const productName = product?.name || "Product";
  const categoryName = product?.categories?.name || "Collection";
  const categorySlug = product?.categories?.slug || "all";

  // Animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: easing.editorial,
      }
    })
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      }
    }
  };

  const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;
  const staggerItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween" as const,
        duration: 0.3,
        ease: editorialEase,
      }
    }
  };

  const trustSignals = [
    { icon: Truck, label: "Free shipping $250+" },
    { icon: RotateCcw, label: "Easy 30-day returns" },
  ];

  if (prefersReducedMotion) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb - Show only on desktop */}
        <div className="hidden lg:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-xs font-light">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/category/${categorySlug}`} className="text-xs font-light">
                    {categoryName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-light">{productName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Static content for reduced motion */}
        <div className="space-y-3">
          <p className="text-xs font-light text-muted-foreground uppercase tracking-[0.15em]">
            {categoryName}
          </p>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl lg:text-3xl font-light text-foreground leading-tight">
              {productName}
            </h1>
            <div className="text-right flex-shrink-0">
              {product?.is_on_sale && product?.sale_price ? (
                <div className="space-y-0.5">
                  <p className="text-xl font-light text-foreground">${displayPrice.toFixed(2)}</p>
                  <p className="text-sm font-light text-muted-foreground line-through">${(product.price + activeStyleDelta).toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-xl font-light text-foreground">${displayPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>

        <TestimonialSnippet productId={product?.id} />
        {styleOptions.length > 1 && <StyleSelector styles={styleOptions} selectedStyle={selectedStyle} onStyleChange={handleStyleChange} />}
        {colors.length > 0 && <ColorSwatchSelector colors={colors} selectedColor={selectedColor} onColorChange={handleColorChange} availableColorNames={colorsForActiveStyle} />}
        {sizes.length > 0 && <SizeSelector sizes={sizes} selectedSize={selectedSize} onSizeChange={setSelectedSize} />}

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-light text-foreground">Quantity</span>
            <div className="flex items-center border border-border">
              <Button variant="ghost" size="sm" onClick={decrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">{quantity}</span>
              <Button variant="ghost" size="sm" onClick={incrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScarcityBadge productId={product?.id} size={selectedSize} />

          <Button id="main-add-to-bag" disabled={!canAddToBag} onClick={() => onAddToBag?.({ size: selectedSize, color: selectedColor, style: selectedStyle, priceDelta: activeStyleDelta, quantity })} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none disabled:opacity-50 disabled:cursor-not-allowed">
            Add to Bag — ${totalPrice.toFixed(2)}
          </Button>

          <FavoriteButton
            productId={product?.id || ""}
            variant="icon-with-text"
            onAuthRequired={onAuthRequired}
            className="w-full justify-center"
          />

          {/* TryItOnButton hidden until try-on room is ready */}

          <div className="flex items-center justify-center gap-6 py-3 text-xs font-light text-muted-foreground">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductFAQ commonQuestions={product?.common_questions} fitType={product?.fit_type} fabricComposition={product?.fabric_composition} careInstructions={product?.care_instructions} />
        <ShippingReturnsAccordion />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb - Show only on desktop */}
      <motion.div 
        className="hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-xs font-light">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/category/${categorySlug}`} className="text-xs font-light">
                  {categoryName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-light">{productName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Category Badge + Title + Price */}
      <div className="space-y-3">
        <motion.p 
          className="text-xs font-light text-muted-foreground uppercase tracking-[0.15em]"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {categoryName}
        </motion.p>
        <div className="flex justify-between items-start gap-4">
          <TextReveal 
            text={productName}
            as="h1"
            className="text-2xl lg:text-3xl font-light text-foreground leading-tight"
            delay={0.1}
          />
          <motion.div 
            className="text-right flex-shrink-0"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            {product?.is_on_sale && product?.sale_price ? (
              <div className="space-y-0.5">
                <p className="text-xl font-light text-foreground">
                  ${displayPrice.toFixed(2)}
                </p>
                <p className="text-sm font-light text-muted-foreground line-through">
                  ${(product.price + activeStyleDelta).toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-light text-foreground">
                ${displayPrice.toFixed(2)}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Testimonial Snippet */}
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        custom={0.4}
      >
        <TestimonialSnippet productId={product?.id} />
      </motion.div>

      {/* Style Selector (only when >1 styles offered) */}
      <AnimatePresence>
        {styleOptions.length > 1 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <StyleSelector
              styles={styleOptions}
              selectedStyle={selectedStyle}
              onStyleChange={handleStyleChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Selector with stagger animation */}
      <AnimatePresence>
        {colors.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <ColorSwatchSelector
              colors={colors}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
              availableColorNames={colorsForActiveStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Selector with stagger animation */}
      <AnimatePresence>
        {sizes.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <SizeSelector
              sizes={sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quantity and Add to Cart */}
      <motion.div 
        className="space-y-4 pt-4"
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        custom={0.5}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">Quantity</span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <motion.span 
              key={quantity}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border"
            >
              {quantity}
            </motion.span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScarcityBadge productId={product?.id} size={selectedSize} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: canAddToBag ? 1.01 : 1 }}
          whileTap={{ scale: canAddToBag ? 0.99 : 1 }}
          transition={{ delay: 0.6, duration: 0.4, ease: easing.editorial }}
        >
          <Button 
            id="main-add-to-bag"
            disabled={!canAddToBag}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            onClick={() => onAddToBag?.({ size: selectedSize, color: selectedColor, style: selectedStyle, priceDelta: activeStyleDelta, quantity })}
          >
            Add to Bag — ${totalPrice.toFixed(2)}
          </Button>
        </motion.div>

        {/* Save to Favorites Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          <FavoriteButton
            productId={product?.id || ""}
            variant="icon-with-text"
            onAuthRequired={onAuthRequired}
            className="w-full justify-center"
          />
        </motion.div>

        {/* Try It On Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {/* TryItOnButton hidden until try-on room is ready */}
        </motion.div>

        {/* Trust Row with stagger */}
        <motion.div 
          className="flex items-center justify-center gap-6 py-3 text-xs font-light text-muted-foreground"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {trustSignals.map(({ icon: Icon, label }, index) => (
            <motion.div 
              key={label} 
              className="flex items-center gap-1.5"
              variants={staggerItemVariants}
              custom={index}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Common Questions FAQ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <ProductFAQ 
          commonQuestions={product?.common_questions}
          fitType={product?.fit_type}
          fabricComposition={product?.fabric_composition}
          careInstructions={product?.care_instructions}
        />
      </motion.div>

      {/* Shipping & Returns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <ShippingReturnsAccordion />
      </motion.div>
    </div>
  );
};

export default ProductInfo;
