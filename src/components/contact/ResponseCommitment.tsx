import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ResponseCommitment = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 flex items-center justify-center gap-3"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
      <p className="text-sm font-medium tracking-wide text-emerald-400">
        92% OF MESSAGES ANSWERED WITHIN 12 HOURS
      </p>
    </motion.div>
  );
};

export default ResponseCommitment;
