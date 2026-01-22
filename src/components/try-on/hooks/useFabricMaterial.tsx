import { useMemo } from 'react';
import * as THREE from 'three';

interface FabricMaterialProps {
  type: 'cotton' | 'fleece' | 'denim' | 'leather' | 'knit';
  color: string;
  imageUrl?: string;
}

// Fabric presets for realistic materials
const fabricPresets = {
  cotton: {
    roughness: 0.85,
    metalness: 0,
    sheen: 0.15,
    sheenRoughness: 0.8,
    sheenColor: '#ffffff',
  },
  fleece: {
    roughness: 0.95,
    metalness: 0,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: '#ffffff',
  },
  denim: {
    roughness: 0.75,
    metalness: 0.02,
    sheen: 0.1,
    sheenRoughness: 0.9,
    sheenColor: '#4a5568',
  },
  leather: {
    roughness: 0.35,
    metalness: 0.05,
    sheen: 0.6,
    sheenRoughness: 0.3,
    sheenColor: '#ffffff',
  },
  knit: {
    roughness: 0.9,
    metalness: 0,
    sheen: 0.25,
    sheenRoughness: 0.7,
    sheenColor: '#ffffff',
  },
};

export const useFabricMaterial = ({ type, color, imageUrl }: FabricMaterialProps) => {
  const preset = fabricPresets[type];

  const material = useMemo(() => {
    // For now, use solid colors with fabric-appropriate properties
    // Future: Load imageUrl as texture
    return (
      <meshPhysicalMaterial
        color={color}
        roughness={preset.roughness}
        metalness={preset.metalness}
        sheen={preset.sheen}
        sheenRoughness={preset.sheenRoughness}
        sheenColor={preset.sheenColor}
        envMapIntensity={0.4}
        side={THREE.DoubleSide}
      />
    );
  }, [color, preset, imageUrl]);

  return material;
};

// Hook to get color from product name (fallback when no image)
export const useProductColor = (productName: string): string => {
  const colorMap: Record<string, string> = {
    'black': '#1C1917',
    'white': '#FAFAFA',
    'navy': '#1e3a5f',
    'gray': '#4B5563',
    'charcoal': '#374151',
    'cream': '#FEF3C7',
    'olive': '#4d5d3a',
    'burgundy': '#7f1d1d',
    'forest': '#14532d',
  };

  const nameLower = productName.toLowerCase();
  
  for (const [colorName, colorHex] of Object.entries(colorMap)) {
    if (nameLower.includes(colorName)) {
      return colorHex;
    }
  }

  // Default dark color for unmatched products
  return '#1C1917';
};
