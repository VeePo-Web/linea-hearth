import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import SizeQuizModal from '@/components/size-guide/SizeQuizModal';

interface SizeQuizContextType {
  isOpen: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;
  hasCompletedQuiz: boolean;
}

const SizeQuizContext = createContext<SizeQuizContextType | null>(null);

const QUIZ_COMPLETED_KEY = 'linea-size-quiz-completed';

const hasCompletedQuizBefore = (): boolean => {
  try {
    return localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
};

interface SizeQuizProviderProps {
  children: ReactNode;
}

export const SizeQuizProvider = ({ children }: SizeQuizProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(hasCompletedQuizBefore);

  const openQuiz = useCallback(() => {
    if (!hasCompletedQuiz) {
      setIsOpen(true);
    }
  }, [hasCompletedQuiz]);

  const closeQuiz = useCallback(() => {
    setIsOpen(false);
    // Re-check completion status
    setHasCompletedQuiz(hasCompletedQuizBefore());
  }, []);

  return (
    <SizeQuizContext.Provider value={{ isOpen, openQuiz, closeQuiz, hasCompletedQuiz }}>
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
