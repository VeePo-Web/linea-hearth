import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FitGuideModal from "./FitGuideModal";

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

const FitGuideSection = () => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedModel, setSelectedModel] = useState<FitModel | null>(null);

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['fit-guide-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fit_guide_models')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FitModel[];
    }
  });

  const filteredModels = models.filter(m => m.gender === selectedGender);

  // Mock models for demo if no data
  const demoModels: FitModel[] = [
    {
      id: '1',
      name: 'Marcus',
      gender: 'male',
      height_cm: 188,
      height_imperial: "6'2\"",
      size_worn: 'L',
      weight_kg: 84,
      chest_cm: 107,
      waist_cm: 86,
      hip_cm: 102,
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      fit_notes: 'Marcus wears size L for a relaxed fit. For a slimmer look, size down to M.'
    },
    {
      id: '2',
      name: 'David',
      gender: 'male',
      height_cm: 175,
      height_imperial: "5'9\"",
      size_worn: 'M',
      weight_kg: 72,
      chest_cm: 97,
      waist_cm: 81,
      hip_cm: 96,
      photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
      fit_notes: 'David wears size M for a true-to-size fit.'
    },
    {
      id: '3',
      name: 'Isaiah',
      gender: 'male',
      height_cm: 183,
      height_imperial: "6'0\"",
      size_worn: 'XL',
      weight_kg: 95,
      chest_cm: 117,
      waist_cm: 96,
      hip_cm: 109,
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
      fit_notes: 'Isaiah wears XL for comfortable layering.'
    },
    {
      id: '4',
      name: 'Elijah',
      gender: 'male',
      height_cm: 170,
      height_imperial: "5'7\"",
      size_worn: 'S',
      weight_kg: 65,
      chest_cm: 91,
      waist_cm: 76,
      hip_cm: 91,
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
      fit_notes: 'Elijah wears S for a fitted look.'
    },
    {
      id: '5',
      name: 'Sarah',
      gender: 'female',
      height_cm: 170,
      height_imperial: "5'7\"",
      size_worn: 'M',
      weight_kg: 61,
      chest_cm: 89,
      waist_cm: 71,
      hip_cm: 97,
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      fit_notes: 'Sarah wears M for a relaxed feminine fit.'
    },
    {
      id: '6',
      name: 'Miriam',
      gender: 'female',
      height_cm: 165,
      height_imperial: "5'5\"",
      size_worn: 'S',
      weight_kg: 54,
      chest_cm: 84,
      waist_cm: 66,
      hip_cm: 91,
      photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
      fit_notes: 'Miriam wears S for a true-to-size fit.'
    },
    {
      id: '7',
      name: 'Ruth',
      gender: 'female',
      height_cm: 175,
      height_imperial: "5'9\"",
      size_worn: 'L',
      weight_kg: 70,
      chest_cm: 94,
      waist_cm: 76,
      hip_cm: 102,
      photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      fit_notes: 'Ruth wears L for comfortable oversized styling.'
    },
    {
      id: '8',
      name: 'Esther',
      gender: 'female',
      height_cm: 160,
      height_imperial: "5'3\"",
      size_worn: 'XS',
      weight_kg: 50,
      chest_cm: 81,
      waist_cm: 63,
      hip_cm: 86,
      photo_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
      fit_notes: 'Esther wears XS for a fitted silhouette.'
    }
  ];

  const displayModels = filteredModels.length > 0 ? filteredModels : demoModels.filter(m => m.gender === selectedGender);

  return (
    <>
      <section 
        data-section="fit-guide"
        className="min-h-screen w-full snap-start bg-stone-900 py-16 lg:py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-500 mb-4 font-light">
              How It Fits
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white mb-4">
              Find Your Perfect Size
            </h2>
            <p className="text-white/60 font-light">
              Real models. Real measurements.
            </p>
          </div>

          {/* Gender Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-stone-800 rounded-full p-1">
              <button
                onClick={() => setSelectedGender('male')}
                className={`px-6 py-2 rounded-full text-sm font-light transition-all ${
                  selectedGender === 'male'
                    ? 'bg-amber-600 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Men
              </button>
              <button
                onClick={() => setSelectedGender('female')}
                className={`px-6 py-2 rounded-full text-sm font-light transition-all ${
                  selectedGender === 'female'
                    ? 'bg-amber-600 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Women
              </button>
            </div>
          </div>

          {/* Models Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-stone-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {displayModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <img
                    src={model.photo_url}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <p className="text-white font-light text-lg mb-1">
                      {model.name}
                    </p>
                    <p className="text-white/70 text-sm font-light">
                      {model.height_imperial} • Size {model.size_worn}
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs uppercase tracking-wider text-white bg-amber-600 px-4 py-2 rounded-full">
                      View Details
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedModel && (
        <FitGuideModal 
          model={selectedModel} 
          onClose={() => setSelectedModel(null)} 
        />
      )}
    </>
  );
};

export default FitGuideSection;
