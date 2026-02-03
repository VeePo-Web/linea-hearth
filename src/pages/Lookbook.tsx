import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import LookbookHero from "@/components/lookbook/LookbookHero";
import LookSection from "@/components/lookbook/LookSection";
import LookNavigation from "@/components/lookbook/LookNavigation";
import LookNavigationMobile from "@/components/lookbook/LookNavigationMobile";
import FitGuideSection from "@/components/lookbook/FitGuideSection";
import WearTheMissionCTA from "@/components/about/WearTheMissionCTA";

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

interface Look {
  id: string;
  name: string;
  headline: string;
  scripture_reference: string | null;
  description: string | null;
  image_url: string;
  video_url: string | null;
  gender: string;
  products: LookProduct[];
}

// Demo looks for when database is empty
const demoLooks: Look[] = [
  {
    id: '1',
    name: 'The Shepherd',
    headline: 'Walk By Faith, Not By Sight',
    scripture_reference: '2 Corinthians 5:7',
    description: 'A full fit for the one who leads with quiet confidence. Layers that move with purpose.',
    image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200',
    video_url: null,
    gender: 'male',
    products: []
  },
  {
    id: '2',
    name: 'The Warrior',
    headline: 'Greater Is He That Is In Me',
    scripture_reference: '1 John 4:4',
    description: 'Bold pieces for the one who stands firm. Armor for the modern battlefield.',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
    video_url: null,
    gender: 'female',
    products: []
  },
  {
    id: '3',
    name: 'The Disciple',
    headline: 'Go And Make Disciples',
    scripture_reference: 'Matthew 28:19',
    description: 'Minimal and intentional. Every piece carries the message without saying a word.',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
    video_url: null,
    gender: 'male',
    products: []
  },
  {
    id: '4',
    name: 'The Vessel',
    headline: 'Chosen Before The Foundation',
    scripture_reference: 'Ephesians 1:4',
    description: 'Delicate strength. Pieces that speak to purpose and calling.',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200',
    video_url: null,
    gender: 'female',
    products: []
  },
  {
    id: '5',
    name: 'Street Evangelist',
    headline: 'Be Ready In Season And Out',
    scripture_reference: '2 Timothy 4:2',
    description: 'For the one always on mission. Streetwear that opens conversations.',
    image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200',
    video_url: null,
    gender: 'unisex',
    products: []
  }
];

const Lookbook = () => {
  const { data: looks = [], isLoading } = useQuery({
    queryKey: ['lookbook-looks'],
    queryFn: async () => {
      // Fetch looks
      const { data: looksData, error: looksError } = await supabase
        .from('lookbook_looks')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (looksError) throw looksError;
      if (!looksData || looksData.length === 0) return [];

      // Fetch products for each look
      const looksWithProducts = await Promise.all(
        looksData.map(async (look) => {
          const { data: lookProducts } = await supabase
            .from('lookbook_look_products')
            .select(`
              position,
              display_order,
              products:product_id (
                id,
                name,
                slug,
                price,
                sale_price,
                is_on_sale,
                product_images (
                  image_url,
                  is_primary
                )
              )
            `)
            .eq('look_id', look.id)
            .order('display_order', { ascending: true });

          const products = (lookProducts || []).map((lp: any) => ({
            ...lp.products,
            position: lp.position
          }));

          return {
            ...look,
            products
          };
        })
      );

      return looksWithProducts as Look[];
    }
  });

  // Use demo looks if no data from database
  const displayLooks = looks.length > 0 ? looks : demoLooks;

  return (
    <div className="min-h-screen bg-stone-900">
      <Header />
      
      {/* Main Scroll Container - offset by header height */}
      <main 
        className="lookbook-scroll-container snap-y snap-mandatory overflow-y-auto scroll-smooth overscroll-y-contain"
        style={{ 
          height: 'calc(100vh - var(--header-height))',
          marginTop: 'var(--header-height)' 
        }}
      >
        {/* Hero Section */}
        <LookbookHero />

        {/* Look Sections */}
        {isLoading ? (
          <section className="h-screen w-full snap-start flex items-center justify-center bg-stone-900">
            <div className="animate-pulse text-white/50 font-light">
              Loading looks...
            </div>
          </section>
        ) : (
          displayLooks.map((look, index) => (
            <LookSection key={look.id} look={look} index={index} />
          ))
        )}

        {/* Fit Guide Section */}
        <FitGuideSection />

        {/* CTA Section */}
        <section className="snap-start">
          <WearTheMissionCTA />
        </section>

        {/* Footer */}
        <section className="snap-start">
          <Footer />
        </section>
      </main>

      {/* Fixed Navigation - Desktop */}
      <LookNavigation looks={displayLooks} />
      
      {/* Fixed Navigation - Mobile */}
      <LookNavigationMobile looks={displayLooks} />
    </div>
  );
};

export default Lookbook;
