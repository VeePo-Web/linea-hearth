import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

interface SizeOption {
  size: string;
  stock: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
}

const SizeSelector = ({ sizes, selectedSize, onSizeChange }: SizeSelectorProps) => {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const getSizeState = (stock: number) => {
    if (stock === 0) return "oos";
    if (stock <= 3) return "low";
    return "available";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-light text-foreground">Size</span>
        <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
          <DialogTrigger asChild>
            <button className="text-xs font-light text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              Size Guide
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-light">Size Guide</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-sm font-light text-muted-foreground">
                Measurements are in inches. For the best fit, measure your chest at the fullest point.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-light">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-light">Size</th>
                      <th className="py-2 text-center font-light">Chest</th>
                      <th className="py-2 text-center font-light">Length</th>
                      <th className="py-2 text-center font-light">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2">XS</td>
                      <td className="py-2 text-center">34-36</td>
                      <td className="py-2 text-center">27</td>
                      <td className="py-2 text-center">8</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">S</td>
                      <td className="py-2 text-center">36-38</td>
                      <td className="py-2 text-center">28</td>
                      <td className="py-2 text-center">8.25</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">M</td>
                      <td className="py-2 text-center">38-40</td>
                      <td className="py-2 text-center">29</td>
                      <td className="py-2 text-center">8.5</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">L</td>
                      <td className="py-2 text-center">40-42</td>
                      <td className="py-2 text-center">30</td>
                      <td className="py-2 text-center">8.75</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">XL</td>
                      <td className="py-2 text-center">42-44</td>
                      <td className="py-2 text-center">31</td>
                      <td className="py-2 text-center">9</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">2XL</td>
                      <td className="py-2 text-center">44-46</td>
                      <td className="py-2 text-center">32</td>
                      <td className="py-2 text-center">9.25</td>
                    </tr>
                    <tr>
                      <td className="py-2">3XL</td>
                      <td className="py-2 text-center">46-48</td>
                      <td className="py-2 text-center">33</td>
                      <td className="py-2 text-center">9.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs font-light text-muted-foreground">
                Need help? Contact us for personalized sizing advice.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, stock }) => {
          const state = getSizeState(stock);
          const isSelected = selectedSize === size;
          const isDisabled = state === "oos";

          return (
            <button
              key={size}
              onClick={() => !isDisabled && onSizeChange(size)}
              disabled={isDisabled}
              className={`
                relative min-w-[44px] h-11 px-3 text-sm font-light border transition-all duration-200
                ${isSelected 
                  ? "bg-foreground text-background border-foreground" 
                  : isDisabled
                    ? "bg-muted/30 text-muted-foreground/40 border-border/50 cursor-not-allowed line-through"
                    : "bg-background text-foreground border-border hover:border-foreground"
                }
              `}
              aria-label={`Size ${size}${isDisabled ? " - Out of stock" : state === "low" ? ` - Only ${stock} left` : ""}`}
            >
              {size}
              {state === "low" && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {selectedSize && sizes.find(s => s.size === selectedSize)?.stock! <= 3 && sizes.find(s => s.size === selectedSize)?.stock! > 0 && (
        <p className="text-xs font-light text-amber-600">
          Only {sizes.find(s => s.size === selectedSize)?.stock} left in this size
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
