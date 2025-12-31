import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductImage {
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface ProductVariant {
  size: string | null;
  color: string | null;
  stock_quantity: number;
}

interface ProductCategory {
  name: string;
  slug: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  created_at: string;
  categories?: ProductCategory;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

interface ProductCardProps {
  product: ProductCardData;
  onQuickView?: (product: ProductCardData) => void;
  index?: number;
}

const ProductCard = ({ product, onQuickView, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get primary and secondary images
  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => a.display_order - b.display_order
  );
  const primaryImage = sortedImages.find((img) => img.is_primary) || sortedImages[0];
  const secondaryImage = sortedImages.find((img) => !img.is_primary && img !== primaryImage);

  // Calculate total stock
  const totalStock = (product.product_variants || []).reduce(
    (sum, v) => sum + v.stock_quantity,
    0
  );

  // Check if product is new (created within last 14 days)
  const isNew = new Date(product.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Get unique colors
  const uniqueColors = [
    ...new Set(
      (product.product_variants || [])
        .map((v) => v.color)
        .filter(Boolean) as string[]
    ),
  ];

  // Determine badges
  const badges: { label: string; className: string }[] = [];
  if (isNew) {
    badges.push({ label: "NEW", className: "bg-foreground text-background" });
  }
  if (product.is_on_sale && product.sale_price) {
    badges.push({ label: "SALE", className: "bg-amber-500 text-white" });
  }
  if (totalStock > 0 && totalStock < 3) {
    badges.push({ label: "ALMOST GONE", className: "bg-red-500 text-white" });
  } else if (totalStock > 0 && totalStock < 5) {
    badges.push({ label: "LOW STOCK", className: "bg-orange-500 text-white" });
  }

  // Check if single variant for quick add
  const isSingleVariant = (product.product_variants || []).length <= 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Card
      className="border-none shadow-none bg-transparent group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <Link to={`/product/${product.slug}`}>
          <div className="aspect-[3/4] mb-3 overflow-hidden bg-muted/10 relative">
            {/* Primary Image */}
            {primaryImage && (
              <img
                src={primaryImage.image_url}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered && secondaryImage ? "opacity-0" : "opacity-100"
                }`}
              />
            )}

            {/* Secondary Image (hover) */}
            {secondaryImage && (
              <img
                src={secondaryImage.image_url}
                alt={`${product.name} lifestyle`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Fallback if no images */}
            {!primaryImage && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No image</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/[0.02]" />

            {/* Badges */}
            {badges.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-[10px] font-medium tracking-wider ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Actions (hover) */}
            <div
              className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 bg-white/95 hover:bg-white text-foreground text-xs h-9"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView?.(product);
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Quick View
              </Button>
              {isSingleVariant && totalStock > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-foreground/95 hover:bg-foreground text-background text-xs h-9 px-3"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // TODO: Add to cart
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="space-y-1.5">
          {/* Category */}
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-light">
            {product.categories?.name || "Uncategorized"}
          </p>

          {/* Name & Price Row */}
          <div className="flex justify-between items-start gap-2">
            <Link to={`/product/${product.slug}`}>
              <h3 className="text-sm font-medium text-foreground hover:underline leading-tight">
                {product.name}
              </h3>
            </Link>
            <div className="text-right shrink-0">
              {product.is_on_sale && product.sale_price ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-light text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-medium text-amber-600">
                    {formatPrice(product.sale_price)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-light text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Color Swatches */}
          {uniqueColors.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1">
              {uniqueColors.slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="w-3.5 h-3.5 rounded-full border border-border"
                  style={{
                    backgroundColor:
                      color.toLowerCase() === "black"
                        ? "#1a1a1a"
                        : color.toLowerCase() === "white"
                        ? "#ffffff"
                        : color.toLowerCase() === "navy"
                        ? "#1e3a5f"
                        : color.toLowerCase() === "gray" || color.toLowerCase() === "grey"
                        ? "#6b7280"
                        : color.toLowerCase() === "natural"
                        ? "#f5f0e6"
                        : color.toLowerCase() === "gold"
                        ? "#d4af37"
                        : color,
                  }}
                  title={color}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{uniqueColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
