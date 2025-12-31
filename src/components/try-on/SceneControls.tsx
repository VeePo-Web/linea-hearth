import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Camera, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SceneControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScreenshot: () => void;
  onToggleLighting: () => void;
  lightingMode: 'studio' | 'natural';
}

export const SceneControls = ({ 
  onReset, 
  onZoomIn, 
  onZoomOut, 
  onScreenshot,
  onToggleLighting,
  lightingMode
}: SceneControlsProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border p-2 rounded-full">
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Reset view"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border" />
      
      <button
        onClick={onZoomOut}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      
      <button
        onClick={onZoomIn}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-border" />
      
      <button
        onClick={onToggleLighting}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle lighting"
      >
        {lightingMode === 'studio' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>
      
      <div className="w-px h-6 bg-border" />
      
      <button
        onClick={onScreenshot}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Take screenshot"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
};
