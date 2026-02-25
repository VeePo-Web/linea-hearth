import { Flame, Users } from "lucide-react";
import { useEffect, useState } from "react";

const OrderStatsBadge = () => {
  const [ordersToday, setOrdersToday] = useState(0);
  const [viewingNow, setViewingNow] = useState(0);

  useEffect(() => {
    // Simulate realistic order count (random between 80-150)
    setOrdersToday(Math.floor(Math.random() * 70) + 80);
    
    // Simulate people viewing (random between 5-15)
    setViewingNow(Math.floor(Math.random() * 10) + 5);

    // Slowly increment orders over time
    const interval = setInterval(() => {
      setOrdersToday((prev) => prev + 1);
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Flame className="h-3 w-3 text-champagne-500" />
        <span>
          <span className="font-medium text-foreground">{ordersToday}</span> orders today
        </span>
      </div>
      
      <div className="w-px h-3 bg-muted-foreground/30" />
      
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Users className="h-3 w-3" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <span>
          <span className="font-medium text-foreground">{viewingNow}</span> viewing now
        </span>
      </div>
    </div>
  );
};

export default OrderStatsBadge;
