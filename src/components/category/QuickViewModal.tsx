import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { ProductCardData } from "./ProductCard";
import FavoriteButton from "@/components/favorites/FavoriteButton";

interface QuickViewModalProps {
  product: ProductCardData | null;
  open: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}

const QuickViewModal = ({ product, open, onClose, onAuthRequired }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when product changes
  useMemo(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    setCurrentImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const sortedImages = [...(product.product_images || [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  // Get unique sizes and colors
  const uniqueSizes = [
    ...new Set(
      (product.product_variants || [])
        .map((v) => v.size)
        .filter(Boolean) as string[]
    ),
  ];

  const uniqueColors = [
    ...new Set(
      (product.product_variants || [])
        .map((v) => v.color)
        .filter(Boolean) as string[]
    ),
  ];

  // Check stock for selected variant
  const getStockForVariant = (size?: string, color?: string) => {
    return (product.product_variants || [])
      .filter((v) => {
        if (size && v.size !== size) return false;
        if (color && v.color !== color) return false;
        return true;
      })
      .reduce((sum, v) => sum + v.stock_quantity, 0);
  };

  const currentStock = getStockForVariant(
    selectedSize || undefined,
    selectedColor || undefined
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const displayPrice = product.is_on_sale && product.sale_price
    ? product.sale_price
    : product.price;

  const canAddToCart =
    currentStock > 0 &&
    (uniqueSizes.length === 0 || selectedSize) &&
    (uniqueColors.length === 0 || selectedColor);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-background border-none overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{product.name} - Quick View</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 bg-white/80 hover:bg-white rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative aspect-square md:aspect-auto md:h-[500px] bg-muted/10">
            {sortedImages.length > 0 ? (
              <>
                <img
                  src={sortedImages[currentImageIndex]?.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Navigation arrows */}
                {sortedImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Thumbnails */}
                {sortedImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {sortedImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-foreground"
                            : "bg-foreground/30 hover:bg-foreground/50"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category */}
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
              {product.categories?.name}
            </p>

            {/* Name */}
            <h2 className="text-2xl font-light text-foreground mb-3">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mb-6">
              {product.is_on_sale && product.sale_price ? (
                <div className="flex items-center gap-3">
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xl font-medium text-amber-600">
                    {formatPrice(product.sale_price)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-light">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-light text-foreground mb-3 block">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const stockForSize = getStockForVariant(size, selectedColor || undefined);
                    const isAvailable = stockForSize > 0;

                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-sm border transition-colors ${
                          selectedSize === size
                            ? "border-foreground bg-foreground text-background"
                            : isAvailable
                            ? "border-border hover:border-foreground"
                            : "border-border/50 text-muted-foreground/50 line-through cursor-not-allowed"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-light text-foreground mb-3 block">
                  Color{selectedColor ? `: ${selectedColor}` : ""}
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => {
                    const stockForColor = getStockForVariant(selectedSize || undefined, color);
                    const isAvailable = stockForColor > 0;

                    return (
                      <button
                        key={color}
                        disabled={!isAvailable}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "ring-2 ring-offset-2 ring-foreground"
                            : isAvailable
                            ? "hover:ring-1 hover:ring-offset-1 hover:ring-foreground/50"
                            : "opacity-30 cursor-not-allowed"
                        }`}
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
                          borderColor:
                            color.toLowerCase() === "white" ? "#e5e5e5" : "transparent",
                        }}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-light text-foreground mb-3 block">
                Quantity
              </label>
              <div className="flex items-center border border-border w-fit">
                <button
                  className="p-2 hover:bg-muted/50 transition-colors disabled:opacity-50"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  className="p-2 hover:bg-muted/50 transition-colors disabled:opacity-50"
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock status */}
            {currentStock > 0 && currentStock < 5 && (
              <p className="text-sm text-amber-600 mb-4">
                Only {currentStock} left in stock
              </p>
            )}

            {currentStock === 0 && (
              <p className="text-sm text-red-500 mb-4">Out of stock</p>
            )}

            {/* Add to Cart */}
            <div className="mt-auto space-y-3">
              <Button
                className="w-full h-12 text-sm font-normal"
                disabled={!canAddToCart}
                onClick={() => {
                  // TODO: Add to cart logic
                  onClose();
                }}
              >
                {canAddToCart
                  ? `Add to Bag — ${formatPrice(displayPrice * quantity)}`
                  : currentStock === 0
                  ? "Out of Stock"
                  : "Select Options"}
              </Button>

              <div className="flex items-center justify-between">
                <Link
                  to={`/product/${product.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  onClick={onClose}
                >
                  View Full Details
                </Link>
                <FavoriteButton
                  productId={product.id}
                  variant="icon-with-text"
                  onAuthRequired={onAuthRequired}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
