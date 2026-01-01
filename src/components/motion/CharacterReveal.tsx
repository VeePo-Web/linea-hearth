import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CharacterRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

const CharacterReveal = ({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
  staggerDelay = 0.03,
  once = true,
}: CharacterRevealProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const characters = text.split("");

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      <motion.span
        ref={ref}
        style={{ display: "inline-block" }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            style={{
              display: "inline-block",
              whiteSpace: char === " " ? "pre" : "normal",
            }}
            variants={{
              hidden: {
                opacity: 0,
                y: 40,
                rotateX: -60,
              },
              visible: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                  delay: delay + index * staggerDelay,
                },
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default CharacterReveal;
