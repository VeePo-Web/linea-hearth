import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTryOnState, BodyMeasurements } from '@/hooks/useTryOnState';

interface MannequinProps {
  position?: [number, number, number];
}

// Body proportion presets by body type and gender (fallback when not using detailed measurements)
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
    armLength: 0.58,
    legLength: 0.82,
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
  
  // Calculate BMI for thickness adjustments
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiThicknessFactor = mapRange(bmi, 18.5, 32, 0.85, 1.25);
  
  // Height scaling (base mannequin is 1.7m)
  const heightScale = heightCm / 170;
  const height = 1.7 * heightScale;
  
  // Torso proportions from measurements
  const shoulderWidth = mapRange(chestCm, 80, 130, 0.36, 0.52) * (gender === 'male' ? 1.08 : 0.95);
  const chestDepth = mapRange(chestCm, 80, 130, 0.16, 0.26) * bmiThicknessFactor;
  const waistWidth = mapRange(waistCm, 60, 120, 0.24, 0.42);
  let hipWidth = mapRange(hipsCm, 80, 130, 0.32, 0.50);
  if (gender === 'female') hipWidth *= 1.06;
  
  // Limb proportions
  const armThickness = 0.048 * bmiThicknessFactor * (gender === 'male' ? 1.1 : 0.9);
  const legThickness = 0.075 * bmiThicknessFactor * (gender === 'male' ? 1.05 : 1.0);
  
  // Arm and leg length based on height and inseam
  const armLength = 0.58 * heightScale;
  const legLength = (inseamCm / 76) * 0.82 * heightScale;
  
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

// Smooth torso geometry using lathe
const createTorsoGeometry = (props: ReturnType<typeof getBodyProportions>) => {
  const points: THREE.Vector2[] = [];
  const segments = 24;
  
  // Create profile curve from shoulders down to hips
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radius: number;
    
    if (t < 0.15) {
      // Neck to shoulders
      radius = THREE.MathUtils.lerp(0.08, props.shoulderWidth / 2, t / 0.15);
    } else if (t < 0.35) {
      // Shoulders to chest
      const localT = (t - 0.15) / 0.2;
      radius = THREE.MathUtils.lerp(props.shoulderWidth / 2, props.chestDepth, localT);
    } else if (t < 0.55) {
      // Chest to waist (taper in)
      const localT = (t - 0.35) / 0.2;
      radius = THREE.MathUtils.lerp(props.chestDepth, props.waistWidth / 2, localT);
    } else {
      // Waist to hips (flare out)
      const localT = (t - 0.55) / 0.45;
      radius = THREE.MathUtils.lerp(props.waistWidth / 2, props.hipWidth / 2, localT);
    }
    
    const y = THREE.MathUtils.lerp(0.55, 0, t);
    points.push(new THREE.Vector2(radius, y));
  }
  
  return new THREE.LatheGeometry(points, 32);
};

// Premium mannequin material
const MannequinMaterial = ({ skinTone }: { skinTone: string }) => {
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.25}
      metalness={0.02}
      clearcoat={0.3}
      clearcoatRoughness={0.4}
      envMapIntensity={0.5}
    />
  );
};

// Smooth head geometry - position adjusts based on height scale
const Head = ({ skinTone, heightScale = 1 }: { skinTone: string; heightScale?: number }) => {
  // Base Y position is 1.72, adjust for height scaling
  const baseY = 1.52; // Position relative to torso top
  return (
    <mesh position={[0, baseY + 0.2, 0]}>
      <sphereGeometry args={[0.095, 32, 32]} />
      <MannequinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// Neck - position adjusts based on height scale
const Neck = ({ skinTone, heightScale = 1 }: { skinTone: string; heightScale?: number }) => {
  const baseY = 1.52; // Position relative to torso top
  return (
    <mesh position={[0, baseY + 0.06, 0]}>
      <cylinderGeometry args={[0.045, 0.055, 0.12, 24]} />
      <MannequinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// Smooth torso using custom geometry
const Torso = ({ skinTone, proportions }: { skinTone: string; proportions: ReturnType<typeof getBodyProportions> }) => {
  const geometry = useMemo(() => createTorsoGeometry(proportions), [proportions]);
  
  return (
    <mesh position={[0, 1.22, 0]} geometry={geometry}>
      <MannequinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// Smooth arm with proper tapering and length scaling
const Arm = ({ side, skinTone, proportions }: { side: 'left' | 'right'; skinTone: string; proportions: ReturnType<typeof getBodyProportions> }) => {
  const xPos = side === 'left' ? -proportions.shoulderWidth / 2 - 0.04 : proportions.shoulderWidth / 2 + 0.04;
  const rotation = side === 'left' ? 0.12 : -0.12;
  
  // Calculate arm segment lengths based on proportions
  const armLengthScale = proportions.armLength / 0.58; // 0.58 is base arm length
  const upperArmLength = 0.28 * armLengthScale;
  const forearmLength = 0.26 * armLengthScale;
  
  return (
    <group position={[xPos, 1.38, 0]} rotation={[0, 0, rotation]}>
      {/* Upper arm */}
      <mesh position={[0, -upperArmLength / 2, 0]}>
        <cylinderGeometry args={[proportions.armThickness, proportions.armThickness * 0.9, upperArmLength, 20]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      {/* Forearm */}
      <mesh position={[0, -upperArmLength - forearmLength / 2 + 0.02, 0]}>
        <cylinderGeometry args={[proportions.armThickness * 0.85, proportions.armThickness * 0.7, forearmLength, 20]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      {/* Hand */}
      <mesh position={[0, -upperArmLength - forearmLength + 0.02, 0]}>
        <sphereGeometry args={[proportions.armThickness * 0.8, 16, 16]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// Smooth leg with proper tapering and length scaling
const Leg = ({ side, skinTone, proportions }: { side: 'left' | 'right'; skinTone: string; proportions: ReturnType<typeof getBodyProportions> }) => {
  const xPos = side === 'left' ? -0.09 : 0.09;
  
  // Calculate leg segment lengths based on proportions
  const legLengthScale = proportions.legLength / 0.82; // 0.82 is base leg length
  const thighLength = 0.42 * legLengthScale;
  const calfLength = 0.40 * legLengthScale;
  
  return (
    <group position={[xPos, 0.67, 0]}>
      {/* Upper leg (thigh) */}
      <mesh position={[0, -thighLength / 2 + 0.02, 0]}>
        <cylinderGeometry args={[proportions.legThickness, proportions.legThickness * 0.85, thighLength, 24]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      {/* Lower leg (calf) */}
      <mesh position={[0, -thighLength - calfLength / 2 + 0.04, 0]}>
        <cylinderGeometry args={[proportions.legThickness * 0.75, proportions.legThickness * 0.5, calfLength, 24]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
      {/* Foot */}
      <mesh position={[0, -thighLength - calfLength + 0.02, 0.03]} rotation={[Math.PI / 2.5, 0, 0]}>
        <capsuleGeometry args={[proportions.legThickness * 0.45, 0.12, 8, 16]} />
        <MannequinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

export const Mannequin3D = ({ position = [0, 0, 0] }: MannequinProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { avatarGender, avatarBodyType, avatarSkinTone, measurements, useDetailedMeasurements } = useTryOnState();
  
  const proportions = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements),
    [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]
  );

  // Calculate height scale for the entire mannequin
  // Base height is 1.7m (170cm), scale proportionally
  const heightScale = useMemo(() => {
    return proportions.height / 1.7;
  }, [proportions.height]);

  // Subtle breathing animation with height scaling
  useFrame((state) => {
    if (groupRef.current) {
      const breathe = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.003;
      groupRef.current.scale.y = heightScale * (1 + breathe);
    }
  });

  // Y position offset to keep feet on ground when scaled
  const yOffset = useMemo(() => {
    // When scaled down, move up; when scaled up, move down
    return (heightScale - 1) * 0.85;
  }, [heightScale]);

  return (
    <group ref={groupRef} position={[position[0], position[1] + yOffset, position[2]]} scale={[1, heightScale, 1]}>
      <Head skinTone={avatarSkinTone} heightScale={heightScale} />
      <Neck skinTone={avatarSkinTone} heightScale={heightScale} />
      <Torso skinTone={avatarSkinTone} proportions={proportions} />
      <Arm side="left" skinTone={avatarSkinTone} proportions={proportions} />
      <Arm side="right" skinTone={avatarSkinTone} proportions={proportions} />
      <Leg side="left" skinTone={avatarSkinTone} proportions={proportions} />
      <Leg side="right" skinTone={avatarSkinTone} proportions={proportions} />
    </group>
  );
};
