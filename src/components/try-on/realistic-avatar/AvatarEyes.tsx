import { useMemo } from 'react';
import * as THREE from 'three';

interface AvatarEyesProps {
  headRadius: number;
  eyeSize: number; // 0-100
  skinTone: string;
}

/**
 * Stylized but human-like eyes for the realistic avatar
 */
export const AvatarEyes = ({ headRadius, eyeSize, skinTone }: AvatarEyesProps) => {
  const eyeScale = 0.7 + (eyeSize / 100) * 0.6; // 0.7 to 1.3 scale
  const eyeRadius = headRadius * 0.06 * eyeScale;
  const eyeSpacing = headRadius * 0.22;
  const eyeY = headRadius * 0.05;
  const eyeZ = headRadius * 0.78;
  
  // Calculate eye socket darker color
  const socketColor = useMemo(() => {
    // Darken skin tone slightly for eye socket depth
    const color = new THREE.Color(skinTone);
    color.multiplyScalar(0.85);
    return `#${color.getHexString()}`;
  }, [skinTone]);

  return (
    <group>
      {/* Left Eye */}
      <group position={[-eyeSpacing, eyeY, eyeZ]}>
        {/* Eye socket shadow */}
        <mesh position={[0, 0, -0.002]}>
          <sphereGeometry args={[eyeRadius * 1.3, 16, 12]} />
          <meshStandardMaterial color={socketColor} roughness={0.9} />
        </mesh>
        
        {/* Eyeball */}
        <mesh>
          <sphereGeometry args={[eyeRadius, 24, 16]} />
          <meshPhysicalMaterial
            color="#FAFAFA"
            roughness={0.1}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Iris */}
        <mesh position={[0, 0, eyeRadius * 0.65]}>
          <circleGeometry args={[eyeRadius * 0.55, 24]} />
          <meshStandardMaterial color="#4A3728" roughness={0.5} />
        </mesh>
        
        {/* Pupil */}
        <mesh position={[0, 0, eyeRadius * 0.68]}>
          <circleGeometry args={[eyeRadius * 0.25, 16]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.3} />
        </mesh>
        
        {/* Highlight */}
        <mesh position={[eyeRadius * 0.2, eyeRadius * 0.15, eyeRadius * 0.72]}>
          <circleGeometry args={[eyeRadius * 0.1, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      </group>
      
      {/* Right Eye (mirrored) */}
      <group position={[eyeSpacing, eyeY, eyeZ]}>
        {/* Eye socket shadow */}
        <mesh position={[0, 0, -0.002]}>
          <sphereGeometry args={[eyeRadius * 1.3, 16, 12]} />
          <meshStandardMaterial color={socketColor} roughness={0.9} />
        </mesh>
        
        {/* Eyeball */}
        <mesh>
          <sphereGeometry args={[eyeRadius, 24, 16]} />
          <meshPhysicalMaterial
            color="#FAFAFA"
            roughness={0.1}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Iris */}
        <mesh position={[0, 0, eyeRadius * 0.65]}>
          <circleGeometry args={[eyeRadius * 0.55, 24]} />
          <meshStandardMaterial color="#4A3728" roughness={0.5} />
        </mesh>
        
        {/* Pupil */}
        <mesh position={[0, 0, eyeRadius * 0.68]}>
          <circleGeometry args={[eyeRadius * 0.25, 16]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.3} />
        </mesh>
        
        {/* Highlight */}
        <mesh position={[-eyeRadius * 0.2, eyeRadius * 0.15, eyeRadius * 0.72]}>
          <circleGeometry args={[eyeRadius * 0.1, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
};
