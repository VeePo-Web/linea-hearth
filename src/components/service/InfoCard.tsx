import { ReactNode, memo } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'accent';
  size?: 'sm' | 'default';
}

const InfoCard = memo(({
  icon: Icon,
  title,
  description,
  className,
  variant = 'default',
  size = 'default'
}: InfoCardProps) => {
  const variantClasses = {
    default: "bg-stone-50 dark:bg-stone-900/50",
    muted: "bg-muted/30",
    accent: "border-l-4 border-amber-500 bg-amber-500/5"
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        size === 'default' ? "p-6" : "p-4",
        className
      )}
    >
      <div className={cn(
        "flex items-center gap-2",
        size === 'default' ? "mb-3" : "mb-2"
      )}>
        <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={1.5} />
        <h3 className="font-medium text-sm">{title}</h3>
      </div>
      
      <div className={cn(
        "text-muted-foreground font-light",
        size === 'default' ? "text-sm" : "text-xs"
      )}>
        {typeof description === 'string' ? (
          <p>{description}</p>
        ) : (
          description
        )}
      </div>
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

export default InfoCard;
