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
    const segments = 24;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.1) {
        // Collar area - slightly wider for hood attachment
        radius = THREE.MathUtils.lerp(0.13, bodyScale.shoulderWidth / 2 + 0.025, t / 0.1);
      } else if (t < 0.4) {
        // Chest area
        const localT = (t - 0.1) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.shoulderWidth / 2 + 0.025, bodyScale.waistWidth / 2 + 0.045, localT * 0.3);
      } else if (t < 0.7) {
        // Waist
        const localT = (t - 0.4) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.045, bodyScale.waistWidth / 2 + 0.035, localT);
      } else {
        // Hem (slight flare)
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.035, bodyScale.waistWidth / 2 + 0.055, localT);
      }
      
      const y = THREE.MathUtils.lerp(0.30, -0.30, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 36);
  }, [bodyScale]);

  // Folded hood geometry - teardrop cross-section
  const hoodGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 16;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      // Teardrop shape - wider at bottom, tapered at top
      const radius = 0.11 + Math.sin(angle) * 0.05 * (1 - t * 0.3);
      const y = Math.cos(angle) * 0.10;
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 20, 0, Math.PI);
  }, []);

  // Shoulder cap geometry for seamless sleeve connection
  const shoulderCapGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.068, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  }, []);

  return (
    <group position={[0, 1.22, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Folded Hood - resting on shoulders */}
      <group position={[0, 0.32, -0.07]} rotation={[0.55, 0, 0]}>
        {/* Main hood shell */}
        <mesh geometry={hoodGeometry} rotation={[Math.PI / 2, 0, 0]}>
          {material}
        </mesh>
        
        {/* Hood opening rim - visible edge */}
        <mesh position={[0, 0.02, 0.06]} rotation={[-0.3, 0, 0]}>
          <torusGeometry args={[0.10, 0.015, 8, 24, Math.PI * 1.4]} />
          {material}
        </mesh>
        
        {/* Inner hood lining (darker) */}
        <mesh position={[0, -0.01, 0.02]} scale={[0.88, 0.88, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.09, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} side={THREE.BackSide} />
        </mesh>
      </group>
      
      {/* Left sleeve with shoulder cap */}
      <group position={[-0.24, 0.20, 0]} rotation={[0, 0, 0.35]}>
        {/* Shoulder cap - fills the gap */}
        <mesh geometry={shoulderCapGeometry} position={[0, 0.04, 0]} rotation={[0, 0, -0.35]}>
          {material}
        </mesh>
        {/* Main sleeve */}
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.068, 0.058, 0.38, 24]} />
          {material}
        </mesh>
        {/* Sleeve cuff ribbing */}
        <mesh position={[0, -0.35, 0]}>
          <torusGeometry args={[0.055, 0.014, 10, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* Right sleeve with shoulder cap */}
      <group position={[0.24, 0.20, 0]} rotation={[0, 0, -0.35]}>
        {/* Shoulder cap - fills the gap */}
        <mesh geometry={shoulderCapGeometry} position={[0, 0.04, 0]} rotation={[0, 0, 0.35]}>
          {material}
        </mesh>
        {/* Main sleeve */}
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.068, 0.058, 0.38, 24]} />
          {material}
        </mesh>
        {/* Sleeve cuff ribbing */}
        <mesh position={[0, -0.35, 0]}>
          <torusGeometry args={[0.055, 0.014, 10, 24]} />
          {material}
        </mesh>
      </group>
      
      {/* 3D Kangaroo pocket with depth */}
      <group position={[0, -0.06, 0.17]}>
        {/* Pocket pouch - curved surface with volume */}
        <mesh rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.24, 0.11, 0.035]} />
          {material}
        </mesh>
        
        {/* Pocket top edge - slightly raised */}
        <mesh position={[0, 0.058, 0.012]}>
          <boxGeometry args={[0.22, 0.012, 0.02]} />
          {material}
        </mesh>
        
        {/* Center opening slit */}
        <mesh position={[0, 0.02, 0.022]}>
          <boxGeometry args={[0.018, 0.04, 0.008]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
        
        {/* Left hand opening */}
        <mesh position={[-0.06, 0.01, 0.022]}>
          <boxGeometry args={[0.05, 0.008, 0.006]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
        
        {/* Right hand opening */}
        <mesh position={[0.06, 0.01, 0.022]}>
          <boxGeometry args={[0.05, 0.008, 0.006]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>
      
      {/* Drawstrings */}
      <mesh position={[-0.04, 0.30, 0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.16, 8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.30, 0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.16, 8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>
      
      {/* Bottom ribbing */}
      <mesh position={[0, -0.32, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.055, 0.02, 10, 36]} />
        {material}
      </mesh>
    </group>
  );
};
