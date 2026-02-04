import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTryOnState, BodyMeasurements } from '@/hooks/useTryOnState';
import { Mannequin3D } from './Mannequin3D';
import { GarmentLayer } from './GarmentLayer';

interface Avatar3DProps {
  position?: [number, number, number];
}

// Helper to map value from one range to another
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
};

// Body proportion presets by body type and gender (fallback)
const getPresetProportions = (
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

// Convert real measurements to 3D proportions
const getMeasurementBasedProportions = (
  measurements: BodyMeasurements,
  gender: 'male' | 'female'
) => {
  const { heightCm, weightKg, chestCm, waistCm, hipsCm } = measurements;
  
  // Calculate BMI for thickness adjustments
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiThicknessFactor = mapRange(bmi, 18.5, 32, 0.85, 1.25);
  
  // Torso proportions from measurements
  const shoulderWidth = mapRange(chestCm, 80, 130, 0.36, 0.52) * (gender === 'male' ? 1.08 : 0.95);
  const chestDepth = mapRange(chestCm, 80, 130, 0.16, 0.26) * bmiThicknessFactor;
  const waistWidth = mapRange(waistCm, 60, 120, 0.24, 0.42);
  let hipWidth = mapRange(hipsCm, 80, 130, 0.32, 0.50);
  if (gender === 'female') hipWidth *= 1.06;
  
  // Limb proportions
  const armThickness = 0.048 * bmiThicknessFactor * (gender === 'male' ? 1.1 : 0.9);
  const legThickness = 0.075 * bmiThicknessFactor * (gender === 'male' ? 1.05 : 1.0);
  
  return {
    shoulderWidth,
    chestDepth,
    waistWidth,
    hipWidth,
    armThickness,
    legThickness,
    height: (heightCm / 170) * 1.7,
  };
};

// Unified function to get proportions based on mode
const getBodyProportions = (
  bodyType: 'slim' | 'athletic' | 'average' | 'curvy',
  gender: 'male' | 'female',
  measurements: BodyMeasurements,
  useDetailedMeasurements: boolean
) => {
  if (useDetailedMeasurements) {
    return getMeasurementBasedProportions(measurements, gender);
  }
  return getPresetProportions(bodyType, gender);
};

export const Avatar3D = ({ position = [0, 0, 0] }: Avatar3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { 
    avatarGender, 
    avatarBodyType, 
    equippedItems,
    measurements,
    useDetailedMeasurements,
  } = useTryOnState();

  const bodyScale = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements),
    [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]
  );

  // Note: Breathing animation is now handled inside Mannequin3D component
  // to properly account for height scaling and reduced motion preferences

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
