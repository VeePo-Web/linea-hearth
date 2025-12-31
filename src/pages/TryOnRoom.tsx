import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TryOnProvider, useTryOnState, EquippedItem } from '@/hooks/useTryOnState';
import { TryOnCanvas } from '@/components/try-on/TryOnCanvas';
import { TryOnSidebar } from '@/components/try-on/TryOnSidebar';
import { MobileTryOnBar } from '@/components/try-on/MobileTryOnBar';
import { ProductDrawer } from '@/components/try-on/ProductDrawer';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TryOnRoomContent = () => {
  const [searchParams] = useSearchParams();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileActiveSlot, setMobileActiveSlot] = useState<'head' | 'top' | 'outerwear' | 'bottom' | 'footwear' | null>(null);
  const { setActiveSlot, equipItem } = useTryOnState();

  // Handle pre-selected product from URL
  useEffect(() => {
    const productSlug = searchParams.get('product');
    const slot = searchParams.get('slot') as keyof typeof slotMapping | null;
    
    const slotMapping = {
      head: 'head',
      top: 'top',
      outerwear: 'outerwear',
      bottom: 'bottom',
      footwear: 'footwear',
    } as const;

    if (productSlug && slot && slotMapping[slot]) {
      const fetchAndEquipProduct = async () => {
        const { data: product } = await supabase
          .from('products')
          .select(`
            id, name, slug, price,
            product_images (image_url, is_primary)
          `)
          .eq('slug', productSlug)
          .eq('status', 'active')
          .single();

        if (product) {
          const primaryImage = product.product_images?.find((img: { is_primary: boolean }) => img.is_primary)?.image_url 
            || product.product_images?.[0]?.image_url;

          const item: EquippedItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            size: 'M',
            color: 'default',
            imageUrl: primaryImage,
          };

          equipItem(slotMapping[slot], item);
        }
      };

      fetchAndEquipProduct();
    }
  }, [searchParams, equipItem]);

  const handleOpenSlot = (slot: string) => {
    setMobileActiveSlot(slot as 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear');
    setActiveSlot(slot);
    setMobileDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setMobileDrawerOpen(false);
    setMobileActiveSlot(null);
    setActiveSlot(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Page Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-light tracking-tight">Try-On Room</h1>
            <p className="text-sm text-muted-foreground">Build your perfect outfit</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* 3D Canvas - Full width on mobile, 60% on desktop */}
        <div className="flex-1 h-[50vh] md:h-[calc(100vh-200px)] relative bg-gradient-to-b from-muted/30 to-muted/10">
          <TryOnCanvas className="w-full h-full" />
        </div>

        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block w-[380px] border-l border-border bg-background overflow-y-auto">
          <TryOnSidebar />
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileTryOnBar onOpenSlot={handleOpenSlot} />

      {/* Mobile Product Drawer */}
      <ProductDrawer 
        isOpen={mobileDrawerOpen} 
        onClose={handleCloseDrawer}
        slot={mobileActiveSlot}
      />

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

const TryOnRoom = () => {
  return (
    <TryOnProvider>
      <TryOnRoomContent />
    </TryOnProvider>
  );
};

export default TryOnRoom;
