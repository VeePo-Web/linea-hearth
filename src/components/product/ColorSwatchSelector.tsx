interface ColorOption {
  color: string;
  colorCode: string;
  available: boolean;
  swatchImage?: string | null;
}

interface ColorSwatchSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onColorChange: (color: string) => void;
}

const ColorSwatchSelector = ({ colors, selectedColor, onColorChange }: ColorSwatchSelectorProps) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-light text-foreground">
          Color <span className="text-muted-foreground">· {colors.length}</span>
        </span>
        {selectedColor && (
          <span className="text-sm font-light text-muted-foreground capitalize">
            {selectedColor}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Color options">
        {colors.map(({ color, colorCode, available, swatchImage }) => {
          const isSelected = selectedColor === color;

          return (
            <button
              key={color}
              onClick={() => available && onColorChange(color)}
              disabled={!available}
              className={`
                relative w-8 h-8 rounded-full overflow-hidden transition-all duration-200
                ${isSelected
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : available
                    ? "hover:ring-1 hover:ring-muted-foreground hover:ring-offset-1 hover:ring-offset-background"
                    : "opacity-40 cursor-not-allowed"
                }
              `}
              style={{ backgroundColor: colorCode }}
              aria-label={`Select ${color} color${!available ? " - Out of stock" : ""}`}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
              title={color}
            >
              {swatchImage && (
                <img src={swatchImage} alt="" className="w-full h-full object-cover" />
              )}
              {!available && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-[1px] bg-muted-foreground/60 rotate-45 absolute" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSwatchSelector;
