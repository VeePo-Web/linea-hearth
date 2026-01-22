import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface CrewneckGeometryProps {
  color?: string;
  imageUrl?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
}

export const CrewneckGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 }
}: CrewneckGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'cotton', 
    color, 
    imageUrl 
  });

  // Create crewneck body profile
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Crew neck collar
        radius = THREE.MathUtils.lerp(0.10, bodyScale.shoulderWidth / 2 + 0.015, t / 0.08);
      } else if (t < 0.35) {
        // Shoulders to chest
        const localT = (t - 0.08) / 0.27;
        radius = THREE.MathUtils.lerp(bodyScale.shoulderWidth / 2 + 0.015, bodyScale.waistWidth / 2 + 0.03, localT * 0.4);
      } else if (t < 0.7) {
        // Chest to waist
        const localT = (t - 0.35) / 0.35;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.03, bodyScale.waistWidth / 2 + 0.025, localT);
      } else {
        // Hem
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.025, bodyScale.waistWidth / 2 + 0.04, localT);
      }
      
      const y = THREE.MathUtils.lerp(0.28, -0.28, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 32);
  }, [bodyScale]);

  return (
    <group position={[0, 1.22, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Crew neck collar ribbing */}
      <mesh position={[0, 0.30, 0]}>
        <torusGeometry args={[0.10, 0.022, 12, 32]} />
        {material}
      </mesh>
      
      {/* Left sleeve */}
      <group position={[-0.23, 0.18, 0]} rotation={[0, 0, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.058, 0.050, 0.32, 20]} />
          {material}
        </mesh>
        {/* Sleeve cuff ribbing */}
        <mesh position={[0, -0.17, 0]}>
          <torusGeometry args={[0.048, 0.012, 8, 20]} />
          {material}
        </mesh>
      </group>
      
      {/* Right sleeve */}
      <group position={[0.23, 0.18, 0]} rotation={[0, 0, -0.35]}>
        <mesh>
          <cylinderGeometry args={[0.058, 0.050, 0.32, 20]} />
          {material}
        </mesh>
        {/* Sleeve cuff ribbing */}
        <mesh position={[0, -0.17, 0]}>
          <torusGeometry args={[0.048, 0.012, 8, 20]} />
          {material}
        </mesh>
      </group>
      
      {/* Bottom ribbing */}
      <mesh position={[0, -0.30, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.04, 0.018, 8, 32]} />
        {material}
      </mesh>
    </group>
  );
};
