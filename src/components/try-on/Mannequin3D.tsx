import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  getBodyProportions, 
  MannequinProportions,
  EIGHT_HEAD_SCALE,
  getScaledBodyPositions,
} from './utils/measurementToProportions';

/**
 * MANNEQUIN 3D - Anatomically Correct Human Form
 * 
 * Uses 8-HEAD FASHION SCALE for industry-standard proportions:
 * - Legs = 50% of total height (4 heads)
 * - Torso = 37.5% of height (3 heads)
 * - Head = 12.5% of height (1 head)
 * 
 * All proportions imported from centralized measurementToProportions.ts
 */

interface MannequinProps {
  position?: [number, number, number];
}

// Default ceramic skin tone for mannequin aesthetic
const DEFAULT_CERAMIC_TONE = '#D4D4D4';

// ============================================
// SKIN MATERIAL COMPONENT
// ============================================
// Uses meshPhysicalMaterial for realistic skin with subsurface scattering

const SkinMaterial = ({ skinTone }: { skinTone: string }) => {
  const isDefaultCeramic = skinTone === DEFAULT_CERAMIC_TONE || skinTone === '#D4A574';
  
  if (isDefaultCeramic) {
    // Matte ceramic/plaster museum-quality finish
    return (
      <meshStandardMaterial
        color={skinTone}
        roughness={0.75}
        metalness={0.0}
        envMapIntensity={0.2}
      />
    );
  }
  
  // Realistic skin with subtle subsurface scattering effect
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.6}
      metalness={0.0}
      transmission={0.05}        // Subtle transparency for SSS effect
      thickness={0.2}            // Depth for transmission
      ior={1.4}                  // Skin's index of refraction
      clearcoat={0.08}           // Very subtle sheen
      clearcoatRoughness={0.5}
    />
  );
};

// ============================================
// TORSO GEOMETRY
// ============================================
// Creates anatomically correct torso from hips to shoulders

const createTorsoGeometry = (props: MannequinProportions, positions: ReturnType<typeof getScaledBodyPositions>) => {
  const points: THREE.Vector2[] = [];
  const segments = 32;
  
  // Torso spans from crotch line to shoulder line
  const torsoHeight = positions.shoulderLine - positions.crotchLine;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let radius: number;
    
    if (t < 0.15) {
      // Hips to waist (narrowing) - bottom of torso
      const localT = t / 0.15;
      radius = THREE.MathUtils.lerp(props.hipWidth / 2, props.waistWidth / 2, localT);
    } else if (t < 0.50) {
      // Waist to chest (expanding)
      const localT = (t - 0.15) / 0.35;
      radius = THREE.MathUtils.lerp(props.waistWidth / 2, props.chestDepth, localT);
    } else if (t < 0.80) {
      // Chest region (widest point)
      const localT = (t - 0.50) / 0.30;
      const chestMax = Math.max(props.chestDepth, props.shoulderWidth / 2 * 0.8);
      radius = THREE.MathUtils.lerp(props.chestDepth, chestMax, localT * 0.5);
    } else {
      // Chest to shoulders (tapering to neck)
      const localT = (t - 0.80) / 0.20;
      const neckRadius = props.shoulderWidth * 0.15;
      radius = THREE.MathUtils.lerp(props.shoulderWidth / 2 * 0.5, neckRadius, localT);
    }
    
    const y = t * torsoHeight;
    points.push(new THREE.Vector2(radius, y));
  }
  
  return new THREE.LatheGeometry(points, 40);
};

// ============================================
// PELVIS GEOMETRY
// ============================================
// Smooth transition from legs to torso

const createPelvisGeometry = (props: MannequinProportions) => {
  const points: THREE.Vector2[] = [];
  const segments = 12;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Pelvis is wider at bottom (leg attachment) and tapers to torso
    const radius = THREE.MathUtils.lerp(
      props.hipWidth / 2 + 0.015, // Bottom - slightly wider for leg joints
      props.hipWidth / 2,          // Top - matches torso bottom
      t
    );
    const y = t * 0.08; // Small pelvis region
    points.push(new THREE.Vector2(radius, y));
  }
  
  return new THREE.LatheGeometry(points, 32);
};

// ============================================
// HEAD COMPONENT
// ============================================

const Head = ({ skinTone, positions }: { skinTone: string; positions: ReturnType<typeof getScaledBodyPositions> }) => {
  // Head size = 1/8 of total height
  const headHeight = positions.headTop - positions.headBottom;
  const headRadius = headHeight / 2;
  const headCenterY = positions.headBottom + headRadius;
  
  return (
    <group position={[0, headCenterY, 0]}>
      {/* Main skull - slightly oval */}
      <mesh scale={[1, 1.1, 0.95]}>
        <sphereGeometry args={[headRadius * 0.9, 32, 24]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      {/* Subtle jaw shape */}
      <mesh position={[0, -headRadius * 0.4, headRadius * 0.15]} scale={[0.8, 0.6, 0.85]}>
        <sphereGeometry args={[headRadius * 0.6, 16, 12]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// NECK COMPONENT
// ============================================

const Neck = ({ skinTone, proportions, positions }: { 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
}) => {
  const neckLength = positions.headBottom - positions.neckBase;
  const neckRadius = proportions.shoulderWidth * 0.11;
  const neckY = positions.neckBase + neckLength / 2;
  
  return (
    <mesh position={[0, neckY, 0]}>
      <cylinderGeometry args={[neckRadius * 0.85, neckRadius, neckLength, 20]} />
      <SkinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// ============================================
// TORSO COMPONENT
// ============================================

const Torso = ({ skinTone, proportions, positions }: { 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
}) => {
  const geometry = useMemo(
    () => createTorsoGeometry(proportions, positions), 
    [proportions, positions]
  );
  
  return (
    <mesh position={[0, positions.crotchLine, 0]} geometry={geometry}>
      <SkinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// ============================================
// PELVIS COMPONENT
// ============================================

const Pelvis = ({ skinTone, proportions, positions }: { 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
}) => {
  const geometry = useMemo(() => createPelvisGeometry(proportions), [proportions]);
  const pelvisY = positions.crotchLine - 0.08; // Just below crotch line
  
  return (
    <mesh position={[0, pelvisY, 0]} geometry={geometry}>
      <SkinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// ============================================
// ARM COMPONENT
// ============================================
// Arms attach at shoulder line, using bezier-like transitions

const Arm = ({ 
  side, 
  skinTone, 
  proportions,
  positions,
}: { 
  side: 'left' | 'right'; 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
}) => {
  const sign = side === 'left' ? -1 : 1;
  const xPos = sign * (proportions.shoulderWidth / 2 + proportions.armThickness * 0.3);
  const rotation = sign * 0.1; // Slight natural arm angle
  
  // Calculate arm segment lengths (8-head proportions)
  const upperArmLength = proportions.armLength * 0.48;
  const forearmLength = proportions.armLength * 0.44;
  const handLength = proportions.armLength * 0.08;
  
  // Joint radii - natural proportions without bulging
  const shoulderRadius = proportions.armThickness * 1.0;
  const elbowRadius = proportions.armThickness * 0.85;
  const wristRadius = proportions.armThickness * 0.55;
  
  return (
    <group position={[xPos, positions.shoulderLine, 0]} rotation={[0, 0, rotation]}>
      {/* Shoulder joint - smooth blend */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[shoulderRadius, 16, 16]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Upper arm */}
      <mesh position={[0, -upperArmLength / 2, 0]}>
        <cylinderGeometry args={[proportions.armThickness, proportions.armThickness * 0.9, upperArmLength, 20]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Elbow joint */}
      <mesh position={[0, -upperArmLength, 0]}>
        <sphereGeometry args={[elbowRadius, 12, 12]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Forearm - tapers to wrist */}
      <mesh position={[0, -upperArmLength - forearmLength / 2, 0]}>
        <cylinderGeometry args={[proportions.armThickness * 0.85, wristRadius, forearmLength, 20]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Wrist/Hand - simplified */}
      <mesh position={[0, -upperArmLength - forearmLength - handLength / 2, 0]}>
        <capsuleGeometry args={[wristRadius * 0.9, handLength, 8, 12]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// LEG COMPONENT
// ============================================
// Legs = 50% of total height (4 head units)

const Leg = ({ 
  side, 
  skinTone, 
  proportions,
  positions,
}: { 
  side: 'left' | 'right'; 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
}) => {
  const sign = side === 'left' ? -1 : 1;
  const xPos = sign * 0.085; // Leg spread
  
  // Calculate leg segment lengths
  const thighLength = proportions.legLength * 0.52; // Upper leg
  const calfLength = proportions.legLength * 0.43;  // Lower leg
  const footHeight = 0.06;
  
  // Joint radii - anatomically proportioned
  const hipRadius = proportions.legThickness * 1.0;
  const kneeRadius = proportions.legThickness * 0.82;
  const ankleRadius = proportions.legThickness * 0.45;
  
  // Leg starts at crotch line
  const legTopY = positions.crotchLine;
  
  return (
    <group position={[xPos, legTopY, 0]}>
      {/* Hip joint sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[hipRadius, 16, 16]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Thigh - tapers toward knee */}
      <mesh position={[0, -thighLength / 2, 0]}>
        <cylinderGeometry args={[proportions.legThickness, proportions.legThickness * 0.82, thighLength, 24]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Knee joint */}
      <mesh position={[0, -thighLength, 0]}>
        <sphereGeometry args={[kneeRadius, 12, 12]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Calf - tapers toward ankle */}
      <mesh position={[0, -thighLength - calfLength / 2, 0]}>
        <cylinderGeometry args={[proportions.legThickness * 0.75, ankleRadius, calfLength, 24]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Ankle joint */}
      <mesh position={[0, -thighLength - calfLength, 0]}>
        <sphereGeometry args={[ankleRadius, 10, 10]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Foot - capsule shape */}
      <mesh position={[0, -thighLength - calfLength - footHeight / 2, 0.035]} rotation={[Math.PI / 2.5, 0, 0]}>
        <capsuleGeometry args={[proportions.legThickness * 0.4, 0.10, 8, 16]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// MAIN MANNEQUIN COMPONENT
// ============================================

export const Mannequin3D = ({ position = [0, 0, 0] }: MannequinProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { 
    avatarGender, 
    avatarBodyType, 
    avatarSkinTone, 
    measurements, 
    useDetailedMeasurements 
  } = useTryOnState();
  const reducedMotion = useReducedMotion();
  
  // Get proportions from unified source
  const proportions = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements),
    [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]
  );
  
  // Get scaled body positions based on calculated height
  const positions = useMemo(
    () => getScaledBodyPositions(proportions.height),
    [proportions.height]
  );

  // Calculate height scale for uniform scaling
  const heightScale = useMemo(() => {
    return proportions.height / EIGHT_HEAD_SCALE.referenceHeight;
  }, [proportions.height]);

  // Subtle breathing animation (disabled for reduced motion)
  useFrame((state) => {
    if (groupRef.current && !reducedMotion) {
      const breathe = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.002;
      groupRef.current.scale.y = heightScale * (1 + breathe);
    }
  });

  // Position offset to keep feet on ground during scaling
  const yOffset = useMemo(() => {
    return (heightScale - 1) * EIGHT_HEAD_SCALE.crotchLine;
  }, [heightScale]);

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1] + yOffset, position[2]]} 
      scale={[heightScale * 0.97, heightScale, heightScale * 0.97]} // Proportional width scaling
    >
      {/* Head - top of figure */}
      <Head skinTone={avatarSkinTone} positions={positions} />
      
      {/* Neck - connects head to torso */}
      <Neck skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
      
      {/* Torso - main body from hips to shoulders */}
      <Torso skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
      
      {/* Pelvis - hip region connecting torso to legs */}
      <Pelvis skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
      
      {/* Arms - attach at shoulder level */}
      <Arm side="left" skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
      <Arm side="right" skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
      
      {/* Legs - attach at hip level, 50% of body height */}
      <Leg side="left" skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
      <Leg side="right" skinTone={avatarSkinTone} proportions={proportions} positions={positions} />
    </group>
  );
};
