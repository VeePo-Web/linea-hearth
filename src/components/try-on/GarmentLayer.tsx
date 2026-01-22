import { useMemo } from 'react';
import { HoodieGeometry, CrewneckGeometry, TshirtGeometry, PantsGeometry } from './garments';
import { useProductColor } from './hooks/useFabricMaterial';
import type { EquippedItem } from '@/hooks/useTryOnState';

interface GarmentLayerProps {
  slot: 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear';
  equipped: EquippedItem | null;
  bodyScale: {
    shoulderWidth: number;
    waistWidth: number;
    hipWidth: number;
    legThickness: number;
  };
}

// Map product names to garment types
const inferGarmentType = (name: string): 'hoodie' | 'crewneck' | 'tshirt' | 'pants' | 'unknown' => {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('hoodie') || nameLower.includes('hoody')) return 'hoodie';
  if (nameLower.includes('crewneck') || nameLower.includes('crew neck') || nameLower.includes('sweatshirt')) return 'crewneck';
  if (nameLower.includes('tee') || nameLower.includes('t-shirt') || nameLower.includes('shirt')) return 'tshirt';
  if (nameLower.includes('pant') || nameLower.includes('jean') || nameLower.includes('trouser') || nameLower.includes('jogger')) return 'pants';
  
  return 'unknown';
};

export const GarmentLayer = ({ slot, equipped, bodyScale }: GarmentLayerProps) => {
  const color = useProductColor(equipped?.name || '');
  
  const garmentType = useMemo(() => {
    if (!equipped) return null;
    return inferGarmentType(equipped.name);
  }, [equipped]);

  if (!equipped) return null;

  // Render appropriate garment based on slot and inferred type
  switch (slot) {
    case 'top':
      if (garmentType === 'tshirt') {
        return (
          <TshirtGeometry 
            color={color}
            imageUrl={equipped.imageUrl}
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
          />
        );
      }
      if (garmentType === 'crewneck') {
        return (
          <CrewneckGeometry 
            color={color}
            imageUrl={equipped.imageUrl}
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
          />
        );
      }
      // Default to crewneck for unrecognized tops
      return (
        <CrewneckGeometry 
          color={color}
          imageUrl={equipped.imageUrl}
          bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
        />
      );

    case 'outerwear':
      // Outerwear is typically hoodies, jackets, etc.
      return (
        <HoodieGeometry 
          color={color}
          imageUrl={equipped.imageUrl}
          bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
        />
      );

    case 'bottom':
      return (
        <PantsGeometry 
          color={color}
          imageUrl={equipped.imageUrl}
          bodyScale={{ hipWidth: bodyScale.hipWidth, legThickness: bodyScale.legThickness }}
          style="straight"
        />
      );

    case 'head':
      // Cap/Hat - simple for now
      return (
        <mesh position={[0, 1.78, 0.02]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.10, 0.08, 24]} />
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.7}
            metalness={0}
          />
        </mesh>
      );

    case 'footwear':
      // Simple shoes
      return (
        <group>
          <mesh position={[-0.09, 0.02, 0.05]} rotation={[Math.PI / 2.2, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.12, 8, 16]} />
            <meshPhysicalMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.09, 0.02, 0.05]} rotation={[Math.PI / 2.2, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.12, 8, 16]} />
            <meshPhysicalMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
};
