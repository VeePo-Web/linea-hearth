import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Avatar3D } from './Avatar3D';
import { SceneControls } from './SceneControls';
import { StudioLighting } from './lighting/StudioLighting';
import { useTryOnState } from '@/hooks/useTryOnState';
import { Loader2 } from 'lucide-react';

interface TryOnCanvasProps {
  className?: string;
}

const Scene = ({ 
  lightingMode, 
  cameraRef,
  controlsRef,
}: { 
  lightingMode: 'studio' | 'natural' | 'dramatic';
  cameraRef: React.RefObject<any>;
  controlsRef: React.RefObject<any>;
}) => {
  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 1.2, 2.8]} 
        fov={45}
      />
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={1.2}
        maxDistance={4.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.6}
        target={[0, 1.1, 0]}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Studio Lighting System */}
      <StudioLighting mode={lightingMode} />

      {/* Avatar with Garments */}
      <Avatar3D position={[0, 0, 0]} />

      {/* Ground shadow - soft and premium */}
      <ContactShadows 
        position={[0, -0.01, 0]}
        opacity={0.35}
        scale={4}
        blur={2.5}
        far={1.5}
        color="#1C1917"
      />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial 
          color="#FAFAFA" 
          roughness={0.15}
          metalness={0.1}
          envMapIntensity={0.3}
        />
      </mesh>
      
      {/* Subtle gradient backdrop */}
      <mesh position={[0, 2, -2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshBasicMaterial 
          color="#F5F5F4" 
          transparent 
          opacity={0.5}
        />
      </mesh>
    </>
  );
};

export const TryOnCanvas = ({ className }: TryOnCanvasProps) => {
  const { isLoading } = useTryOnState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const [lightingMode, setLightingMode] = useState<'studio' | 'natural' | 'dramatic'>('studio');

  const handleReset = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cameraRef.current) {
      const currentZ = cameraRef.current.position.z;
      cameraRef.current.position.z = Math.max(1.2, currentZ - 0.4);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cameraRef.current) {
      const currentZ = cameraRef.current.position.z;
      cameraRef.current.position.z = Math.min(4.5, currentZ + 0.4);
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'line-of-judah-outfit.png';
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  }, []);

  const handleToggleLighting = useCallback(() => {
    setLightingMode(prev => {
      if (prev === 'studio') return 'natural';
      if (prev === 'natural') return 'dramatic';
      return 'studio';
    });
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-light tracking-wide">Loading model...</span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: true,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.1,
        }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <Scene 
            lightingMode={lightingMode} 
            cameraRef={cameraRef}
            controlsRef={controlsRef}
          />
        </Suspense>
      </Canvas>

      {/* Drag hint - premium styling */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
        Drag to rotate • Scroll to zoom
      </div>

      {/* Scene Controls */}
      <SceneControls
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onScreenshot={handleScreenshot}
        onToggleLighting={handleToggleLighting}
        lightingMode={lightingMode}
      />
    </div>
  );
};
