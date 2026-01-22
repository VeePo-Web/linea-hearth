import { BodyMeasurementsPanel } from './BodyMeasurementsPanel';
import { OutfitBuilder } from './OutfitBuilder';
import { OutfitSummary } from './OutfitSummary';
import { Separator } from '@/components/ui/separator';

export const TryOnSidebar = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 p-6">
        {/* Body Measurements & Avatar Configuration */}
        <BodyMeasurementsPanel />
        
        <Separator />
        
        {/* Outfit Slots */}
        <OutfitBuilder />
        
        <Separator />
        
        {/* Summary + Add to Cart */}
        <OutfitSummary />
      </div>
    </div>
  );
};
