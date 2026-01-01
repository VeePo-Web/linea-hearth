import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const StatusBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const usps = [
    "Free shipping over €50",
    "365 days warranty",
    "+100,000 happy customers",
    "Free returns within 30 days",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % usps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [usps.length]);

  return (
    <div className="bg-status-bar text-status-bar-foreground py-2 overflow-hidden">
      <div className="container mx-auto px-4 text-center h-5 relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            className="text-sm font-light absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {usps[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatusBar;
