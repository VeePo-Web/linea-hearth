import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTryOnState, BodyMeasurements } from '@/hooks/useTryOnState';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * MANNEQUIN 3D - Anatomically Correct Human Form
 * 
 * Y-Coordinate Reference (ground at Y=0):
 * ─────────────────────────────────────────
 * Ground:     0.00
 * Feet:       0.00 → 0.05
 * Ankles:     0.05 → 0.08
 * Calves:     0.08 → 0.45
 * Knees:      0.45 (joint)
 * Thighs:     0.45 → 0.85
 * Hips:       0.85 (pelvis joint)
 * Pelvis:     0.85 → 0.95
 * Torso:      0.95 → 1.45
 * Shoulders:  1.45 (arm attachment)
 * Neck:       1.45 → 1.55
 * Head:       1.55 → 1.75
 * ─────────────────────────────────────────
 * TOTAL HEIGHT: ~1.75m (normalized male average)
 */

interface MannequinProps {
  position?: [number, number, number];
}

// Body proportion presets by body type and gender
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
    height: gender === 'female' ? 1.65 : 1.75,
    armLength: 0.55,
    legLength: 0.80,
  };
};

// Helper to map value from one range to another
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
};

// Convert real measurements to 3D proportions
const getMeasurementBasedProportions = (
  measurements: BodyMeasurements,
  gender: 'male' | 'female'
) => {
  const { heightCm, weightKg, chestCm, waistCm, hipsCm, inseamCm } = measurements;
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiThicknessFactor = mapRange(bmi, 18.5, 32, 0.85, 1.25);
  
  const heightScale = heightCm / 170;
  const height = 1.75 * heightScale;
  
  const shoulderWidth = mapRange(chestCm, 80, 130, 0.36, 0.52) * (gender === 'male' ? 1.08 : 0.95);
  const chestDepth = mapRange(chestCm, 80, 130, 0.16, 0.26) * bmiThicknessFactor;
  const waistWidth = mapRange(waistCm, 60, 120, 0.24, 0.42);
  let hipWidth = mapRange(hipsCm, 80, 130, 0.32, 0.50);
  if (gender === 'female') hipWidth *= 1.06;
  
  const armThickness = 0.048 * bmiThicknessFactor * (gender === 'male' ? 1.1 : 0.9);
  const legThickness = 0.075 * bmiThicknessFactor * (gender === 'male' ? 1.05 : 1.0);
  
  const armLength = 0.55 * heightScale;
  const legLength = (inseamCm / 76) * 0.80 * heightScale;
  
  return {
    shoulderWidth,
    chestDepth,
    waistWidth,
    hipWidth,
    armThickness,
    legThickness,
    height,
    armLength,
    legLength,
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

// Premium matte ceramic/plaster material for museum-quality mannequin
const MannequinMaterial = ({ skinTone }: { skinTone: string }) => {
  return (
    <meshStandardMaterial
      color={skinTone}
      roughness={0.75}
      metalness={0.0}
      envMapIntensity={0.2}
    />
  );
};

// Create anatomically correct torso geometry
// Torso spans from Y=0 (hips) to Y=0.50 (shoulders) in local space
// Positioned at Y=0.95 so actual range is 0.95 → 1.45
const createTorsoGeometry = (props: ReturnType<typeof getBodyProportions>) => {
  const points: THREE.Vector2[] = [];
  const segments = 32;
  const torsoHeight = 0.50; // 50cm torso
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radius: number;
    
    if (t < 0.12) {
      // Hips to waist (narrowing) - bottom of torso
      const localT = t / 0.12;
      radius = THREE.MathUtils.lerp(props.hipWidth / 2, props.waistWidth / 2, localT);
    } else if (t < 0.45) {
      // Waist to chest (expanding)
      const localT = (t - 0.12) / 0.33;
      radius = THREE.MathUtils.lerp(props.waistWidth / 2, props.chestDepth, localT);
    } else if (t < 0.75) {
      // Chest region (widest)
      const localT = (t - 0.45) / 0.30;
      radius = THREE.MathUtils.lerp(props.chestDepth, props.shoulderWidth / 2, localT * 0.6);
    } else {
      // Chest to shoulders (tapering to neck)
      const localT = (t - 0.75) / 0.25;
      radius = THREE.MathUtils.lerp(props.shoulderWidth / 2 * 0.6 + props.chestDepth * 0.4, props.shoulderWidth / 2 * 0.35, localT);
    }
    
    // Y goes from 0 (hips) to torsoHeight (shoulders)
    const y = t * torsoHeight;
    points.push(new THREE.Vector2(radius, y));
  }
  
  return new THREE.LatheGeometry(points, 40);
};

// Create pelvis geometry that connects torso to legs
// Spans from Y=0 to Y=0.10 in local space
// Positioned at Y=0.85 so actual range is 0.85 → 0.95
const createPelvisGeometry = (props: ReturnType<typeof getBodyProportions>) => {
  const points: THREE.Vector2[] = [];
  const segments = 12;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Pelvis is wider at bottom (leg attachment) and tapers to torso
    const radius = THREE.MathUtils.lerp(
      props.hipWidth / 2 + 0.02, // Bottom - wider for leg joints
      props.hipWidth / 2,         // Top - matches torso bottom
      t
    );
    const y = t * 0.10;
    points.push(new THREE.Vector2(radius, y));
  }
  
  return new THREE.LatheGeometry(points, 32);
};

// Head component - positioned so bottom is at Y=1.55
const Head = ({ skinTone }: { skinTone: string }) => {
  // Head radius 0.095, positioned at Y=1.65 (center)
  // Bottom of head: 1.65 - 0.095 = 1.555
  // Top of head: 1.65 + 0.095 = 1.745
  return (
    <group position={[0, 1.65, 0]}>
      {/* Main skull */}
      <mesh>
        <sphereGeometry args={[0.095, 32, 24]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      {/* Subtle jaw shape */}
      <mesh position={[0, -0.04, 0.02]} scale={[0.85, 0.7, 0.9]}>
        <sphereGeometry args={[0.065, 16, 12]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// Neck component - spans from Y=1.45 to Y=1.55
const Neck = ({ skinTone, proportions }: { skinTone: string; proportions: ReturnType<typeof getBodyProportions> }) => {
  const neckRadius = proportions.shoulderWidth * 0.12;
  return (
    <mesh position={[0, 1.50, 0]}>
      <cylinderGeometry args={[neckRadius * 0.9, neckRadius, 0.10, 20]} />
      <MannequinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// Torso component - positioned at Y=0.95 (hips level)
const Torso = ({ skinTone, proportions }: { skinTone: string; proportions: ReturnType<typeof getBodyProportions> }) => {
  const geometry = useMemo(() => createTorsoGeometry(proportions), [proportions]);
  
  return (
    <mesh position={[0, 0.95, 0]} geometry={geometry}>
      <MannequinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// Pelvis component - positioned at Y=0.85
const Pelvis = ({ skinTone, proportions }: { skinTone: string; proportions: ReturnType<typeof getBodyProportions> }) => {
  const geometry = useMemo(() => createPelvisGeometry(proportions), [proportions]);
  
  return (
    <mesh position={[0, 0.85, 0]} geometry={geometry}>
      <MannequinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// Arm component with proper shoulder attachment at Y=1.45
const Arm = ({ 
  side, 
  skinTone, 
  proportions 
}: { 
  side: 'left' | 'right'; 
  skinTone: string; 
  proportions: ReturnType<typeof getBodyProportions>;
}) => {
  const xPos = side === 'left' 
    ? -proportions.shoulderWidth / 2 - proportions.armThickness * 0.5
    : proportions.shoulderWidth / 2 + proportions.armThickness * 0.5;
  const rotation = side === 'left' ? 0.12 : -0.12;
  
  // Calculate arm segment lengths
  const upperArmLength = proportions.armLength * 0.50;
  const forearmLength = proportions.armLength * 0.45;
  
  return (
    <group position={[xPos, 1.45, 0]} rotation={[0, 0, rotation]}>
      {/* Shoulder joint sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[proportions.armThickness * 1.15, 16, 16]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Upper arm */}
      <mesh position={[0, -upperArmLength / 2, 0]}>
        <cylinderGeometry args={[proportions.armThickness, proportions.armThickness * 0.88, upperArmLength, 20]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Elbow joint sphere */}
      <mesh position={[0, -upperArmLength, 0]}>
        <sphereGeometry args={[proportions.armThickness * 0.9, 12, 12]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Forearm */}
      <mesh position={[0, -upperArmLength - forearmLength / 2, 0]}>
        <cylinderGeometry args={[proportions.armThickness * 0.85, proportions.armThickness * 0.65, forearmLength, 20]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Hand (simplified) */}
      <mesh position={[0, -upperArmLength - forearmLength - 0.02, 0]}>
        <sphereGeometry args={[proportions.armThickness * 0.75, 12, 12]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// Leg component with proper hip attachment at Y=0.85
const Leg = ({ 
  side, 
  skinTone, 
  proportions 
}: { 
  side: 'left' | 'right'; 
  skinTone: string; 
  proportions: ReturnType<typeof getBodyProportions>;
}) => {
  const xPos = side === 'left' ? -0.09 : 0.09;
  
  // Calculate leg segment lengths
  const thighLength = proportions.legLength * 0.50; // ~0.40
  const calfLength = proportions.legLength * 0.45;  // ~0.36
  
  // Leg attaches at hip level (Y=0.85)
  // Thigh goes from 0.85 down to ~0.45 (knee)
  // Calf goes from 0.45 down to ~0.08 (ankle)
  
  return (
    <group position={[xPos, 0.85, 0]}>
      {/* Hip joint sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[proportions.legThickness * 1.15, 16, 16]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Thigh */}
      <mesh position={[0, -thighLength / 2, 0]}>
        <cylinderGeometry args={[proportions.legThickness, proportions.legThickness * 0.85, thighLength, 24]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Knee joint sphere */}
      <mesh position={[0, -thighLength, 0]}>
        <sphereGeometry args={[proportions.legThickness * 0.88, 12, 12]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Calf */}
      <mesh position={[0, -thighLength - calfLength / 2, 0]}>
        <cylinderGeometry args={[proportions.legThickness * 0.78, proportions.legThickness * 0.50, calfLength, 24]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Ankle joint */}
      <mesh position={[0, -thighLength - calfLength, 0]}>
        <sphereGeometry args={[proportions.legThickness * 0.45, 10, 10]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Foot */}
      <mesh position={[0, -thighLength - calfLength - 0.02, 0.04]} rotation={[Math.PI / 2.2, 0, 0]}>
        <capsuleGeometry args={[proportions.legThickness * 0.42, 0.12, 8, 16]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

export const Mannequin3D = ({ position = [0, 0, 0] }: MannequinProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { avatarGender, avatarBodyType, avatarSkinTone, measurements, useDetailedMeasurements } = useTryOnState();
  const reducedMotion = useReducedMotion();
  
  const proportions = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements),
    [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]
  );

  // Calculate height scale (base height is 1.75m)
  const heightScale = useMemo(() => {
    return proportions.height / 1.75;
  }, [proportions.height]);

  // Subtle breathing animation (disabled for reduced motion)
  useFrame((state) => {
    if (groupRef.current && !reducedMotion) {
      const breathe = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.002;
      groupRef.current.scale.y = heightScale * (1 + breathe);
    }
  });

  // Y offset to keep feet on ground when scaled
  const yOffset = useMemo(() => {
    return (heightScale - 1) * 0.85;
  }, [heightScale]);

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1] + yOffset, position[2]]} 
      scale={[1, heightScale, 1]}
    >
      {/* Head - top of figure */}
      <Head skinTone={avatarSkinTone} />
      
      {/* Neck - connects head to torso */}
      <Neck skinTone={avatarSkinTone} proportions={proportions} />
      
      {/* Torso - main body from shoulders to hips */}
      <Torso skinTone={avatarSkinTone} proportions={proportions} />
      
      {/* Pelvis - hip region connecting torso to legs */}
      <Pelvis skinTone={avatarSkinTone} proportions={proportions} />
      
      {/* Arms - attach at shoulder level */}
      <Arm side="left" skinTone={avatarSkinTone} proportions={proportions} />
      <Arm side="right" skinTone={avatarSkinTone} proportions={proportions} />
      
      {/* Legs - attach at hip level */}
      <Leg side="left" skinTone={avatarSkinTone} proportions={proportions} />
      <Leg side="right" skinTone={avatarSkinTone} proportions={proportions} />
    </group>
  );
};
