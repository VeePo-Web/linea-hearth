import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Instagram } from 'lucide-react';

const MinistryInMotion = () => {
  const { data: ugcPhotos, isLoading } = useQuery({
    queryKey: ['ministry-ugc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_ugc')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  // Placeholder data for demo
  const placeholderPhotos = [
    { id: '1', customer_name: 'Marcus T.', instagram_handle: '@marcust', image_url: '/founders.png', caption: 'Wearing my faith on campus' },
    { id: '2', customer_name: 'Sarah M.', instagram_handle: '@sarahm', image_url: '/founders.png', caption: 'Sunday service vibes' },
    { id: '3', customer_name: 'David K.', instagram_handle: '@davidk', image_url: '/founders.png', caption: 'Mission trip ready' },
    { id: '4', customer_name: 'Grace L.', instagram_handle: '@gracel', image_url: '/founders.png', caption: 'Bold faith, bold style' },
    { id: '5', customer_name: 'James R.', instagram_handle: '@jamesr', image_url: '/founders.png', caption: 'Representing the Kingdom' },
    { id: '6', customer_name: 'Faith W.', instagram_handle: '@faithw', image_url: '/founders.png', caption: 'Walking in purpose' },
  ];

  const photos = ugcPhotos?.length ? ugcPhotos : placeholderPhotos;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center px-6 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-4">
            Our Community
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
            Ministry In Motion
          </h2>
          <p className="text-muted-foreground font-light max-w-lg mx-auto">
            See our community wearing the mission worldwide. Tag @lineofjudah to be featured.
          </p>
        </div>

        {/* Horizontal Scroll Carousel */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-6 pb-4" style={{ width: 'max-content' }}>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-64 md:w-72 aspect-square bg-muted animate-pulse rounded-sm"
                />
              ))
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative w-64 md:w-72 aspect-square flex-shrink-0 overflow-hidden cursor-pointer"
                >
                  <img
                    src={photo.image_url}
                    alt={`${photo.customer_name} wearing Line of Judah`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4">
                    <p className="font-light text-lg mb-1">{photo.customer_name}</p>
                    {photo.instagram_handle && (
                      <div className="flex items-center gap-1 text-sm text-white/80">
                        <Instagram className="h-4 w-4" />
                        <span>{photo.instagram_handle}</span>
                      </div>
                    )}
                    {photo.caption && (
                      <p className="text-sm text-white/70 mt-3 text-center italic">
                        "{photo.caption}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit CTA */}
        <div className="text-center mt-8 px-6">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Instagram className="h-4 w-4" />
            <span className="underline underline-offset-4">Submit Your Photo</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default MinistryInMotion;
