import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Avatar3D } from './Avatar3D';
import { SceneControls } from './SceneControls';
import { useTryOnState } from '@/hooks/useTryOnState';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

interface TryOnCanvasProps {
  className?: string;
}

const Scene = ({ 
  lightingMode, 
  cameraRef 
}: { 
  lightingMode: 'studio' | 'natural';
  cameraRef: React.RefObject<any>;
}) => {
  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 1, 2.5]} 
        fov={50}
      />
      
      <OrbitControls 
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 1, 0]}
      />

      {/* Lighting */}
      {lightingMode === 'studio' ? (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <pointLight position={[0, 3, 2]} intensity={0.5} color="#fff5e6" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <hemisphereLight intensity={0.4} color="#87ceeb" groundColor="#f4e9d9" />
        </>
      )}

      {/* Avatar */}
      <Avatar3D position={[0, 0, 0]} />

      {/* Ground shadow */}
      <ContactShadows 
        position={[0, -0.15, 0]}
        opacity={0.4}
        scale={3}
        blur={2}
        far={1}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5f5f5" roughness={1} />
      </mesh>
    </>
  );
};

export const TryOnCanvas = ({ className }: TryOnCanvasProps) => {
  const { isLoading } = useTryOnState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const [lightingMode, setLightingMode] = useState<'studio' | 'natural'>('studio');
  const controlsRef = useRef<any>(null);

  const handleReset = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(1.5, cameraRef.current.position.z - 0.5);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(4, cameraRef.current.position.z + 0.5);
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'my-outfit.png';
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  }, []);

  const handleToggleLighting = useCallback(() => {
    setLightingMode(prev => prev === 'studio' ? 'natural' : 'studio');
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading model...</span>
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
        }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <Scene lightingMode={lightingMode} cameraRef={cameraRef} />
        </Suspense>
      </Canvas>

      {/* Drag hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
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
