import { Shirt, Scale, Droplets, Ruler } from "lucide-react";

interface FitFabricSectionProps {
  fitType?: string | null;
  fabricComposition?: string | null;
  weightGsm?: number | null;
  careInstructions?: string | null;
  modelInfo?: string | null;
}

const FitFabricSection = ({
  fitType,
  fabricComposition,
  weightGsm,
  careInstructions,
  modelInfo,
}: FitFabricSectionProps) => {
  const getWeightDescription = (gsm: number) => {
    if (gsm < 150) return "Lightweight, breathable";
    if (gsm < 200) return "Mid-weight, versatile";
    if (gsm < 280) return "Heavyweight, premium";
    return "Ultra-heavy, substantial";
  };

  const getFitDescription = (fit: string) => {
    switch (fit?.toLowerCase()) {
      case "relaxed":
        return "Roomy through chest and body";
      case "regular":
        return "Classic fit, true to size";
      case "slim":
        return "Tailored, closer to body";
      case "oversized":
        return "Extra room, streetwear silhouette";
      default:
        return "True to size";
    }
  };

  const details = [
    {
      icon: Ruler,
      label: "Fit",
      value: fitType || "Regular",
      description: getFitDescription(fitType || "regular"),
    },
    {
      icon: Shirt,
      label: "Fabric",
      value: fabricComposition || "100% Cotton",
      description: "Soft, breathable, durable",
    },
    {
      icon: Scale,
      label: "Weight",
      value: weightGsm ? `${weightGsm} GSM` : "200 GSM",
      description: weightGsm ? getWeightDescription(weightGsm) : "Mid-weight, versatile",
    },
    {
      icon: Droplets,
      label: "Care",
      value: careInstructions || "Machine wash cold",
      description: "Tumble dry low, iron if needed",
    },
  ];

  return (
    <section className="w-full py-12 lg:py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">
          Fit & Fabric
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {details.map(({ icon: Icon, label, value, description }) => (
            <div key={label} className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto flex items-center justify-center border border-border rounded-full">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-sm font-light text-foreground">
                  {value}
                </p>
                <p className="text-xs font-light text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {modelInfo && (
          <p className="text-center text-xs font-light text-muted-foreground mt-8 pt-8 border-t border-border">
            {modelInfo}
          </p>
        )}
      </div>
    </section>
  );
};

export default FitFabricSection;
