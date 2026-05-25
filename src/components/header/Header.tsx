import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBar from "./StatusBar";
import Navigation from "./Navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const { direction, isAtTop, isScrolled } = useScrollDirection(80);
  const prefersReducedMotion = useReducedMotion();
  const shouldHide = direction === "down" && isScrolled && !isAtTop;

  const [hasRevealed, setHasRevealed] = useState(!isHomePage);

  // Reset when navigating to /home
  useEffect(() => {
    if (isHomePage) {
      setHasRevealed(false);
    } else {
      setHasRevealed(true);
    }
  }, [isHomePage]);

  // Reveal on first scroll-up
  useEffect(() => {
    if (!hasRevealed && direction === "up" && isScrolled) {
      setHasRevealed(true);
    }
  }, [direction, isScrolled, hasRevealed]);

  // Determine y position
  const isHidden = !hasRevealed || shouldHide;
  const yPosition = isHidden ? -100 : 0;

  // Write --sticky-top so sub-navs (filter bar, story filters) track header reveal
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sticky-top",
      isHidden ? "0px" : "var(--header-height)"
    );
  }, [isHidden]);

  return (
    <motion.header
      className={cn(
        "w-full fixed top-0 left-0 right-0 z-header transition-shadow duration-300",
        !isAtTop && hasRevealed && "shadow-sm"
      )}
      initial={{ y: isHomePage ? -100 : 0 }}
      animate={{ y: yPosition }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              type: "tween",
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }
      }
    >
      <StatusBar />
      <Navigation />
    </motion.header>
  );
};

export default Header;
