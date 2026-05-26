import { Gem } from "lucide-react";

const MissionStrip = () => {
  return (
    <div className="w-full bg-foreground py-2.5">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-2">
        <Gem className="h-3.5 w-3.5 text-champagne-300" />
        <span className="text-[10px] text-background/80 tracking-[0.2em] uppercase font-medium">
          The Tribe of Judah Lives in You
        </span>
      </div>
    </div>
  );
};

export default MissionStrip;
