import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTryOnState } from '@/hooks/useTryOnState';
import * as THREE from 'three';

interface Avatar3DProps {
  position?: [number, number, number];
}

export const Avatar3D = ({ position = [0, 0, 0] }: Avatar3DProps) => {
  const { avatarGender, avatarBodyType, avatarSkinTone, equippedItems } = useTryOnState();
  const groupRef = useRef<THREE.Group>(null);
  const breathRef = useRef(0);

  // Body proportions based on body type
  const bodyScale = useMemo(() => {
    const scales = {
      slim: { x: 0.85, y: 1, z: 0.85 },
      athletic: { x: 0.95, y: 1, z: 0.9 },
      average: { x: 1, y: 1, z: 1 },
      curvy: { x: 1.1, y: 1, z: 1.1 },
    };
    return scales[avatarBodyType] || scales.average;
  }, [avatarBodyType]);

  // Gender adjustments
  const genderScale = useMemo(() => {
    return avatarGender === 'female' 
      ? { shoulders: 0.9, hips: 1.1, height: 0.95 }
      : { shoulders: 1.1, hips: 0.95, height: 1 };
  }, [avatarGender]);

  // Subtle breathing animation
  useFrame((state) => {
    if (groupRef.current) {
      breathRef.current += 0.02;
      const breathAmount = Math.sin(breathRef.current) * 0.005;
      groupRef.current.scale.y = genderScale.height + breathAmount;
    }
  });

  const skinColor = new THREE.Color(avatarSkinTone);

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Torso */}
      <mesh 
        position={[0, 1.15, 0]} 
        scale={[bodyScale.x * genderScale.shoulders, 1, bodyScale.z]}
      >
        <boxGeometry args={[0.4, 0.5, 0.2]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Hips */}
      <mesh 
        position={[0, 0.8, 0]}
        scale={[bodyScale.x * genderScale.hips, 1, bodyScale.z]}
      >
        <boxGeometry args={[0.35, 0.2, 0.18]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Left Arm */}
      <group position={[-0.28 * bodyScale.x * genderScale.shoulders, 1.2, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.3, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.035, 0.03, 0.28, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.28 * bodyScale.x * genderScale.shoulders, 1.2, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.3, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.035, 0.03, 0.28, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.1, 0.65, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.4, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.35, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.1, 0.65, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.4, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.35, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Equipped Clothing Items */}
      <ClothingLayer slot="head" equipped={equippedItems.head} bodyScale={bodyScale} genderScale={genderScale} />
      <ClothingLayer slot="top" equipped={equippedItems.top} bodyScale={bodyScale} genderScale={genderScale} />
      <ClothingLayer slot="outerwear" equipped={equippedItems.outerwear} bodyScale={bodyScale} genderScale={genderScale} />
      <ClothingLayer slot="bottom" equipped={equippedItems.bottom} bodyScale={bodyScale} genderScale={genderScale} />
      <ClothingLayer slot="footwear" equipped={equippedItems.footwear} bodyScale={bodyScale} genderScale={genderScale} />
    </group>
  );
};

interface ClothingLayerProps {
  slot: string;
  equipped: any;
  bodyScale: { x: number; y: number; z: number };
  genderScale: { shoulders: number; hips: number; height: number };
}

const ClothingLayer = ({ slot, equipped, bodyScale, genderScale }: ClothingLayerProps) => {
  if (!equipped) return null;

  // Generate a color from the product name for visual variety
  const color = useMemo(() => {
    const colors = ['#1a1a1a', '#2d2d2d', '#4a4a4a', '#1e3a5f', '#3d1e5f'];
    const index = equipped.name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  }, [equipped.name]);

  switch (slot) {
    case 'head':
      return (
        <mesh position={[0, 1.72, 0]}>
          <cylinderGeometry args={[0.14, 0.13, 0.08, 32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      );
    
    case 'top':
      return (
        <mesh 
          position={[0, 1.15, 0]} 
          scale={[bodyScale.x * genderScale.shoulders * 1.05, 1.02, bodyScale.z * 1.05]}
        >
          <boxGeometry args={[0.42, 0.52, 0.22]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      );
    
    case 'outerwear':
      return (
        <mesh 
          position={[0, 1.15, 0]} 
          scale={[bodyScale.x * genderScale.shoulders * 1.12, 1.05, bodyScale.z * 1.1]}
        >
          <boxGeometry args={[0.44, 0.55, 0.24]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      );
    
    case 'bottom':
      return (
        <group>
          {/* Left leg clothing */}
          <mesh position={[-0.1, 0.45, 0]}>
            <cylinderGeometry args={[0.065, 0.055, 0.4, 16]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          <mesh position={[-0.1, 0.1, 0]}>
            <cylinderGeometry args={[0.055, 0.045, 0.35, 16]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Right leg clothing */}
          <mesh position={[0.1, 0.45, 0]}>
            <cylinderGeometry args={[0.065, 0.055, 0.4, 16]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          <mesh position={[0.1, 0.1, 0]}>
            <cylinderGeometry args={[0.055, 0.045, 0.35, 16]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Waist */}
          <mesh position={[0, 0.75, 0]} scale={[bodyScale.x * genderScale.hips * 1.05, 1, bodyScale.z * 1.02]}>
            <boxGeometry args={[0.36, 0.15, 0.19]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        </group>
      );
    
    case 'footwear':
      return (
        <group>
          <mesh position={[-0.1, -0.12, 0.03]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.08, 0.06, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0.1, -0.12, 0.03]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.08, 0.06, 0.14]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      );
    
    default:
      return null;
  }
};
