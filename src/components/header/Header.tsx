import { motion } from "framer-motion";
import StatusBar from "./StatusBar";
import Navigation from "./Navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

const Header = () => {
  const { direction, isAtTop, isScrolled } = useScrollDirection(50);
  const shouldHide = direction === "down" && isScrolled && !isAtTop;

  return (
    <motion.header
      className={cn(
        "w-full fixed top-0 left-0 right-0 z-50 transition-shadow duration-300",
        !isAtTop && "shadow-sm"
      )}
      initial={{ y: 0 }}
      animate={{ y: shouldHide ? -100 : 0 }}
      transition={{
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      }}
    >
      <StatusBar />
      <Navigation />
    </motion.header>
  );
};

export default Header;
