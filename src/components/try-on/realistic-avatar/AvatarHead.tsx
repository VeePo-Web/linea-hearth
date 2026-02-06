import { useMemo } from 'react';
import * as THREE from 'three';
import { AvatarFaceConfig, AvatarHairConfig } from '../avatar-creator/avatarPresets';
import { RealisticSkinMaterial } from './RealisticSkinMaterial';
import { AvatarEyes } from './AvatarEyes';
import { AvatarHair } from './AvatarHair';

interface AvatarHeadProps {
  skinTone: string;
  faceConfig: AvatarFaceConfig;
  hairConfig: AvatarHairConfig;
  headRadius: number;
  isMobile?: boolean;
}

/**
 * Realistic human head with parametric face features
 */
export const AvatarHead = ({ 
  skinTone, 
  faceConfig, 
  hairConfig, 
  headRadius,
  isMobile = false 
}: AvatarHeadProps) => {
  const segments = isMobile ? 24 : 48;
  
  // Create parametric head geometry based on face config
  const headGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(headRadius, segments, segments * 0.75);
    const positions = geometry.attributes.position;
    
    // Face shape morphing
    const faceShapeMultipliers = {
      oval: { jawWidth: 0.92, cheekWidth: 0.95, foreheadWidth: 0.95 },
      round: { jawWidth: 1.0, cheekWidth: 1.02, foreheadWidth: 0.98 },
      square: { jawWidth: 1.05, cheekWidth: 0.98, foreheadWidth: 1.0 },
      heart: { jawWidth: 0.88, cheekWidth: 1.0, foreheadWidth: 1.02 },
      oblong: { jawWidth: 0.90, cheekWidth: 0.92, foreheadWidth: 0.94 },
    };
    
    const shapeMulti = faceShapeMultipliers[faceConfig.faceShape];
    const jawMod = 0.9 + (faceConfig.jawWidth / 100) * 0.2;
    const cheekMod = 0.95 + (faceConfig.cheekboneHeight / 100) * 0.1;
    const foreheadMod = 0.95 + (faceConfig.foreheadHeight / 100) * 0.1;
    const chinMod = 0.95 + (faceConfig.chinLength / 100) * 0.1;
    
    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i);
      let y = positions.getY(i);
      let z = positions.getZ(i);
      
      const normalizedY = y / headRadius; // -1 to 1
      
      // Elongate to egg shape
      const heightFactor = 1 + normalizedY * 0.05;
      y *= heightFactor;
      
      // Apply face shape based on vertical position
      if (normalizedY < -0.3) {
        // Jaw region
        x *= shapeMulti.jawWidth * jawMod;
        z *= 0.9 + chinMod * 0.1;
      } else if (normalizedY < 0.2) {
        // Cheek region
        x *= shapeMulti.cheekWidth * cheekMod;
      } else {
        // Forehead region
        x *= shapeMulti.foreheadWidth * foreheadMod;
      }
      
      // Flatten back of head slightly
      if (z < 0) {
        z *= 0.92;
      }
      
      // Subtle brow ridge
      if (normalizedY > 0.1 && normalizedY < 0.3 && z > headRadius * 0.6) {
        z += headRadius * 0.02;
      }
      
      // Nose projection (subtle bump)
      const noseMod = faceConfig.noseWidth / 100;
      if (normalizedY > -0.15 && normalizedY < 0.1 && z > headRadius * 0.75) {
        const noseStrength = 1 - Math.abs(x) / (headRadius * 0.15);
        if (noseStrength > 0) {
          z += headRadius * 0.04 * noseStrength * (0.8 + noseMod * 0.4);
        }
      }
      
      // Lip volume (subtle)
      const lipMod = faceConfig.lipFullness / 100;
      if (normalizedY > -0.35 && normalizedY < -0.2 && z > headRadius * 0.7) {
        const lipStrength = 1 - Math.abs(x) / (headRadius * 0.2);
        if (lipStrength > 0) {
          z += headRadius * 0.015 * lipStrength * (0.5 + lipMod * 0.5);
        }
      }
      
      // Chin definition
      if (normalizedY < -0.5 && z > headRadius * 0.5) {
        const chinStrength = Math.max(0, 1 - Math.abs(x) / (headRadius * 0.25));
        z += headRadius * 0.02 * chinStrength * chinMod;
        y -= headRadius * 0.02 * chinStrength;
      }
      
      positions.setXYZ(i, x, y, z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [headRadius, faceConfig, segments]);

  // Eyebrows
  const eyebrowGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.02, 0);
    shape.quadraticCurveTo(0, 0.005, 0.02, 0);
    shape.quadraticCurveTo(0, -0.002, -0.02, 0);
    
    return new THREE.ExtrudeGeometry(shape, { 
      depth: 0.003, 
      bevelEnabled: false 
    });
  }, []);

  const eyeY = headRadius * 0.05;
  const eyeZ = headRadius * 0.78;
  const eyeSpacing = headRadius * 0.22;
  const browY = headRadius * 0.18;

  return (
    <group>
      {/* Head mesh */}
      <mesh geometry={headGeometry}>
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-headRadius * 0.88, 0, 0]} rotation={[0, 0, 0.1]}>
        <sphereGeometry args={[headRadius * 0.12, 12, 8]} />
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      <mesh position={[headRadius * 0.88, 0, 0]} rotation={[0, 0, -0.1]}>
        <sphereGeometry args={[headRadius * 0.12, 12, 8]} />
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Eyes */}
      <AvatarEyes 
        headRadius={headRadius} 
        eyeSize={faceConfig.eyeSize}
        skinTone={skinTone}
      />
      
      {/* Eyebrows */}
      <group position={[-eyeSpacing, browY, eyeZ]} rotation={[0, 0, 0.05]}>
        <mesh geometry={eyebrowGeometry} scale={[1.2, 1, 1]}>
          <meshStandardMaterial color={hairConfig.color} roughness={0.8} />
        </mesh>
      </group>
      <group position={[eyeSpacing, browY, eyeZ]} rotation={[0, 0, -0.05]}>
        <mesh geometry={eyebrowGeometry} scale={[-1.2, 1, 1]}>
          <meshStandardMaterial color={hairConfig.color} roughness={0.8} />
        </mesh>
      </group>
      
      {/* Lips */}
      <mesh position={[0, -headRadius * 0.28, headRadius * 0.82]}>
        <sphereGeometry args={[headRadius * 0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial 
          color={`color-mix(in srgb, ${skinTone} 60%, #C48080)`}
          roughness={0.4}
        />
      </mesh>
      
      {/* Facial hair (if applicable) */}
      {faceConfig.facialHair !== 'none' && (
        <FacialHair 
          type={faceConfig.facialHair}
          color={hairConfig.color}
          headRadius={headRadius}
        />
      )}
      
      {/* Hair */}
      <AvatarHair
        style={hairConfig.style}
        color={hairConfig.color}
        hairline={hairConfig.hairline}
        headRadius={headRadius}
        isMobile={isMobile}
      />
      
      {/* Glasses (if applicable) */}
      {faceConfig.hasGlasses && (
        <Glasses 
          style={faceConfig.glassesStyle}
          headRadius={headRadius}
          eyeSpacing={eyeSpacing}
          eyeY={eyeY}
          eyeZ={eyeZ}
        />
      )}
    </group>
  );
};

// Facial hair component
const FacialHair = ({ 
  type, 
  color, 
  headRadius 
}: { 
  type: 'stubble' | 'beard' | 'goatee';
  color: string;
  headRadius: number;
}) => {
  const opacity = type === 'stubble' ? 0.4 : 0.8;
  const scale = type === 'beard' ? 1.2 : type === 'goatee' ? 0.6 : 0.8;
  
  return (
    <mesh position={[0, -headRadius * 0.45, headRadius * 0.55]}>
      <sphereGeometry args={[headRadius * 0.25 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.9}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

// Glasses component
const Glasses = ({ 
  style, 
  headRadius,
  eyeSpacing,
  eyeY,
  eyeZ,
}: { 
  style: 'round' | 'square' | 'aviator' | 'cat-eye';
  headRadius: number;
  eyeSpacing: number;
  eyeY: number;
  eyeZ: number;
}) => {
  const lensRadius = headRadius * 0.1;
  const frameColor = '#2A2A2A';
  
  // Different lens shapes based on style
  const LensShape = () => {
    if (style === 'round') {
      return <circleGeometry args={[lensRadius, 24]} />;
    }
    if (style === 'square') {
      return <planeGeometry args={[lensRadius * 2, lensRadius * 1.6]} />;
    }
    // Aviator and cat-eye use modified circles
    return <circleGeometry args={[lensRadius * (style === 'aviator' ? 1.1 : 0.9), 24]} />;
  };

  return (
    <group position={[0, eyeY, eyeZ + lensRadius * 0.5]}>
      {/* Left lens */}
      <mesh position={[-eyeSpacing, 0, 0]}>
        <LensShape />
        <meshPhysicalMaterial
          color="#88CCFF"
          transparent
          opacity={0.15}
          metalness={0.5}
          roughness={0}
        />
      </mesh>
      
      {/* Right lens */}
      <mesh position={[eyeSpacing, 0, 0]}>
        <LensShape />
        <meshPhysicalMaterial
          color="#88CCFF"
          transparent
          opacity={0.15}
          metalness={0.5}
          roughness={0}
        />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, lensRadius * 0.2, 0]}>
        <boxGeometry args={[eyeSpacing * 0.6, 0.003, 0.003]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Frame - left */}
      <mesh position={[-eyeSpacing, 0, 0]}>
        <torusGeometry args={[lensRadius * 1.02, 0.003, 8, 32]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Frame - right */}
      <mesh position={[eyeSpacing, 0, 0]}>
        <torusGeometry args={[lensRadius * 1.02, 0.003, 8, 32]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-eyeSpacing - lensRadius, 0, -headRadius * 0.3]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.003, 0.003, headRadius * 0.6]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[eyeSpacing + lensRadius, 0, -headRadius * 0.3]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.003, 0.003, headRadius * 0.6]} />
        <meshStandardMaterial color={frameColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};
