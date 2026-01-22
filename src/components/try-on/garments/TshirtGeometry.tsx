import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface TshirtGeometryProps {
  color?: string;
  imageUrl?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
}

export const TshirtGeometry = ({ 
  color = '#FAFAFA', 
  imageUrl,
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 }
}: TshirtGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'cotton', 
    color, 
    imageUrl 
  });

  // Create t-shirt body profile
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Crew neck
        radius = THREE.MathUtils.lerp(0.09, bodyScale.shoulderWidth / 2 + 0.01, t / 0.08);
      } else if (t < 0.3) {
        // Shoulders 
        const localT = (t - 0.08) / 0.22;
        radius = THREE.MathUtils.lerp(bodyScale.shoulderWidth / 2 + 0.01, bodyScale.waistWidth / 2 + 0.02, localT * 0.3);
      } else if (t < 0.8) {
        // Body (slight taper)
        const localT = (t - 0.3) / 0.5;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.02, bodyScale.waistWidth / 2 + 0.015, localT);
      } else {
        // Hem
        radius = bodyScale.waistWidth / 2 + 0.02;
      }
      
      const y = THREE.MathUtils.lerp(0.25, -0.25, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 32);
  }, [bodyScale]);

  return (
    <group position={[0, 1.24, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Collar */}
      <mesh position={[0, 0.27, 0]}>
        <torusGeometry args={[0.09, 0.015, 8, 32]} />
        {material}
      </mesh>
      
      {/* Left short sleeve */}
      <group position={[-0.22, 0.18, 0]} rotation={[0, 0, 0.45]}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.06, 0.14, 16]} />
          {material}
        </mesh>
      </group>
      
      {/* Right short sleeve */}
      <group position={[0.22, 0.18, 0]} rotation={[0, 0, -0.45]}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.06, 0.14, 16]} />
          {material}
        </mesh>
      </group>
    </group>
  );
};
