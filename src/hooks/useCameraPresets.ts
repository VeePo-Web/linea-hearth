import { useCallback, useRef } from 'react';
import * as THREE from 'three';

export type CameraPreset = 'full' | 'upper' | 'detail' | 'three-quarter';

interface PresetConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

const CAMERA_PRESETS: Record<CameraPreset, PresetConfig> = {
  full: {
    position: [0, 1.2, 2.8],
    target: [0, 1.1, 0],
  },
  upper: {
    position: [0, 1.5, 1.6],
    target: [0, 1.4, 0],
  },
  detail: {
    position: [0, 1.3, 1.0],
    target: [0, 1.3, 0],
  },
  'three-quarter': {
    position: [1.2, 1.3, 2.2],
    target: [0, 1.1, 0],
  },
};

const TRANSITION_DURATION = 500; // ms

export const useCameraPresets = () => {
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const animateToPreset = useCallback((
    cameraRef: React.RefObject<THREE.PerspectiveCamera | null>,
    controlsRef: React.RefObject<{ target: THREE.Vector3 } | null>,
    preset: CameraPreset,
    onComplete?: () => void
  ) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetConfig = CAMERA_PRESETS[preset];
    
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...targetConfig.position);
    
    const startTarget = controls.target.clone();
    const endTarget = new THREE.Vector3(...targetConfig.target);

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
      
      // Smooth easing (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate position
      camera.position.lerpVectors(startPos, endPos, eased);
      
      // Interpolate target
      controls.target.lerpVectors(startTarget, endTarget, eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const getPresetConfig = useCallback((preset: CameraPreset) => {
    return CAMERA_PRESETS[preset];
  }, []);

  return {
    animateToPreset,
    getPresetConfig,
    presets: Object.keys(CAMERA_PRESETS) as CameraPreset[],
  };
};
