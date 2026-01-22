import { cn } from '@/lib/utils';
import { quickPresets, BodyMeasurements } from './utils/measurementToProportions';

interface QuickSizePresetsProps {
  onSelectPreset: (measurements: BodyMeasurements) => void;
  selectedPresetId?: string;
  className?: string;
}

export const QuickSizePresets = ({ 
  onSelectPreset, 
  selectedPresetId,
  className 
}: QuickSizePresetsProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Quick Size Presets
      </h4>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(quickPresets).map(([id, { label, measurements }]) => (
          <button
            key={id}
            onClick={() => onSelectPreset(measurements)}
            className={cn(
              "px-3 py-2 text-xs font-medium border transition-all duration-200",
              selectedPresetId === id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-foreground hover:border-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-muted-foreground">
        Tap a preset to quickly apply common body measurements
      </p>
    </div>
  );
};
