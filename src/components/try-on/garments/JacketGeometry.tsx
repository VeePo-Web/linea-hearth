import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface JacketGeometryProps {
  color?: string;
  imageUrl?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
  style?: 'coach' | 'bomber' | 'windbreaker';
}

export const JacketGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  bodyScale = { shoulderWidth: 0.42, waistWidth: 0.34 },
  style = 'coach'
}: JacketGeometryProps) => {
  const material = useFabricMaterial({ 
    type: style === 'bomber' ? 'leather' : 'cotton', 
    color, 
    imageUrl 
  });

  // Create jacket body profile - slightly boxier than hoodie
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 24;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Collar area
        radius = THREE.MathUtils.lerp(0.11, bodyScale.shoulderWidth / 2 + 0.03, t / 0.08);
      } else if (t < 0.4) {
        // Shoulders - jackets are more structured
        const localT = (t - 0.08) / 0.32;
        radius = THREE.MathUtils.lerp(
          bodyScale.shoulderWidth / 2 + 0.03, 
          bodyScale.waistWidth / 2 + 0.05, 
          localT * 0.25
        );
      } else if (t < 0.75) {
        // Body - straighter cut than hoodie
        const localT = (t - 0.4) / 0.35;
        radius = THREE.MathUtils.lerp(
          bodyScale.waistWidth / 2 + 0.05, 
          bodyScale.waistWidth / 2 + 0.045, 
          localT
        );
      } else {
        // Hem
        const localT = (t - 0.75) / 0.25;
        radius = THREE.MathUtils.lerp(
          bodyScale.waistWidth / 2 + 0.045, 
          bodyScale.waistWidth / 2 + 0.055, 
          localT
        );
      }
      
      const y = THREE.MathUtils.lerp(0.30, -0.28, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 36);
  }, [bodyScale]);

  // Shoulder cap geometry
  const shoulderCapGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.072, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  }, []);

  return (
    <group position={[0, 1.22, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Stand collar - upright band */}
      <group position={[0, 0.32, 0]}>
        <mesh>
          <cylinderGeometry args={[0.115, 0.11, 0.05, 24, 1, true]} />
          {material}
        </mesh>
        {/* Collar top edge */}
        <mesh position={[0, 0.028, 0]}>
          <torusGeometry args={[0.115, 0.008, 8, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* Front zip line */}
      <mesh position={[0, 0.02, bodyScale.waistWidth / 2 + 0.03]}>
        <boxGeometry args={[0.015, 0.52, 0.012]} />
        <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Zip pull tab */}
      <mesh position={[0, 0.15, bodyScale.waistWidth / 2 + 0.04]}>
        <boxGeometry args={[0.012, 0.025, 0.008]} />
        <meshStandardMaterial color="#a1a1aa" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Left sleeve with shoulder cap */}
      <group position={[-0.25, 0.20, 0]} rotation={[0, 0, 0.32]}>
        <mesh geometry={shoulderCapGeometry} position={[0, 0.04, 0]} rotation={[0, 0, -0.32]}>
          {material}
        </mesh>
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.072, 0.062, 0.40, 24]} />
          {material}
        </mesh>
        {/* Cuff - elastic or ribbed */}
        <mesh position={[0, -0.36, 0]}>
          <torusGeometry args={[0.058, 0.015, 10, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* Right sleeve with shoulder cap */}
      <group position={[0.25, 0.20, 0]} rotation={[0, 0, -0.32]}>
        <mesh geometry={shoulderCapGeometry} position={[0, 0.04, 0]} rotation={[0, 0, 0.32]}>
          {material}
        </mesh>
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.072, 0.062, 0.40, 24]} />
          {material}
        </mesh>
        {/* Cuff */}
        <mesh position={[0, -0.36, 0]}>
          <torusGeometry args={[0.058, 0.015, 10, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* Welt pockets - diagonal slash style */}
      <group position={[-0.10, -0.08, bodyScale.waistWidth / 2 + 0.02]} rotation={[0, 0, -0.15]}>
        <mesh>
          <boxGeometry args={[0.08, 0.012, 0.015]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>
      <group position={[0.10, -0.08, bodyScale.waistWidth / 2 + 0.02]} rotation={[0, 0, 0.15]}>
        <mesh>
          <boxGeometry args={[0.08, 0.012, 0.015]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>
      
      {/* Hem ribbing (bomber style) or elastic band */}
      {style === 'bomber' ? (
        <mesh position={[0, -0.30, 0]}>
          <torusGeometry args={[bodyScale.waistWidth / 2 + 0.055, 0.025, 12, 36]} />
          {material}
        </mesh>
      ) : (
        <mesh position={[0, -0.30, 0]}>
          <torusGeometry args={[bodyScale.waistWidth / 2 + 0.055, 0.015, 8, 36]} />
          {material}
        </mesh>
      )}
    </group>
  );
};
