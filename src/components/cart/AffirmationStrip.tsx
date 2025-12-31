import { Gem } from "lucide-react";

const AffirmationStrip = () => {
  return (
    <div className="bg-foreground py-3 px-4 flex items-center justify-center gap-2">
      <Gem className="h-4 w-4 text-amber-400" />
      <span className="text-xs text-background/90 tracking-wide italic">
        Every piece is crafted with intention and purpose
      </span>
    </div>
  );
};

export default AffirmationStrip;
