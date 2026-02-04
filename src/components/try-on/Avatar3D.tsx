import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTryOnState } from '@/hooks/useTryOnState';
import { Mannequin3D } from './Mannequin3D';
import { GarmentLayer } from './GarmentLayer';
import { getBodyProportions } from './utils/measurementToProportions';

interface Avatar3DProps {
  position?: [number, number, number];
}

/**
 * Avatar3D - Composite component combining mannequin and garment layers
 * 
 * Proportions are calculated from the unified measurementToProportions.ts
 * to ensure consistency between mannequin and garment fitting.
 */

export const Avatar3D = ({ position = [0, 0, 0] }: Avatar3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { 
    avatarGender, 
    avatarBodyType, 
    equippedItems,
    measurements,
    useDetailedMeasurements,
  } = useTryOnState();

  // Get body proportions from unified source
  const bodyScale = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements),
    [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]
  );

  return (
    <group ref={groupRef} position={position}>
      {/* Premium Mannequin Base */}
      <Mannequin3D position={[0, 0, 0]} />
      
      {/* Garment Layers - render equipped items */}
      <GarmentLayer 
        slot="head" 
        equipped={equippedItems.head} 
        bodyScale={bodyScale}
      />
      <GarmentLayer 
        slot="top" 
        equipped={equippedItems.top} 
        bodyScale={bodyScale}
      />
      <GarmentLayer 
        slot="outerwear" 
        equipped={equippedItems.outerwear} 
        bodyScale={bodyScale}
      />
      <GarmentLayer 
        slot="bottom" 
        equipped={equippedItems.bottom} 
        bodyScale={bodyScale}
      />
      <GarmentLayer 
        slot="footwear" 
        equipped={equippedItems.footwear} 
        bodyScale={bodyScale}
      />
    </group>
  );
};
