import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTryOnState, EquippedItem } from '@/hooks/useTryOnState';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { getTextureImageUrl } from '@/components/try-on/hooks/useGarmentTexture';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  slot: 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear' | null;
}

const slotToCategoryMap: Record<string, string[]> = {
  head: ['caps', 'hats', 'headwear', 'beanies'],
  top: ['t-shirts', 'shirts', 'tops', 'tees'],
  outerwear: ['hoodies', 'jackets', 'sweaters', 'outerwear'],
  bottom: ['pants', 'jeans', 'shorts', 'bottoms'],
  footwear: ['shoes', 'sneakers', 'boots', 'footwear'],
};

export const ProductDrawer = ({ isOpen, onClose, slot }: ProductDrawerProps) => {
  const { equipItem, equippedItems } = useTryOnState();
  const [selectedSize, setSelectedSize] = useState<string>('M');

  const { data: products, isLoading } = useQuery({
    queryKey: ['try-on-products', slot],
    queryFn: async () => {
      if (!slot) return [];
      
      // Get categories for this slot
      const categoryMatches = slotToCategoryMap[slot] || [];
      
      // First, get matching category IDs
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, slug')
        .or(categoryMatches.map(c => `slug.ilike.%${c}%`).join(','));
      
      if (catError) {
        console.error('Error fetching categories:', catError);
      }
      
      const categoryIds = categories?.map(c => c.id) || [];
      
      // If we have matching categories, filter by them; otherwise get all active products
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          slug,
          category_id,
          product_images (
            image_url,
            is_primary
          ),
          product_variants (
            id,
            size,
            color,
            stock_quantity
          )
        `)
        .eq('status', 'active');
      
      // Filter by category if we have matches
      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }
      
      const { data, error } = await query.limit(12);

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!slot,
  });

  const handleSelectProduct = (product: any) => {
    if (!slot) return;

    const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
      || product.product_images?.[0]?.image_url;
    
    // Get texture-optimized image (flat-front) for 3D rendering
    const textureImage = getTextureImageUrl(product.product_images, product.name);

    const item: EquippedItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: 'Default',
      imageUrl: primaryImage,
      textureUrl: textureImage,  // Use flat-front image for 3D textures
      productImages: product.product_images,
    };

    equipItem(slot, item);
    onClose();
  };

  const isEquipped = (productId: string) => {
    return slot && equippedItems[slot]?.productId === productId;
  };

  const slotLabels: Record<string, string> = {
    head: 'Select Headwear',
    top: 'Select a Top',
    outerwear: 'Select a Layer',
    bottom: 'Select Bottoms',
    footwear: 'Select Footwear',
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-light">
            {slot ? slotLabels[slot] : 'Select Item'}
          </SheetTitle>
        </SheetHeader>

        {/* Size Quick Select */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Size
          </div>
          <div className="flex gap-2">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-4 py-2 text-sm border transition-all duration-200",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products?.map((product: any) => {
              const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
                || product.product_images?.[0]?.image_url;
              const equipped = isEquipped(product.id);

              return (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={cn(
                    "group relative text-left transition-all duration-200",
                    equipped && "ring-2 ring-foreground"
                  )}
                >
                  <div className="aspect-[3/4] bg-muted overflow-hidden mb-2 relative">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    
                    {equipped && (
                      <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="w-5 h-5 text-background" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-light truncate">{product.name}</div>
                  <div className="text-sm font-medium">${product.price?.toLocaleString()}</div>
                </button>
              );
            })}
          </div>
        )}

        {!isLoading && products?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No products available for this category
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
