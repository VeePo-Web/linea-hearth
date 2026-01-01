import { 
  Keyboard, 
  Volume2, 
  Palette, 
  Focus, 
  CirclePause, 
  ImageIcon 
} from "lucide-react";

const features = [
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description: "All interactive elements are accessible via keyboard with logical tab order."
  },
  {
    icon: Volume2,
    title: "Screen Reader Support",
    description: "Semantic HTML and ARIA labels ensure content is properly announced."
  },
  {
    icon: Palette,
    title: "Color Contrast",
    description: "Text and interactive elements meet WCAG AA contrast ratios."
  },
  {
    icon: Focus,
    title: "Focus States",
    description: "Visible focus indicators on all interactive elements for keyboard users."
  },
  {
    icon: CirclePause,
    title: "Reduced Motion",
    description: "Animations respect prefers-reduced-motion browser settings."
  },
  {
    icon: ImageIcon,
    title: "Alt Text",
    description: "All meaningful images include descriptive alternative text."
  }
];

const AccessibilityFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div 
            key={feature.title}
            className="p-4 bg-stone-50 dark:bg-stone-900 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-stone-200 dark:bg-stone-800">
                <Icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccessibilityFeatures;
