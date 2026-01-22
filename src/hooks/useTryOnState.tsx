import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface EquippedItem {
  productId: string;
  variantId?: string;
  size: string;
  color: string;
  price: number;
  name: string;
  imageUrl?: string;
  textureUrl?: string;  // Flat-front image optimized for 3D texturing
  modelUrl?: string;
  productImages?: Array<{
    image_url: string;
    is_primary?: boolean;
  }>;
}

export interface TryOnState {
  avatarGender: 'male' | 'female';
  avatarBodyType: 'slim' | 'athletic' | 'average' | 'curvy';
  avatarSkinTone: string;
  equippedItems: {
    head: EquippedItem | null;
    top: EquippedItem | null;
    outerwear: EquippedItem | null;
    bottom: EquippedItem | null;
    footwear: EquippedItem | null;
  };
  activeSlot: string | null;
  isLoading: boolean;
}

interface TryOnContextType extends TryOnState {
  setAvatarGender: (gender: 'male' | 'female') => void;
  setAvatarBodyType: (bodyType: 'slim' | 'athletic' | 'average' | 'curvy') => void;
  setAvatarSkinTone: (tone: string) => void;
  equipItem: (slot: keyof TryOnState['equippedItems'], item: EquippedItem) => void;
  unequipItem: (slot: keyof TryOnState['equippedItems']) => void;
  clearAllItems: () => void;
  setActiveSlot: (slot: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  getTotalPrice: () => number;
  getEquippedCount: () => number;
}

const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

const defaultState: TryOnState = {
  avatarGender: 'male',
  avatarBodyType: 'average',
  avatarSkinTone: '#D4A574',
  equippedItems: {
    head: null,
    top: null,
    outerwear: null,
    bottom: null,
    footwear: null,
  },
  activeSlot: null,
  isLoading: false,
};

export const TryOnProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TryOnState>(defaultState);

  const setAvatarGender = useCallback((gender: 'male' | 'female') => {
    setState(prev => ({ ...prev, avatarGender: gender }));
  }, []);

  const setAvatarBodyType = useCallback((bodyType: 'slim' | 'athletic' | 'average' | 'curvy') => {
    setState(prev => ({ ...prev, avatarBodyType: bodyType }));
  }, []);

  const setAvatarSkinTone = useCallback((tone: string) => {
    setState(prev => ({ ...prev, avatarSkinTone: tone }));
  }, []);

  const equipItem = useCallback((slot: keyof TryOnState['equippedItems'], item: EquippedItem) => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        ...prev.equippedItems,
        [slot]: item,
      },
    }));
  }, []);

  const unequipItem = useCallback((slot: keyof TryOnState['equippedItems']) => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        ...prev.equippedItems,
        [slot]: null,
      },
    }));
  }, []);

  const clearAllItems = useCallback(() => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        head: null,
        top: null,
        outerwear: null,
        bottom: null,
        footwear: null,
      },
    }));
  }, []);

  const setActiveSlot = useCallback((slot: string | null) => {
    setState(prev => ({ ...prev, activeSlot: slot }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const getTotalPrice = useCallback(() => {
    return Object.values(state.equippedItems).reduce((total, item) => {
      return total + (item?.price || 0);
    }, 0);
  }, [state.equippedItems]);

  const getEquippedCount = useCallback(() => {
    return Object.values(state.equippedItems).filter(Boolean).length;
  }, [state.equippedItems]);

  return (
    <TryOnContext.Provider
      value={{
        ...state,
        setAvatarGender,
        setAvatarBodyType,
        setAvatarSkinTone,
        equipItem,
        unequipItem,
        clearAllItems,
        setActiveSlot,
        setIsLoading,
        getTotalPrice,
        getEquippedCount,
      }}
    >
      {children}
    </TryOnContext.Provider>
  );
};

export const useTryOnState = () => {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error('useTryOnState must be used within a TryOnProvider');
  }
  return context;
};
