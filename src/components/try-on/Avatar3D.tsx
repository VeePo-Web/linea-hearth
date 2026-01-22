import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTryOnState } from '@/hooks/useTryOnState';
import { Mannequin3D } from './Mannequin3D';
import { GarmentLayer } from './GarmentLayer';

interface Avatar3DProps {
  position?: [number, number, number];
}

// Body proportion presets by body type and gender
const getBodyProportions = (
  bodyType: 'slim' | 'athletic' | 'average' | 'curvy',
  gender: 'male' | 'female'
) => {
  const baseProportions = {
    slim: { shoulderWidth: 0.38, chestDepth: 0.18, waistWidth: 0.28, hipWidth: 0.34, armThickness: 0.045, legThickness: 0.07 },
    athletic: { shoulderWidth: 0.44, chestDepth: 0.22, waistWidth: 0.30, hipWidth: 0.36, armThickness: 0.055, legThickness: 0.085 },
    average: { shoulderWidth: 0.40, chestDepth: 0.20, waistWidth: 0.32, hipWidth: 0.38, armThickness: 0.05, legThickness: 0.08 },
    curvy: { shoulderWidth: 0.38, chestDepth: 0.22, waistWidth: 0.34, hipWidth: 0.44, armThickness: 0.055, legThickness: 0.09 },
  };

  const genderModifiers = gender === 'female' 
    ? { shoulderMod: 0.9, hipMod: 1.1, chestMod: 1.1 }
    : { shoulderMod: 1.1, hipMod: 0.9, chestMod: 1.0 };

  const base = baseProportions[bodyType];
  
  return {
    shoulderWidth: base.shoulderWidth * genderModifiers.shoulderMod,
    chestDepth: base.chestDepth * genderModifiers.chestMod,
    waistWidth: base.waistWidth,
    hipWidth: base.hipWidth * genderModifiers.hipMod,
    armThickness: base.armThickness,
    legThickness: base.legThickness,
    height: gender === 'female' ? 1.65 : 1.78,
  };
};

export const Avatar3D = ({ position = [0, 0, 0] }: Avatar3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { 
    avatarGender, 
    avatarBodyType, 
    equippedItems 
  } = useTryOnState();

  const bodyScale = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender),
    [avatarBodyType, avatarGender]
  );

  // Subtle breathing animation for the whole group
  useFrame((state) => {
    if (groupRef.current) {
      const breathe = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.002;
      groupRef.current.scale.y = 1 + breathe;
    }
  });

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
