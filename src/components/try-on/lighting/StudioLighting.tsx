import { Environment } from '@react-three/drei';

interface StudioLightingProps {
  mode: 'studio' | 'natural' | 'dramatic';
}

export const StudioLighting = ({ mode }: StudioLightingProps) => {
  if (mode === 'studio') {
    return (
      <>
        {/* Key light - main illumination from front-right */}
        <spotLight 
          position={[3, 4, 4]} 
          intensity={2.5} 
          angle={0.5}
          penumbra={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          color="#fff8f0"
        />
        
        {/* Fill light - soften shadows from front-left */}
        <spotLight 
          position={[-3, 3, 3]} 
          intensity={1.2}
          angle={0.6}
          penumbra={0.8}
          color="#f0f5ff"
        />
        
        {/* Rim light - edge definition from behind */}
        <spotLight 
          position={[0, 4, -4]} 
          intensity={1.8}
          angle={0.4}
          penumbra={0.5}
          color="#ffffff"
        />
        
        {/* Top light - soft overhead fill */}
        <directionalLight 
          position={[0, 6, 0]} 
          intensity={0.6} 
          color="#ffffff"
        />
        
        {/* Ambient - prevent pure black shadows */}
        <ambientLight intensity={0.2} color="#f5f5f5" />
        
        {/* Environment map for subtle reflections */}
        <Environment preset="studio" background={false} />
      </>
    );
  }

  if (mode === 'natural') {
    return (
      <>
        {/* Sun-like key light */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          color="#fff5e6"
        />
        
        {/* Sky fill */}
        <hemisphereLight 
          intensity={0.8} 
          color="#87ceeb" 
          groundColor="#f4e9d9" 
        />
        
        {/* Ambient */}
        <ambientLight intensity={0.35} />
        
        <Environment preset="sunset" background={false} />
      </>
    );
  }

  // Dramatic mode
  return (
    <>
      {/* Single strong key light */}
      <spotLight 
        position={[4, 5, 2]} 
        intensity={4}
        angle={0.3}
        penumbra={0.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color="#ffffff"
      />
      
      {/* Subtle rim light */}
      <spotLight 
        position={[-2, 3, -4]} 
        intensity={1}
        angle={0.5}
        penumbra={0.7}
        color="#ffd700"
      />
      
      {/* Very low ambient */}
      <ambientLight intensity={0.08} />
      
      <Environment preset="night" background={false} />
    </>
  );
};
