import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import SizeQuizModal from '@/components/size-guide/SizeQuizModal';

interface PendingAction {
  productId: string;
  size?: string;
  color?: string;
  callback: (size: string, color?: string) => void;
}

interface SizeQuizContextType {
  isOpen: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;
  hasCompletedQuiz: boolean;
  /** Open quiz with a pending action to execute after completion */
  openQuizWithPending: (action: PendingAction) => void;
  /** Check if quiz should be triggered (no saved sizes) */
  shouldTriggerQuiz: () => boolean;
}

const SizeQuizContext = createContext<SizeQuizContextType | null>(null);

const QUIZ_COMPLETED_KEY = 'linea-size-quiz-completed';
const SIZE_MEMORY_KEY = 'linea-size-memory';

const hasCompletedQuizBefore = (): boolean => {
  try {
    return localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
};

const hasAnySavedSizes = (): boolean => {
  try {
    const stored = localStorage.getItem(SIZE_MEMORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.keys(parsed).length > 0;
    }
  } catch {
    // Ignore
  }
  return false;
};

interface SizeQuizProviderProps {
  children: ReactNode;
}

export const SizeQuizProvider = ({ children }: SizeQuizProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(hasCompletedQuizBefore);
  const pendingActionRef = useRef<PendingAction | null>(null);

  const openQuiz = useCallback(() => {
    if (!hasCompletedQuiz) {
      setIsOpen(true);
    }
  }, [hasCompletedQuiz]);

  const openQuizWithPending = useCallback((action: PendingAction) => {
    pendingActionRef.current = action;
    setIsOpen(true);
  }, []);

  const shouldTriggerQuiz = useCallback((): boolean => {
    // Should trigger if never completed quiz AND no saved sizes
    return !hasCompletedQuiz && !hasAnySavedSizes();
  }, [hasCompletedQuiz]);

  const closeQuiz = useCallback(() => {
    setIsOpen(false);
    // Re-check completion status
    const completed = hasCompletedQuizBefore();
    setHasCompletedQuiz(completed);
    
    // If quiz was completed and we have a pending action, execute it
    if (completed && pendingActionRef.current) {
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      
      // Get the recommended size from localStorage (just set by quiz)
      try {
        const stored = localStorage.getItem(SIZE_MEMORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Find the most relevant size (tops first, then bottoms)
          const size = parsed.tops || parsed.bottoms || parsed.hats;
          if (size) {
            // Small delay to ensure state updates propagate
            setTimeout(() => {
              pending.callback(size, pending.color);
            }, 100);
          }
        }
      } catch {
        // Ignore
      }
    } else {
      pendingActionRef.current = null;
    }
  }, []);

  return (
    <SizeQuizContext.Provider value={{ 
      isOpen, 
      openQuiz, 
      closeQuiz, 
      hasCompletedQuiz,
      openQuizWithPending,
      shouldTriggerQuiz,
    }}>
      {children}
      <SizeQuizModal isOpen={isOpen} onClose={closeQuiz} />
    </SizeQuizContext.Provider>
  );
};

export const useSizeQuizContext = (): SizeQuizContextType => {
  const context = useContext(SizeQuizContext);
  if (!context) {
    throw new Error('useSizeQuizContext must be used within a SizeQuizProvider');
  }
  return context;
};

export default SizeQuizProvider;
