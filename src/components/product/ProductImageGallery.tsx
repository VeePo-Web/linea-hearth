import { useState, useRef, useMemo } from "react";
import ImageZoom from "./ImageZoom";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
}

interface ProductImageGalleryProps {
  images?: ProductImage[];
  selectedColor?: string | null;
}

const ProductImageGallery = ({ images, selectedColor }: ProductImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sort images by display_order, primary first
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    return [...images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  }, [images]);

  const imageUrls = sortedImages.map(img => img.image_url);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  const handleImageClick = (index: number) => {
    setZoomInitialIndex(index);
    setIsZoomOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const difference = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Placeholder images if no images provided
  if (sortedImages.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
          <span className="text-6xl opacity-20">✝</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop: Vertical scrolling gallery (1024px and above) */}
      <div className="hidden lg:block">
        <div className="space-y-4">
          {sortedImages.map((image, index) => (
            <div 
              key={image.id} 
              className="w-full aspect-[3/4] overflow-hidden cursor-pointer group bg-muted"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `Product view ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={index > 0 ? "lazy" : "eager"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet/Mobile: Image slider (below 1024px) */}
      <div className="lg:hidden">
        <div className="relative">
          <div 
            className="w-full aspect-[3/4] overflow-hidden cursor-pointer group touch-pan-y bg-muted"
            onClick={() => handleImageClick(currentImageIndex)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={sortedImages[currentImageIndex].image_url}
              alt={sortedImages[currentImageIndex].alt_text || `Product view ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
            />
          </div>
          
          {/* Tap to zoom hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-light text-muted-foreground/80 bg-background/80 backdrop-blur-sm px-3 py-1">
            Tap to zoom
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {sortedImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-foreground' : 'bg-muted-foreground/30'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoom
        images={imageUrls}
        initialIndex={zoomInitialIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};

export default ProductImageGallery;
