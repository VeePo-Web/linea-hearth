import { useState, useCallback } from 'react';
import { useSizeMemory } from '@/hooks/useSizeMemory';
import { useToast } from '@/hooks/use-toast';

const QUIZ_COMPLETED_KEY = 'linea-size-quiz-completed';

export type HeightRange = 'under-5-4' | '5-4-to-5-8' | '5-9-to-6-0' | 'over-6-0';
export type FitPreference = 'fitted' | 'relaxed' | 'oversized';
export type PrimaryCategory = 'tops' | 'bottoms' | 'both';

interface QuizAnswers {
  heightRange: HeightRange | null;
  fitPreference: FitPreference | null;
  primaryCategory: PrimaryCategory | null;
}

interface SizeQuizReturn {
  // State
  isOpen: boolean;
  currentStep: number;
  answers: QuizAnswers;
  hasCompletedQuiz: boolean;
  
  // Actions
  openQuiz: () => void;
  closeQuiz: () => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitQuiz: () => void;
  
  // Derived
  isComplete: boolean;
  recommendedSizes: {
    tops: string;
    bottoms: string;
    hats: string;
  };
}

// Size recommendation logic based on height and fit preference
const getSizeRecommendation = (
  heightRange: HeightRange | null,
  fitPreference: FitPreference | null
): { tops: string; bottoms: string; hats: string } => {
  // Default to medium if no data
  if (!heightRange || !fitPreference) {
    return { tops: 'M', bottoms: 'M', hats: 'ONE SIZE' };
  }

  // Base size from height
  const baseSizeMap: Record<HeightRange, string> = {
    'under-5-4': 'XS',
    '5-4-to-5-8': 'S',
    '5-9-to-6-0': 'M',
    'over-6-0': 'L',
  };

  const baseSize = baseSizeMap[heightRange];
  
  // Adjust for fit preference
  const sizeProgression = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const baseIndex = sizeProgression.indexOf(baseSize);
  
  let topsIndex = baseIndex;
  let bottomsIndex = baseIndex;
  
  if (fitPreference === 'oversized') {
    topsIndex = Math.min(baseIndex + 2, sizeProgression.length - 1);
    bottomsIndex = Math.min(baseIndex + 1, sizeProgression.length - 1);
  } else if (fitPreference === 'relaxed') {
    topsIndex = Math.min(baseIndex + 1, sizeProgression.length - 1);
  }
  
  return {
    tops: sizeProgression[topsIndex],
    bottoms: sizeProgression[bottomsIndex],
    hats: 'ONE SIZE',
  };
};

// Check if quiz was completed before
const hasCompletedQuizBefore = (): boolean => {
  try {
    return localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
};

// Mark quiz as completed
const markQuizCompleted = (): void => {
  try {
    localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
  } catch {
    console.warn('Failed to mark quiz as completed');
  }
};

export function useSizeQuiz(): SizeQuizReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    heightRange: null,
    fitPreference: null,
    primaryCategory: null,
  });
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(hasCompletedQuizBefore);
  
  const { rememberSize } = useSizeMemory();
  const { toast } = useToast();

  const recommendedSizes = getSizeRecommendation(answers.heightRange, answers.fitPreference);
  
  const isComplete = !!(answers.heightRange && answers.fitPreference && answers.primaryCategory);

  const openQuiz = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(0);
  }, []);

  const closeQuiz = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
    setAnswers({
      heightRange: null,
      fitPreference: null,
      primaryCategory: null,
    });
  }, []);

  const setAnswer = useCallback(<K extends keyof QuizAnswers>(
    key: K,
    value: QuizAnswers[K]
  ) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const submitQuiz = useCallback(async () => {
    if (!isComplete) return;

    // Save sizes based on primary category preference
    if (answers.primaryCategory === 'tops' || answers.primaryCategory === 'both') {
      await rememberSize('tops', recommendedSizes.tops);
    }
    
    if (answers.primaryCategory === 'bottoms' || answers.primaryCategory === 'both') {
      await rememberSize('bottoms', recommendedSizes.bottoms);
    }
    
    // Always save hats
    await rememberSize('hats', recommendedSizes.hats);

    // Mark as completed
    markQuizCompleted();
    setHasCompletedQuiz(true);

    // Show success toast with gamification message
    toast({
      title: "Sizes saved! 🎉",
      description: "You'll save 12 seconds on every future purchase with one-tap shopping.",
    });

    // Close modal
    closeQuiz();
  }, [isComplete, answers, recommendedSizes, rememberSize, toast, closeQuiz]);

  return {
    isOpen,
    currentStep,
    answers,
    hasCompletedQuiz,
    openQuiz,
    closeQuiz,
    setAnswer,
    nextStep,
    prevStep,
    submitQuiz,
    isComplete,
    recommendedSizes,
  };
}

export default useSizeQuiz;
