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
    const segments = 24;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Crew neck collar - tighter than hoodie
        radius = THREE.MathUtils.lerp(0.095, bodyScale.shoulderWidth / 2 + 0.018, t / 0.08);
      } else if (t < 0.35) {
        // Shoulders to chest
        const localT = (t - 0.08) / 0.27;
        radius = THREE.MathUtils.lerp(bodyScale.shoulderWidth / 2 + 0.018, bodyScale.waistWidth / 2 + 0.035, localT * 0.4);
      } else if (t < 0.7) {
        // Chest to waist
        const localT = (t - 0.35) / 0.35;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.035, bodyScale.waistWidth / 2 + 0.028, localT);
      } else {
        // Hem
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.028, bodyScale.waistWidth / 2 + 0.045, localT);
      }
      
      const y = THREE.MathUtils.lerp(0.28, -0.28, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 36);
  }, [bodyScale]);

  // Shoulder cap geometry for seamless sleeve connection
  const shoulderCapGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.062, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  }, []);

  return (
    <group position={[0, 1.22, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Crew neck collar ribbing - thicker and more defined */}
      <mesh position={[0, 0.30, 0]}>
        <torusGeometry args={[0.095, 0.025, 12, 36]} />
        {material}
      </mesh>
      
      {/* Collar inner ring for depth */}
      <mesh position={[0, 0.295, 0]}>
        <torusGeometry args={[0.085, 0.012, 8, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
      
      {/* Left sleeve with shoulder cap */}
      <group position={[-0.23, 0.18, 0]} rotation={[0, 0, 0.35]}>
        {/* Shoulder cap - seamless connection */}
        <mesh geometry={shoulderCapGeometry} position={[0, 0.035, 0]} rotation={[0, 0, -0.35]}>
          {material}
        </mesh>
        {/* Main sleeve */}
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.062, 0.052, 0.34, 24]} />
          {material}
        </mesh>
        {/* Sleeve cuff ribbing */}
        <mesh position={[0, -0.32, 0]}>
          <torusGeometry args={[0.050, 0.014, 10, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* Right sleeve with shoulder cap */}
      <group position={[0.23, 0.18, 0]} rotation={[0, 0, -0.35]}>
        {/* Shoulder cap - seamless connection */}
        <mesh geometry={shoulderCapGeometry} position={[0, 0.035, 0]} rotation={[0, 0, 0.35]}>
          {material}
        </mesh>
        {/* Main sleeve */}
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.062, 0.052, 0.34, 24]} />
          {material}
        </mesh>
        {/* Sleeve cuff ribbing */}
        <mesh position={[0, -0.32, 0]}>
          <torusGeometry args={[0.050, 0.014, 10, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* Bottom ribbing */}
      <mesh position={[0, -0.30, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.045, 0.02, 10, 36]} />
        {material}
      </mesh>
    </group>
  );
};
