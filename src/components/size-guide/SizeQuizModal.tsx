import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useSizeQuiz, HeightRange, FitPreference, PrimaryCategory } from "@/hooks/useSizeQuiz";
import { cn } from "@/lib/utils";

interface SizeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuizOptionProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

const QuizOption = ({ label, description, isSelected, onClick }: QuizOptionProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-4 text-left border transition-all duration-200 rounded-none",
      isSelected
        ? "border-foreground bg-foreground text-background"
        : "border-border hover:border-foreground bg-background text-foreground"
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    {description && (
      <p className={cn(
        "text-xs mt-1",
        isSelected ? "text-background/70" : "text-muted-foreground"
      )}>
        {description}
      </p>
    )}
  </button>
);

const SizeQuizModal = ({ isOpen, onClose }: SizeQuizModalProps) => {
  const {
    currentStep,
    answers,
    setAnswer,
    nextStep,
    prevStep,
    submitQuiz,
    recommendedSizes,
  } = useSizeQuiz();

  const heightOptions: { value: HeightRange; label: string; description: string }[] = [
    { value: 'under-5-4', label: "Under 5'4\"", description: "162 cm and below" },
    { value: '5-4-to-5-8', label: "5'4\" - 5'8\"", description: "163 - 173 cm" },
    { value: '5-9-to-6-0', label: "5'9\" - 6'0\"", description: "174 - 183 cm" },
    { value: 'over-6-0', label: "Over 6'0\"", description: "184 cm and above" },
  ];

  const fitOptions: { value: FitPreference; label: string; description: string }[] = [
    { value: 'fitted', label: "Fitted", description: "Close to body, tailored look" },
    { value: 'relaxed', label: "Relaxed", description: "Comfortable, slightly loose" },
    { value: 'oversized', label: "Oversized", description: "Extra roomy, streetwear vibe" },
  ];

  const categoryOptions: { value: PrimaryCategory; label: string; description: string }[] = [
    { value: 'tops', label: "Mostly Tops", description: "Tees, hoodies, crewnecks" },
    { value: 'bottoms', label: "Mostly Bottoms", description: "Joggers, shorts, pants" },
    { value: 'both', label: "Both Equally", description: "Full fits, head to toe" },
  ];

  const steps = [
    {
      title: "What's your height?",
      subtitle: "This helps us recommend the right length",
      options: heightOptions,
      answerKey: 'heightRange' as const,
    },
    {
      title: "How do you like your fit?",
      subtitle: "Everyone has their preference",
      options: fitOptions,
      answerKey: 'fitPreference' as const,
    },
    {
      title: "What do you shop for most?",
      subtitle: "We'll prioritize these sizes",
      options: categoryOptions,
      answerKey: 'primaryCategory' as const,
    },
  ];

  const currentStepData = steps[currentStep];
  const canProceed = answers[currentStepData.answerKey] !== null;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      submitQuiz();
    } else {
      nextStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex gap-1 p-4 pb-0">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 flex-1 transition-colors duration-300",
                idx <= currentStep ? "bg-foreground" : "bg-muted"
              )}
            />
          ))}
        </div>

        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-light">
            {currentStepData.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-light">
            {currentStepData.subtitle}
          </p>
        </DialogHeader>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {currentStepData.options.map((option) => (
                <QuizOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={answers[currentStepData.answerKey] === option.value}
                  onClick={() => setAnswer(currentStepData.answerKey, option.value)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Size preview on last step */}
        {isLastStep && canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-4 p-4 bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Your Recommended Sizes
              </span>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-medium">{recommendedSizes.tops}</div>
                <div className="text-xs text-muted-foreground">Tops</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium">{recommendedSizes.bottoms}</div>
                <div className="text-xs text-muted-foreground">Bottoms</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={currentStep > 0 ? prevStep : onClose}
            className="text-sm font-light"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentStep > 0 ? "Back" : "Skip"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            size="sm"
            className="text-sm font-light"
          >
            {isLastStep ? (
              <>
                Save My Sizes
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Gamification message */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 You'll save 12 seconds on every future purchase
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeQuizModal;
