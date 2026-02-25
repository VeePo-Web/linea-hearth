import { Gift, Truck, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

const milestones = [
  { threshold: 50, icon: Gift, label: "Free Gift", reward: "Sticker pack" },
  { threshold: 100, icon: Truck, label: "Free Ship", reward: "Free shipping" },
  { threshold: 200, icon: Zap, label: "Priority", reward: "Priority shipping" }
];

const RewardsProgress = () => {
  const { subtotal } = useCart();
  
  const maxThreshold = milestones[milestones.length - 1].threshold;
  const progress = Math.min((subtotal / maxThreshold) * 100, 100);

  return (
    <div className="p-4 bg-muted/20 border border-muted-foreground/10">
      <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
        Unlock Rewards
      </div>
      
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          {/* Filled progress */}
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Milestone markers */}
        <div className="absolute top-0 left-0 w-full flex justify-between" style={{ transform: "translateY(-50%)" }}>
          {milestones.map((milestone) => {
            const Icon = milestone.icon;
            const isUnlocked = subtotal >= milestone.threshold;
            const position = (milestone.threshold / maxThreshold) * 100;
            
            return (
              <div
                key={milestone.threshold}
                className="absolute flex flex-col items-center"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                    isUnlocked
                      ? "bg-emerald-500 text-white scale-110"
                      : "bg-muted text-muted-foreground border-2 border-background"
                  )}
                >
                  {isUnlocked ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                </div>
                
                {/* Label below */}
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      "text-[10px] font-medium whitespace-nowrap",
                      isUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    {milestone.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    ${milestone.threshold}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Spacer for milestone labels */}
      <div className="h-12" />
      
      {/* Next reward hint */}
      {subtotal < maxThreshold && (
        <div className="text-xs text-center text-muted-foreground mt-2">
          {(() => {
            const nextMilestone = milestones.find((m) => subtotal < m.threshold);
            if (!nextMilestone) return null;
            const amountNeeded = nextMilestone.threshold - subtotal;
            return (
              <span>
                Add <span className="font-medium text-foreground">${amountNeeded.toFixed(0)}</span> to unlock{" "}
                <span className="text-champagne-600 dark:text-champagne-300">{nextMilestone.reward}</span>
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default RewardsProgress;
