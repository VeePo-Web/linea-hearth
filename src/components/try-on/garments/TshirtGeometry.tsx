import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface TshirtGeometryProps {
  color?: string;
  imageUrl?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
  neckStyle?: 'crew' | 'vneck';
  fit?: 'fitted' | 'regular' | 'oversized';
}

export const TshirtGeometry = ({ 
  color = '#FAFAFA', 
  imageUrl,
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 },
  neckStyle = 'crew',
  fit = 'regular'
}: TshirtGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'cotton', 
    color, 
    imageUrl 
  });

  // Fit adjustments
  const fitScale = useMemo(() => {
    switch (fit) {
      case 'fitted': return { body: 0.95, sleeve: 0.9, length: 0.95 };
      case 'oversized': return { body: 1.12, sleeve: 1.15, length: 1.08 };
      default: return { body: 1, sleeve: 1, length: 1 };
    }
  }, [fit]);

  // Create t-shirt body profile - shorter than crewneck
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 22;
    const bodyMultiplier = fitScale.body;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Collar
        const collarRadius = neckStyle === 'vneck' ? 0.085 : 0.088;
        radius = THREE.MathUtils.lerp(collarRadius, (bodyScale.shoulderWidth / 2 + 0.012) * bodyMultiplier, t / 0.08);
      } else if (t < 0.3) {
        // Shoulders - t-shirts have more pronounced shoulder drop
        const localT = (t - 0.08) / 0.22;
        radius = THREE.MathUtils.lerp(
          (bodyScale.shoulderWidth / 2 + 0.012) * bodyMultiplier, 
          (bodyScale.waistWidth / 2 + 0.025) * bodyMultiplier, 
          localT * 0.35
        );
      } else if (t < 0.85) {
        // Body - slightly looser for t-shirt
        const localT = (t - 0.3) / 0.55;
        radius = THREE.MathUtils.lerp(
          (bodyScale.waistWidth / 2 + 0.025) * bodyMultiplier, 
          (bodyScale.waistWidth / 2 + 0.018) * bodyMultiplier, 
          localT
        );
      } else {
        // Hem - slight flare
        radius = (bodyScale.waistWidth / 2 + 0.022) * bodyMultiplier;
      }
      
      // T-shirts are shorter than sweatshirts
      const yRange = 0.22 * fitScale.length;
      const y = THREE.MathUtils.lerp(yRange, -yRange, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 32);
  }, [bodyScale, fitScale, neckStyle]);

  // Shoulder cap for seamless sleeve connection
  const shoulderCapGeometry = useMemo(() => {
    const size = 0.058 * fitScale.sleeve;
    return new THREE.SphereGeometry(size, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  }, [fitScale]);

  const sleeveLength = 0.13 * fitScale.sleeve;
  const sleeveRadius = 0.056 * fitScale.sleeve;

  return (
    <group position={[0, 1.24, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Collar - crew or v-neck */}
      {neckStyle === 'crew' ? (
        <>
          <mesh position={[0, 0.24, 0]}>
            <torusGeometry args={[0.088, 0.016, 10, 32]} />
            {material}
          </mesh>
          {/* Inner collar detail */}
          <mesh position={[0, 0.235, 0]}>
            <torusGeometry args={[0.078, 0.008, 6, 28]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
        </>
      ) : (
        /* V-neck collar */
        <group position={[0, 0.22, 0.04]}>
          {/* V-neck left side */}
          <mesh position={[-0.03, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.065, 0.012, 0.008]} />
            {material}
          </mesh>
          {/* V-neck right side */}
          <mesh position={[0.03, 0, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.065, 0.012, 0.008]} />
            {material}
          </mesh>
        </group>
      )}
      
      {/* Left short sleeve with shoulder cap */}
      <group position={[-0.21 * fitScale.body, 0.16, 0]} rotation={[0, 0, 0.48]}>
        {/* Shoulder cap */}
        <mesh geometry={shoulderCapGeometry} position={[0, 0.025, 0]} rotation={[0, 0, -0.48]}>
          {material}
        </mesh>
        {/* Main sleeve - short */}
        <mesh position={[0, -sleeveLength / 2, 0]}>
          <cylinderGeometry args={[sleeveRadius, sleeveRadius * 1.08, sleeveLength, 18]} />
          {material}
        </mesh>
        {/* Sleeve hem - slight roll */}
        <mesh position={[0, -sleeveLength, 0]}>
          <torusGeometry args={[sleeveRadius * 1.05, 0.008, 6, 18]} />
          {material}
        </mesh>
      </group>
      
      {/* Right short sleeve with shoulder cap */}
      <group position={[0.21 * fitScale.body, 0.16, 0]} rotation={[0, 0, -0.48]}>
        {/* Shoulder cap */}
        <mesh geometry={shoulderCapGeometry} position={[0, 0.025, 0]} rotation={[0, 0, 0.48]}>
          {material}
        </mesh>
        {/* Main sleeve - short */}
        <mesh position={[0, -sleeveLength / 2, 0]}>
          <cylinderGeometry args={[sleeveRadius, sleeveRadius * 1.08, sleeveLength, 18]} />
          {material}
        </mesh>
        {/* Sleeve hem - slight roll */}
        <mesh position={[0, -sleeveLength, 0]}>
          <torusGeometry args={[sleeveRadius * 1.05, 0.008, 6, 18]} />
          {material}
        </mesh>
      </group>
      
      {/* Bottom hem - simple edge for t-shirt */}
      <mesh position={[0, -0.24 * fitScale.length, 0]}>
        <torusGeometry args={[(bodyScale.waistWidth / 2 + 0.022) * fitScale.body, 0.008, 6, 32]} />
        {material}
      </mesh>
    </group>
  );
};
