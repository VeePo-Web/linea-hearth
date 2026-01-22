import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeasurementSlider } from './MeasurementSlider';
import { QuickSizePresets } from './QuickSizePresets';
import { SizeRecommendation } from './SizeRecommendation';
import { useTryOnState } from '@/hooks/useTryOnState';
import { 
  BodyMeasurements, 
  defaultMeasurements, 
  measurementRanges,
  quickPresets 
} from './utils/measurementToProportions';
import { recommendSize, SizeRecommendation as SizeRec } from './utils/sizeRecommendation';
import { cn } from '@/lib/utils';
import { Ruler, Weight, User, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const STORAGE_KEY = 'linea_body_measurements';

interface BodyMeasurementsPanelProps {
  className?: string;
}

export const BodyMeasurementsPanel = ({ className }: BodyMeasurementsPanelProps) => {
  const { 
    avatarGender, 
    setAvatarGender,
    avatarSkinTone,
    setAvatarSkinTone,
    measurements,
    setMeasurements,
    unitSystem,
    setUnitSystem,
    useDetailedMeasurements,
    setUseDetailedMeasurements,
  } = useTryOnState();

  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>('quick');

  // Size recommendation based on current measurements
  const sizeRecommendation: SizeRec | null = useMemo(() => {
    if (!measurements) return null;
    return recommendSize(measurements);
  }, [measurements]);

  // Load saved measurements on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.measurements) {
          setMeasurements(parsed.measurements);
          setSelectedPresetId(undefined);
        }
      } catch (e) {
        console.error('Failed to load saved measurements:', e);
      }
    }
  }, [setMeasurements]);

  // Handle preset selection
  const handlePresetSelect = (presetMeasurements: BodyMeasurements) => {
    setMeasurements(presetMeasurements);
    const presetId = Object.entries(quickPresets).find(
      ([_, preset]) => preset.measurements === presetMeasurements
    )?.[0];
    setSelectedPresetId(presetId);
  };

  // Handle individual measurement change
  const handleMeasurementChange = (key: keyof BodyMeasurements, value: number) => {
    if (!measurements) return;
    setMeasurements({ ...measurements, [key]: value });
    setSelectedPresetId(undefined); // Clear preset when manually adjusting
  };

  // Save measurements to localStorage
  const handleSave = () => {
    if (!measurements) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      measurements,
      gender: avatarGender,
      savedAt: new Date().toISOString(),
    }));
    toast.success('Measurements saved!');
  };

  // Skin tone options
  const skinTones = [
    '#F5DEB3', '#D4A574', '#C68642', '#8D5524', '#5C3317', '#3B2314'
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="quick" className="text-xs">Quick</TabsTrigger>
          <TabsTrigger value="detailed" className="text-xs">Detailed</TabsTrigger>
          <TabsTrigger value="saved" className="text-xs">Saved</TabsTrigger>
        </TabsList>

        {/* QUICK TAB */}
        <TabsContent value="quick" className="mt-4 space-y-6">
          {/* Gender Selection */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Model
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setAvatarGender('male')}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-light border transition-all duration-200",
                  avatarGender === 'male'
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-foreground hover:border-foreground"
                )}
              >
                Male
              </button>
              <button
                onClick={() => setAvatarGender('female')}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-light border transition-all duration-200",
                  avatarGender === 'female'
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-foreground hover:border-foreground"
                )}
              >
                Female
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <QuickSizePresets 
            onSelectPreset={handlePresetSelect}
            selectedPresetId={selectedPresetId}
          />

          {/* Skin Tone */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Skin Tone
            </h3>
            <div className="flex gap-2">
              {skinTones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setAvatarSkinTone(tone)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all duration-200",
                    avatarSkinTone === tone
                      ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "border-transparent hover:border-muted-foreground"
                  )}
                  style={{ backgroundColor: tone }}
                  aria-label={`Select skin tone ${tone}`}
                />
              ))}
            </div>
          </div>

          {/* Size Recommendation Preview */}
          {sizeRecommendation && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recommended Size
                </h3>
                <div className="flex items-center gap-2 bg-foreground text-background px-3 py-1">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-lg font-bold">{sizeRecommendation.recommendedSize}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {selectedPresetId ? quickPresets[selectedPresetId]?.label : 'your measurements'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* DETAILED TAB */}
        <TabsContent value="detailed" className="mt-4 space-y-6">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Units
            </span>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs", unitSystem === 'metric' ? 'text-foreground' : 'text-muted-foreground')}>
                cm/kg
              </span>
              <Switch
                checked={unitSystem === 'imperial'}
                onCheckedChange={(checked) => setUnitSystem(checked ? 'imperial' : 'metric')}
              />
              <span className={cn("text-xs", unitSystem === 'imperial' ? 'text-foreground' : 'text-muted-foreground')}>
                in/lbs
              </span>
            </div>
          </div>

          {measurements && (
            <>
              {/* Height & Weight */}
              <div className="space-y-5">
                <MeasurementSlider
                  label="Height"
                  value={measurements.heightCm}
                  min={measurementRanges.height.min}
                  max={measurementRanges.height.max}
                  step={measurementRanges.height.step}
                  unit="height"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('heightCm', val)}
                  icon={<Ruler className="h-3.5 w-3.5" />}
                />

                <MeasurementSlider
                  label="Weight"
                  value={measurements.weightKg}
                  min={measurementRanges.weight.min}
                  max={measurementRanges.weight.max}
                  step={measurementRanges.weight.step}
                  unit="weight"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('weightKg', val)}
                  icon={<Weight className="h-3.5 w-3.5" />}
                />
              </div>

              {/* Body Measurements */}
              <div className="pt-4 border-t border-border space-y-5">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Body Measurements
                </h4>

                <MeasurementSlider
                  label="Chest"
                  value={measurements.chestCm}
                  min={measurementRanges.chest.min}
                  max={measurementRanges.chest.max}
                  step={measurementRanges.chest.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('chestCm', val)}
                />

                <MeasurementSlider
                  label="Waist"
                  value={measurements.waistCm}
                  min={measurementRanges.waist.min}
                  max={measurementRanges.waist.max}
                  step={measurementRanges.waist.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('waistCm', val)}
                />

                <MeasurementSlider
                  label="Hips"
                  value={measurements.hipsCm}
                  min={measurementRanges.hips.min}
                  max={measurementRanges.hips.max}
                  step={measurementRanges.hips.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('hipsCm', val)}
                />

                <MeasurementSlider
                  label="Inseam"
                  value={measurements.inseamCm}
                  min={measurementRanges.inseam.min}
                  max={measurementRanges.inseam.max}
                  step={measurementRanges.inseam.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('inseamCm', val)}
                />
              </div>

              {/* Size Recommendation */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Size Recommendation
                </h4>
                <SizeRecommendation recommendation={sizeRecommendation} />
              </div>
            </>
          )}
        </TabsContent>

        {/* SAVED TAB */}
        <TabsContent value="saved" className="mt-4 space-y-4">
          <div className="text-center py-6 space-y-4">
            <Save className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <h4 className="text-sm font-medium">Save Your Measurements</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Save your measurements for faster checkout and accurate size recommendations
              </p>
            </div>
            <Button 
              onClick={handleSave}
              className="w-full"
              disabled={!measurements}
            >
              Save Current Measurements
            </Button>
          </div>

          {/* Show saved info if exists */}
          {localStorage.getItem(STORAGE_KEY) && (
            <div className="p-3 border border-border rounded-sm bg-muted/30">
              <p className="text-xs text-muted-foreground">
                ✓ Measurements saved locally
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
