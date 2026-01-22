import { useLoader } from '@react-three/fiber';
import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

interface TextureConfig {
  repeat: [number, number];
  offset: [number, number];
  rotation: number;
  wrapS: THREE.Wrapping;
  wrapT: THREE.Wrapping;
}

// Garment-specific UV configurations for optimal texture display
const garmentTextureConfigs: Record<string, TextureConfig> = {
  hoodie: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  crewneck: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  tshirt: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  tank: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  jacket: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  pants: {
    repeat: [2, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  shorts: {
    repeat: [1.5, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
};

const defaultConfig: TextureConfig = {
  repeat: [1, 1],
  offset: [0, 0],
  rotation: 0,
  wrapS: THREE.ClampToEdgeWrapping,
  wrapT: THREE.ClampToEdgeWrapping,
};

/**
 * Custom hook for loading and configuring garment textures
 * Uses THREE.TextureLoader directly with error handling
 */
export const useGarmentTexture = (
  imageUrl: string | undefined,
  garmentType: string = 'hoodie'
): THREE.Texture | null => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState<boolean>(false);

  const config = garmentTextureConfigs[garmentType] || defaultConfig;

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }

    console.log('[Texture] Loading:', imageUrl, 'for garment type:', garmentType);
    
    setError(false);
    const loader = new THREE.TextureLoader();

    loader.load(
      imageUrl,
      (loadedTexture) => {
        console.log('[Texture] Loaded successfully:', imageUrl);
        
        // Configure texture properties
        loadedTexture.wrapS = config.wrapS;
        loadedTexture.wrapT = config.wrapT;
        loadedTexture.repeat.set(config.repeat[0], config.repeat[1]);
        loadedTexture.offset.set(config.offset[0], config.offset[1]);
        loadedTexture.rotation = config.rotation;
        loadedTexture.center.set(0.5, 0.5);
        
        // High quality filtering
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.anisotropy = 16;
        
        // Ensure correct color space
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.error('[Texture] Failed to load:', imageUrl, err);
        setError(true);
        setTexture(null);
      }
    );

    return () => {
      // Cleanup on unmount or URL change
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl, config]);

  return texture;
};

/**
 * Get the best texture image URL for a product
 * Prioritizes flat-front images for texture mapping
 */
export const getTextureImageUrl = (
  productImages: Array<{ image_url: string; is_primary?: boolean }> | undefined,
  productName: string
): string | undefined => {
  if (!productImages || productImages.length === 0) return undefined;

  // Priority 1: Look for flat-front or flat-lay images (best for texturing)
  const flatImage = productImages.find(img => 
    img.image_url.toLowerCase().includes('flat') ||
    img.image_url.toLowerCase().includes('front')
  );
  if (flatImage) return flatImage.image_url;

  // Priority 2: Use primary image
  const primaryImage = productImages.find(img => img.is_primary);
  if (primaryImage) return primaryImage.image_url;

  // Priority 3: First image
  return productImages[0]?.image_url;
};

export default useGarmentTexture;
