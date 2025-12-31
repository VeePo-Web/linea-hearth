import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Minus, Plus, Check, Truck, RotateCcw, Heart } from "lucide-react";
import SizeSelector from "./SizeSelector";
import ColorSwatchSelector from "./ColorSwatchSelector";
import TestimonialSnippet from "./TestimonialSnippet";
import ProductFAQ from "./ProductFAQ";
import ShippingReturnsAccordion from "./ShippingReturnsAccordion";
import TryItOnButton from "./TryItOnButton";

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
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
}

// Color code mapping
const colorCodes: Record<string, string> = {
  black: "#1a1a1a",
  white: "#ffffff",
  navy: "#1e3a5f",
  gray: "#6b7280",
  natural: "#f5f5dc",
  gold: "#d4af37",
  charcoal: "#36454f",
  burgundy: "#800020",
  forest: "#228b22",
  cream: "#fffdd0",
};

const ProductInfo = ({ product, variants = [], onColorChange }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Extract unique sizes with stock
  const sizes = useMemo(() => {
    const sizeMap = new Map<string, number>();
    variants.forEach((v) => {
      if (v.size) {
        const currentStock = sizeMap.get(v.size) || 0;
        // If color is selected, only count stock for that color
        if (selectedColor) {
          if (v.color?.toLowerCase() === selectedColor.toLowerCase()) {
            sizeMap.set(v.size, currentStock + v.stock_quantity);
          }
        } else {
          sizeMap.set(v.size, currentStock + v.stock_quantity);
        }
      }
    });
    
    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
    return Array.from(sizeMap.entries())
      .map(([size, stock]) => ({ size, stock }))
      .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));
  }, [variants, selectedColor]);

  // Extract unique colors with availability
  const colors = useMemo(() => {
    const colorSet = new Set<string>();
    variants.forEach((v) => {
      if (v.color) colorSet.add(v.color.toLowerCase());
    });
    
    return Array.from(colorSet).map((color) => {
      const hasStock = variants.some(
        (v) => v.color?.toLowerCase() === color && v.stock_quantity > 0
      );
      return {
        color,
        colorCode: colorCodes[color] || "#cccccc",
        available: hasStock,
      };
    });
  }, [variants]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reset size when color changes
    onColorChange?.(color);
  };

  // Calculate price
  const displayPrice = product?.is_on_sale && product?.sale_price 
    ? product.sale_price 
    : product?.price || 0;
  const totalPrice = displayPrice * quantity;

  // Check if can add to bag
  const canAddToBag = variants.length === 0 || (
    (colors.length === 0 || selectedColor) && 
    (sizes.length === 0 || selectedSize)
  );

  // Fallback data for display
  const productName = product?.name || "Product";
  const categoryName = product?.categories?.name || "Collection";
  const categorySlug = product?.categories?.slug || "all";

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

      {/* Category Badge + Title + Price */}
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
                <p className="text-xl font-light text-foreground">
                  ${product.sale_price.toFixed(2)}
                </p>
                <p className="text-sm font-light text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-light text-foreground">
                ${(product?.price || 0).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Testimonial Snippet */}
      <TestimonialSnippet productId={product?.id} />

      {/* Color Selector */}
      {colors.length > 0 && (
        <ColorSwatchSelector
          colors={colors}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
        />
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <SizeSelector
          sizes={sizes}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
        />
      )}

      {/* Quantity and Add to Cart */}
      <div className="space-y-4 pt-4">
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
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
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

        <Button 
          id="main-add-to-bag"
          disabled={!canAddToBag}
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Bag — ${totalPrice.toFixed(2)}
        </Button>

        {/* Try It On Button */}
        <TryItOnButton
          productId={product?.id || ""}
          productSlug={product?.slug || ""}
          productName={productName}
          productPrice={displayPrice}
          categorySlug={categorySlug}
        />

        {/* Trust Row */}
        <div className="flex items-center justify-center gap-6 py-3 text-xs font-light text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Free shipping $75+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Easy 30-day returns</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Made with purpose</span>
          </div>
        </div>
      </div>

      {/* Common Questions FAQ */}
      <ProductFAQ 
        commonQuestions={product?.common_questions}
        fitType={product?.fit_type}
        fabricComposition={product?.fabric_composition}
        careInstructions={product?.care_instructions}
      />

      {/* Shipping & Returns */}
      <ShippingReturnsAccordion />
    </div>
  );
};

export default ProductInfo;
