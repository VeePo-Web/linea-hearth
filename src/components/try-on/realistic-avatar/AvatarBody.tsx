import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarBodyConfig } from '../avatar-creator/avatarPresets';
import { RealisticSkinMaterial } from './RealisticSkinMaterial';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AvatarBodyProps {
  config: AvatarBodyConfig;
  gender: 'male' | 'female' | 'non-binary';
  skinTone: string;
  isMobile?: boolean;
}

/**
 * Realistic human body with anatomical proportions
 * Uses the 8-head fashion scale with parametric adjustments
 */
export const AvatarBody = ({ config, gender, skinTone, isMobile = false }: AvatarBodyProps) => {
  const torsoRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();
  const segments = isMobile ? 16 : 32;
  
  // Calculate proportions from measurements (8-head scale)
  const proportions = useMemo(() => {
    const heightM = config.heightCm / 100;
    const headHeight = heightM / 8;
    
    // Body type adjustments
    const bodyTypeMod = {
      ectomorph: { shoulder: 0.92, hip: 0.9, torso: 1.02 },
      mesomorph: { shoulder: 1.05, hip: 0.95, torso: 1.0 },
      endomorph: { shoulder: 0.98, hip: 1.08, torso: 0.98 },
    }[config.bodyType];
    
    // Gender-specific proportions
    const genderMod = gender === 'female' 
      ? { shoulder: 0.88, hip: 1.05, waist: 0.85 }
      : gender === 'non-binary'
      ? { shoulder: 0.94, hip: 1.0, waist: 0.92 }
      : { shoulder: 1.0, hip: 0.95, waist: 1.0 };
    
    // Convert measurements to 3D units (scaled down for Three.js)
    const scale = 0.01; // cm to meters, then scaled for 3D
    
    return {
      height: heightM,
      headHeight,
      shoulderWidth: (config.shoulderWidthCm * scale) * bodyTypeMod.shoulder * genderMod.shoulder,
      chestDepth: (config.chestCm * scale / Math.PI) * 0.5,
      waistWidth: (config.waistCm * scale / Math.PI) * genderMod.waist,
      hipWidth: (config.hipsCm * scale / Math.PI) * bodyTypeMod.hip * genderMod.hip,
      armLength: (config.armLengthCm || config.heightCm * 0.36) * scale,
      legLength: (config.inseamCm * scale) * 1.1,
      neckRadius: (config.neckCircumferenceCm || 36) * scale / (Math.PI * 2),
      torsoLength: (config.torsoLengthCm || config.heightCm * 0.28) * scale * bodyTypeMod.torso,
      // Muscle definition affects limb thickness
      muscleMod: 0.85 + (config.muscleDefinition / 100) * 0.3,
    };
  }, [config, gender]);

  // Subtle breathing animation
  useFrame((state) => {
    if (prefersReducedMotion || !torsoRef.current) return;
    
    const t = state.clock.getElapsedTime();
    const breathCycle = Math.sin(t * 1.2);
    
    // Chest expansion (not height change)
    torsoRef.current.scale.z = 1 + breathCycle * 0.006;
    torsoRef.current.scale.x = 1 + breathCycle * 0.004;
  });

  // Create torso geometry
  const torsoGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const numPoints = 32;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      let radius: number;
      
      // Anatomical torso profile
      if (t < 0.15) {
        // Hip region
        const eased = THREE.MathUtils.smoothstep(t / 0.15, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.hipWidth, proportions.hipWidth * 0.95, eased);
      } else if (t < 0.4) {
        // Hip to waist
        const eased = THREE.MathUtils.smootherstep((t - 0.15) / 0.25, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.hipWidth * 0.95, proportions.waistWidth, eased);
      } else if (t < 0.55) {
        // Waist (narrowest)
        radius = proportions.waistWidth;
      } else if (t < 0.8) {
        // Waist to chest
        const eased = THREE.MathUtils.smootherstep((t - 0.55) / 0.25, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.waistWidth, proportions.chestDepth, eased);
      } else {
        // Chest to shoulders
        const eased = THREE.MathUtils.smoothstep((t - 0.8) / 0.2, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.chestDepth, proportions.neckRadius * 1.5, eased);
      }
      
      points.push(new THREE.Vector2(radius, t * proportions.torsoLength));
    }
    
    return new THREE.LatheGeometry(points, segments);
  }, [proportions, segments]);

  // Limb geometries
  const armThickness = proportions.shoulderWidth * 0.12 * proportions.muscleMod;
  const legThickness = proportions.hipWidth * 0.35 * proportions.muscleMod;
  
  // Position calculations (8-head scale)
  const crotchY = proportions.height * 0.5; // Legs start at 50% height
  const shoulderY = proportions.height * 0.82;
  const headY = proportions.height * 0.94;

  return (
    <group>
      {/* Torso */}
      <mesh 
        ref={torsoRef}
        geometry={torsoGeometry} 
        position={[0, crotchY, 0]}
      >
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Pelvis */}
      <mesh position={[0, crotchY - 0.02, 0]}>
        <sphereGeometry args={[proportions.hipWidth * 0.9, segments / 2, segments / 4, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.4]} />
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, shoulderY + proportions.torsoLength * 0.1, 0]}>
        <cylinderGeometry args={[proportions.neckRadius * 0.85, proportions.neckRadius, proportions.headHeight * 0.5, segments / 2]} />
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Left Arm */}
      <group position={[-proportions.shoulderWidth / 2, shoulderY, 0]} rotation={[0, 0, 0.08]}>
        {/* Shoulder */}
        <mesh>
          <sphereGeometry args={[armThickness * 1.2, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, -proportions.armLength * 0.25, 0]}>
          <cylinderGeometry args={[armThickness, armThickness * 0.9, proportions.armLength * 0.45, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -proportions.armLength * 0.48, 0]}>
          <sphereGeometry args={[armThickness * 0.85, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -proportions.armLength * 0.72, 0]}>
          <cylinderGeometry args={[armThickness * 0.85, armThickness * 0.6, proportions.armLength * 0.4, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -proportions.armLength * 0.95, 0]}>
          <sphereGeometry args={[armThickness * 0.55, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
      </group>
      
      {/* Right Arm (mirrored) */}
      <group position={[proportions.shoulderWidth / 2, shoulderY, 0]} rotation={[0, 0, -0.05]}>
        <mesh>
          <sphereGeometry args={[armThickness * 1.2, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.25, 0]}>
          <cylinderGeometry args={[armThickness, armThickness * 0.9, proportions.armLength * 0.45, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.48, 0]}>
          <sphereGeometry args={[armThickness * 0.85, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.72, 0]}>
          <cylinderGeometry args={[armThickness * 0.85, armThickness * 0.6, proportions.armLength * 0.4, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.95, 0]}>
          <sphereGeometry args={[armThickness * 0.55, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
      </group>
      
      {/* Left Leg */}
      <group position={[-proportions.hipWidth * 0.35, crotchY, 0]} rotation={[0, 0, 0.015]}>
        {/* Hip joint */}
        <mesh>
          <sphereGeometry args={[legThickness * 0.9, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Thigh */}
        <mesh position={[0, -proportions.legLength * 0.22, 0]}>
          <cylinderGeometry args={[legThickness, legThickness * 0.8, proportions.legLength * 0.4, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -proportions.legLength * 0.45, 0]}>
          <sphereGeometry args={[legThickness * 0.7, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -proportions.legLength * 0.68, 0]}>
          <cylinderGeometry args={[legThickness * 0.7, legThickness * 0.4, proportions.legLength * 0.38, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Ankle */}
        <mesh position={[0, -proportions.legLength * 0.9, 0]}>
          <sphereGeometry args={[legThickness * 0.35, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -proportions.legLength * 0.95, legThickness * 0.5]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[legThickness * 0.8, legThickness * 0.3, legThickness * 1.5]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
      </group>
      
      {/* Right Leg (mirrored) */}
      <group position={[proportions.hipWidth * 0.35, crotchY, 0]} rotation={[0, 0, -0.02]}>
        <mesh>
          <sphereGeometry args={[legThickness * 0.9, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.22, 0]}>
          <cylinderGeometry args={[legThickness, legThickness * 0.8, proportions.legLength * 0.4, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.45, 0]}>
          <sphereGeometry args={[legThickness * 0.7, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.68, 0]}>
          <cylinderGeometry args={[legThickness * 0.7, legThickness * 0.4, proportions.legLength * 0.38, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.9, 0]}>
          <sphereGeometry args={[legThickness * 0.35, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.95, legThickness * 0.5]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[legThickness * 0.8, legThickness * 0.3, legThickness * 1.5]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
      </group>
    </group>
  );
};
