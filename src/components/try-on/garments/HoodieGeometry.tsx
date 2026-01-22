import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface HoodieGeometryProps {
  color?: string;
  imageUrl?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
}

export const HoodieGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 }
}: HoodieGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'fleece', 
    color, 
    imageUrl 
  });

  // Create hoodie body profile for lathe geometry
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.1) {
        // Collar
        radius = THREE.MathUtils.lerp(0.12, bodyScale.shoulderWidth / 2 + 0.02, t / 0.1);
      } else if (t < 0.4) {
        // Chest area
        const localT = (t - 0.1) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.shoulderWidth / 2 + 0.02, bodyScale.waistWidth / 2 + 0.04, localT * 0.3);
      } else if (t < 0.7) {
        // Waist
        const localT = (t - 0.4) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.04, bodyScale.waistWidth / 2 + 0.03, localT);
      } else {
        // Hem (slight flare)
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.03, bodyScale.waistWidth / 2 + 0.05, localT);
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
      
      {/* Hood - curved shell */}
      <mesh position={[0, 0.32, -0.06]} rotation={[0.3, 0, 0]}>
        <sphereGeometry args={[0.14, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        {material}
      </mesh>
      
      {/* Hood rim/edge */}
      <mesh position={[0, 0.38, 0.02]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.11, 0.015, 8, 24, Math.PI]} />
        {material}
      </mesh>
      
      {/* Left sleeve */}
      <group position={[-0.24, 0.18, 0]} rotation={[0, 0, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.055, 0.35, 20]} />
          {material}
        </mesh>
        {/* Sleeve cuff */}
        <mesh position={[0, -0.19, 0]}>
          <torusGeometry args={[0.052, 0.012, 8, 20]} />
          {material}
        </mesh>
      </group>
      
      {/* Right sleeve */}
      <group position={[0.24, 0.18, 0]} rotation={[0, 0, -0.35]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.055, 0.35, 20]} />
          {material}
        </mesh>
        {/* Sleeve cuff */}
        <mesh position={[0, -0.19, 0]}>
          <torusGeometry args={[0.052, 0.012, 8, 20]} />
          {material}
        </mesh>
      </group>
      
      {/* Kangaroo pocket */}
      <mesh position={[0, -0.08, 0.18]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.025]} />
        {material}
      </mesh>
      
      {/* Pocket opening line */}
      <mesh position={[0, -0.04, 0.195]}>
        <boxGeometry args={[0.18, 0.008, 0.005]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
      
      {/* Drawstrings */}
      <mesh position={[-0.04, 0.28, 0.13]}>
        <cylinderGeometry args={[0.004, 0.004, 0.15, 8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.28, 0.13]}>
        <cylinderGeometry args={[0.004, 0.004, 0.15, 8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>
      
      {/* Bottom ribbing */}
      <mesh position={[0, -0.30, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.05, 0.018, 8, 32]} />
        {material}
      </mesh>
    </group>
  );
};
