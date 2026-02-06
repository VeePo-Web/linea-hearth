import { useMemo } from 'react';
import * as THREE from 'three';

type HairStyle = 'bald' | 'buzz' | 'short' | 'medium' | 'long' | 'ponytail' | 'braids' | 'afro' | 'curly';
type Hairline = 'full' | 'receding' | 'widows-peak';

interface AvatarHairProps {
  style: HairStyle;
  color: string;
  hairline: Hairline;
  headRadius: number;
  isMobile?: boolean;
}

/**
 * Procedural hair system - generates hair geometry based on style
 * Phase 1: Uses primitives to approximate hair silhouettes
 * Phase 2: Will use pre-modeled GLB assets for higher fidelity
 */
export const AvatarHair = ({ 
  style, 
  color, 
  hairline,
  headRadius, 
  isMobile = false 
}: AvatarHairProps) => {
  const segments = isMobile ? 12 : 24;
  
  // Common material for hair
  const material = useMemo(() => (
    <meshStandardMaterial 
      color={color}
      roughness={0.65}
      metalness={0.1}
    />
  ), [color]);

  if (style === 'bald') {
    return null;
  }

  // Buzz cut - thin cap on head
  if (style === 'buzz') {
    return (
      <mesh position={[0, headRadius * 0.15, 0]}>
        <sphereGeometry args={[headRadius * 0.92, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        {material}
      </mesh>
    );
  }

  // Short hair - slightly thicker cap with some volume
  if (style === 'short') {
    return (
      <group>
        <mesh position={[0, headRadius * 0.18, headRadius * 0.02]}>
          <sphereGeometry args={[headRadius * 0.95, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          {material}
        </mesh>
        {/* Slight front fringe */}
        <mesh position={[0, headRadius * 0.5, headRadius * 0.7]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[headRadius * 0.8, headRadius * 0.15, headRadius * 0.2]} />
          {material}
        </mesh>
      </group>
    );
  }

  // Medium hair - more volume, covers ears partially
  if (style === 'medium') {
    return (
      <group>
        {/* Main hair volume */}
        <mesh position={[0, headRadius * 0.2, -headRadius * 0.05]}>
          <sphereGeometry args={[headRadius * 1.02, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          {material}
        </mesh>
        {/* Side volume */}
        <mesh position={[-headRadius * 0.6, -headRadius * 0.1, 0]}>
          <sphereGeometry args={[headRadius * 0.4, segments / 2, segments / 2]} />
          {material}
        </mesh>
        <mesh position={[headRadius * 0.6, -headRadius * 0.1, 0]}>
          <sphereGeometry args={[headRadius * 0.4, segments / 2, segments / 2]} />
          {material}
        </mesh>
      </group>
    );
  }

  // Long hair - flows down past shoulders
  if (style === 'long') {
    return (
      <group>
        {/* Top volume */}
        <mesh position={[0, headRadius * 0.2, -headRadius * 0.05]}>
          <sphereGeometry args={[headRadius * 1.05, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          {material}
        </mesh>
        {/* Back hair flowing down */}
        <mesh position={[0, -headRadius * 0.6, -headRadius * 0.35]} rotation={[-0.15, 0, 0]}>
          <cylinderGeometry args={[headRadius * 0.7, headRadius * 0.85, headRadius * 1.8, segments, 4]} />
          {material}
        </mesh>
        {/* Side hair */}
        <mesh position={[-headRadius * 0.55, -headRadius * 0.3, headRadius * 0.1]}>
          <cylinderGeometry args={[headRadius * 0.25, headRadius * 0.3, headRadius * 1.2, segments / 2, 2]} />
          {material}
        </mesh>
        <mesh position={[headRadius * 0.55, -headRadius * 0.3, headRadius * 0.1]}>
          <cylinderGeometry args={[headRadius * 0.25, headRadius * 0.3, headRadius * 1.2, segments / 2, 2]} />
          {material}
        </mesh>
      </group>
    );
  }

  // Ponytail - tied back with tail
  if (style === 'ponytail') {
    return (
      <group>
        {/* Pulled back top */}
        <mesh position={[0, headRadius * 0.22, -headRadius * 0.1]}>
          <sphereGeometry args={[headRadius * 0.98, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          {material}
        </mesh>
        {/* Ponytail bun */}
        <mesh position={[0, headRadius * 0.1, -headRadius * 0.85]}>
          <sphereGeometry args={[headRadius * 0.25, segments / 2, segments / 2]} />
          {material}
        </mesh>
        {/* Ponytail tail */}
        <mesh position={[0, -headRadius * 0.4, -headRadius * 0.9]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[headRadius * 0.12, headRadius * 0.08, headRadius * 1.2, segments / 2, 2]} />
          {material}
        </mesh>
      </group>
    );
  }

  // Braids - multiple cylindrical strands
  if (style === 'braids') {
    const braidPositions = [
      [-0.4, 0.15], [-0.2, 0.1], [0, 0.08], [0.2, 0.1], [0.4, 0.15],
    ];
    
    return (
      <group>
        {/* Top cap */}
        <mesh position={[0, headRadius * 0.25, 0]}>
          <sphereGeometry args={[headRadius * 0.95, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          {material}
        </mesh>
        {/* Individual braids */}
        {braidPositions.map(([x, z], i) => (
          <mesh 
            key={i} 
            position={[headRadius * x, -headRadius * 0.5, headRadius * z]}
            rotation={[0.05 * (i - 2), 0, 0.02 * (i - 2)]}
          >
            <cylinderGeometry args={[headRadius * 0.06, headRadius * 0.04, headRadius * 1.6, 8, 4]} />
            {material}
          </mesh>
        ))}
      </group>
    );
  }

  // Afro - large spherical volume
  if (style === 'afro') {
    return (
      <mesh position={[0, headRadius * 0.35, 0]}>
        <sphereGeometry args={[headRadius * 1.35, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
    );
  }

  // Curly - medium volume with texture suggestion
  if (style === 'curly') {
    return (
      <group>
        {/* Main curly volume */}
        <mesh position={[0, headRadius * 0.22, 0]}>
          <sphereGeometry args={[headRadius * 1.08, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.8}
            metalness={0}
          />
        </mesh>
        {/* Side curls */}
        <mesh position={[-headRadius * 0.65, -headRadius * 0.05, headRadius * 0.1]}>
          <sphereGeometry args={[headRadius * 0.35, segments / 2, segments / 2]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[headRadius * 0.65, -headRadius * 0.05, headRadius * 0.1]}>
          <sphereGeometry args={[headRadius * 0.35, segments / 2, segments / 2]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  return null;
};
