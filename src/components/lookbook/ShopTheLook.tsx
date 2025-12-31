import { Link } from "react-router-dom";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface ShopTheLookProps {
  products: LookProduct[];
  lookName: string;
}

const ShopTheLook = ({ products, lookName }: ShopTheLookProps) => {
  const { toast } = useToast();

  const totalPrice = products.reduce((sum, product) => {
    return sum + (product.is_on_sale && product.sale_price ? product.sale_price : product.price);
  }, 0);

  const handleAddAll = () => {
    toast({
      title: "Look Added",
      description: `"${lookName}" complete fit added to your bag.`,
    });
  };

  const handleQuickAdd = (productName: string) => {
    toast({
      title: "Added to Bag",
      description: `${productName} added to your bag.`,
    });
  };

  const getPositionLabel = (position: string | null) => {
    if (!position) return null;
    const labels: Record<string, string> = {
      hat: "HAT",
      top: "TOP",
      bottom: "BOTTOM",
      shoes: "SHOES",
      accessories: "ACC",
    };
    return labels[position.toLowerCase()] || position.toUpperCase();
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.slice(0, 4).map((product) => {
          const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
          const positionLabel = getPositionLabel(product.position);

          return (
            <div key={product.id} className="group relative">
              <Link to={`/product/${product.slug}`}>
                <div className="aspect-[3/4] bg-stone-800 rounded overflow-hidden relative">
                  {primaryImage && (
                    <img
                      src={primaryImage.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  
                  {/* Position Tag */}
                  {positionLabel && (
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-black/60 text-white px-2 py-1 rounded">
                      {positionLabel}
                    </span>
                  )}

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAdd(product.name);
                    }}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Quick add ${product.name}`}
                  >
                    <Plus className="w-4 h-4 text-stone-900" />
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="mt-2">
                <p className="text-xs text-white/90 font-light truncate">
                  {product.name}
                </p>
                <p className="text-xs text-white/60 font-light">
                  {product.is_on_sale && product.sale_price ? (
                    <>
                      <span className="text-amber-500">${product.sale_price}</span>
                      <span className="line-through ml-1">${product.price}</span>
                    </>
                  ) : (
                    `$${product.price}`
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Complete Look CTA */}
      <Button
        onClick={handleAddAll}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-light tracking-wide"
      >
        <ShoppingBag className="w-4 h-4 mr-2" />
        Add Complete Look — ${totalPrice.toFixed(0)}
      </Button>
    </div>
  );
};

export default ShopTheLook;
