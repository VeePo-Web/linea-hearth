import { useEffect } from "react";
import { X, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FitModel {
  id: string;
  name: string;
  gender: string;
  height_cm: number | null;
  height_imperial: string | null;
  size_worn: string;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  photo_url: string;
  fit_notes: string | null;
}

interface FitGuideModalProps {
  model: FitModel;
  onClose: () => void;
}

const FitGuideModal = ({ model, onClose }: FitGuideModalProps) => {
  // Lock body scroll and trap focus
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const cmToInches = (cm: number) => (cm / 2.54).toFixed(1);
  const kgToLbs = (kg: number) => Math.round(kg * 2.205);

  const measurements = [
    { label: 'Height', value: model.height_imperial || (model.height_cm ? `${model.height_cm}cm` : null) },
    { label: 'Weight', value: model.weight_kg ? `${kgToLbs(model.weight_kg)} lbs (${model.weight_kg}kg)` : null },
    { label: 'Chest', value: model.chest_cm ? `${cmToInches(model.chest_cm)}" (${model.chest_cm}cm)` : null },
    { label: 'Waist', value: model.waist_cm ? `${cmToInches(model.waist_cm)}" (${model.waist_cm}cm)` : null },
    { label: 'Hips', value: model.hip_cm ? `${cmToInches(model.hip_cm)}" (${model.hip_cm}cm)` : null },
  ].filter(m => m.value);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fit-model-name"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-stone-900 rounded-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Side */}
        <div className="w-full lg:w-1/2 h-64 lg:h-auto">
          <img
            src={model.photo_url}
            alt={model.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Side */}
        <div className="w-full lg:w-1/2 p-6 lg:p-10 overflow-y-auto">
          {/* Name & Size Badge */}
          <div className="flex items-center gap-3 mb-6">
            <h2 id="fit-model-name" className="text-2xl lg:text-3xl font-extralight text-white">
              {model.name}
            </h2>
            <span className="text-xs uppercase tracking-wider bg-amber-600 text-white px-3 py-1 rounded-full">
              Size {model.size_worn}
            </span>
          </div>

          {/* Measurements Table */}
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-wider text-white/50 mb-4 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Measurements
            </h3>
            <div className="space-y-3">
              {measurements.map((m) => (
                <div 
                  key={m.label}
                  className="flex justify-between items-center py-2 border-b border-white/10"
                >
                  <span className="text-white/60 font-light">{m.label}</span>
                  <span className="text-white font-light">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size Worn */}
          <div className="mb-8 p-4 bg-stone-800 rounded-lg">
            <p className="text-xs uppercase tracking-wider text-amber-500 mb-2">
              Size Worn in Photo
            </p>
            <p className="text-2xl font-light text-white">
              {model.size_worn}
            </p>
          </div>

          {/* Fit Notes */}
          {model.fit_notes && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
                Fit Notes
              </h3>
              <p className="text-white/80 font-light leading-relaxed">
                {model.fit_notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/about/size-guide">
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                View Full Size Chart
              </Button>
            </Link>
            <Link to={`/category/all?size=${model.size_worn}`}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Shop in Size {model.size_worn}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitGuideModal;
