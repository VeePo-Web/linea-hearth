interface StyleOption {
  name: string;        // canonical key, e.g. "Hoodie"
  label?: string | null;
  iconUrl?: string | null;
  priceDelta: number;
  available: boolean;
}

interface StyleSelectorProps {
  styles: StyleOption[];
  selectedStyle: string | null;
  onStyleChange: (style: string) => void;
}

/**
 * Garment-style picker — twin of ColorSwatchSelector.
 * Shown above the color row on the PDP when the product offers more than one
 * garment type (e.g. Hoodie / T-Shirt / Crewneck).
 */
const StyleSelector = ({ styles, selectedStyle, onStyleChange }: StyleSelectorProps) => {
  if (!styles || styles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-light text-foreground">
          Style <span className="text-muted-foreground">· {styles.length}</span>
        </span>
        {selectedStyle && (
          <span className="text-sm font-light text-muted-foreground capitalize">
            {selectedStyle}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Garment style options">
        {styles.map(({ name, label, iconUrl, priceDelta, available }) => {
          const isSelected = selectedStyle === name;
          const delta = priceDelta > 0 ? `+$${priceDelta.toFixed(0)} CAD` : priceDelta < 0 ? `-$${Math.abs(priceDelta).toFixed(0)} CAD` : '';

          return (
            <button
              key={name}
              type="button"
              onClick={() => available && onStyleChange(name)}
              disabled={!available}
              className={`
                relative flex items-center gap-2 px-3 py-2 border transition-all duration-200 rounded-none
                ${isSelected
                  ? 'border-foreground bg-foreground/[0.03]'
                  : available
                    ? 'border-border hover:border-foreground/60'
                    : 'border-border opacity-40 cursor-not-allowed'
                }
              `}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
              title={label || name}
            >
              {iconUrl && (
                <img src={iconUrl} alt="" className="w-6 h-6 object-contain" />
              )}
              <span className="text-sm font-light tracking-wide">{label || name}</span>
              {delta && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  {delta}
                </span>
              )}
              {isSelected && (
                <span
                  aria-hidden
                  className="absolute left-3 right-3 -bottom-px h-px bg-foreground/60"
                  style={{ width: '40%' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleSelector;
