import { useState, useEffect, useCallback } from 'react';

const SIZE_MEMORY_KEY = 'linea-size-memory';

interface SizeMemory {
  tops: string | null;
  bottoms: string | null;
  hats: string | null;
  lastUpdated: string | null;
}

interface UseSizeMemoryReturn {
  getRememberedSize: (categorySlug: string) => string | null;
  rememberSize: (categorySlug: string, size: string) => void;
  clearSizeMemory: () => void;
  sizeMemory: SizeMemory;
}

const defaultMemory: SizeMemory = {
  tops: null,
  bottoms: null,
  hats: null,
  lastUpdated: null,
};

// Map granular category slugs to size types
const getSizeType = (categorySlug: string): keyof Omit<SizeMemory, 'lastUpdated'> | null => {
  const slug = categorySlug.toLowerCase();
  
  const topsCategories = [
    'tops', 'tees', 'short-sleeve', 'long-sleeve', 'cropped',
    'hoodies', 'pullover-hoodies', 'zip-up-hoodies', 'crewnecks',
    'quarter-zips', 'lightweight-hoodies', 'top', 't-shirts',
    'sweatshirts', 'jackets', 'outerwear', 'shirts'
  ];
  
  const bottomsCategories = [
    'bottoms', 'shorts', 'joggers', 'sweatpants', 'pants',
    'jeans', 'bottom', 'trousers'
  ];
  
  const hatsCategories = [
    'hats', 'snapbacks', 'dad-hats', 'beanies', 'caps',
    'headwear', 'hat'
  ];
  
  if (topsCategories.some(cat => slug.includes(cat))) return 'tops';
  if (bottomsCategories.some(cat => slug.includes(cat))) return 'bottoms';
  if (hatsCategories.some(cat => slug.includes(cat))) return 'hats';
  
  return null;
};

// Map position strings from lookbook to size types
const getPositionSizeType = (position: string | null): keyof Omit<SizeMemory, 'lastUpdated'> | null => {
  if (!position) return null;
  
  const pos = position.toLowerCase();
  
  if (['top', 'tops'].includes(pos)) return 'tops';
  if (['bottom', 'bottoms'].includes(pos)) return 'bottoms';
  if (['hat', 'hats', 'headwear'].includes(pos)) return 'hats';
  
  return null;
};

export const useSizeMemory = (): UseSizeMemoryReturn => {
  const [sizeMemory, setSizeMemory] = useState<SizeMemory>(defaultMemory);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIZE_MEMORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SizeMemory;
        setSizeMemory(parsed);
      }
    } catch (e) {
      console.warn('Failed to load size memory:', e);
    }
  }, []);

  // Save to localStorage when memory changes
  const saveMemory = useCallback((memory: SizeMemory) => {
    try {
      localStorage.setItem(SIZE_MEMORY_KEY, JSON.stringify(memory));
    } catch (e) {
      console.warn('Failed to save size memory:', e);
    }
  }, []);

  const getRememberedSize = useCallback((categorySlugOrPosition: string): string | null => {
    // First try as category slug
    let sizeType = getSizeType(categorySlugOrPosition);
    
    // If not found, try as position
    if (!sizeType) {
      sizeType = getPositionSizeType(categorySlugOrPosition);
    }
    
    if (!sizeType) return null;
    
    return sizeMemory[sizeType];
  }, [sizeMemory]);

  const rememberSize = useCallback((categorySlugOrPosition: string, size: string) => {
    // First try as category slug
    let sizeType = getSizeType(categorySlugOrPosition);
    
    // If not found, try as position
    if (!sizeType) {
      sizeType = getPositionSizeType(categorySlugOrPosition);
    }
    
    if (!sizeType) return;

    const newMemory: SizeMemory = {
      ...sizeMemory,
      [sizeType]: size,
      lastUpdated: new Date().toISOString(),
    };
    
    setSizeMemory(newMemory);
    saveMemory(newMemory);
  }, [sizeMemory, saveMemory]);

  const clearSizeMemory = useCallback(() => {
    setSizeMemory(defaultMemory);
    try {
      localStorage.removeItem(SIZE_MEMORY_KEY);
    } catch (e) {
      console.warn('Failed to clear size memory:', e);
    }
  }, []);

  return {
    getRememberedSize,
    rememberSize,
    clearSizeMemory,
    sizeMemory,
  };
};

export default useSizeMemory;
