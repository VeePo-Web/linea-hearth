import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
  /** Garment style — e.g. "Hoodie", "T-Shirt". Distinct cart line per style. */
  style?: string;
  stock?: number;
  // Bundle tracking for lookbook items
  lookId?: string;
  lookName?: string;
  productId?: string;
  variantId?: string;
}


/**
 * Stable, composite identity for a cart line.
 * Two lines that share a product id but differ by size/color/style are
 * distinct lines — removeItem / updateQuantity must key off this, not `id`,
 * or mutating one Hoodie line would also mutate a Tee line of the same design.
 */
export function getCartLineKey(
  item: Pick<CartItem, 'id' | 'size' | 'color' | 'style'>
): string {
  return `${item.id}|${item.size ?? ''}|${item.color ?? ''}|${item.style ?? ''}`;
}

export type ShippingProgressTier = 'start' | 'halfway' | 'almost' | 'unlocked';
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  /**
   * Batch-add multiple items in a single state update.
   * Used by Complete-the-Look bundles so we don't pop the drawer once per item
   * and don't fire 4 toasts when the user taps "Add the Look".
   */
  addItems: (items: Array<Omit<CartItem, 'quantity'> & { quantity?: number }>, options?: { openDrawer?: boolean }) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  hasFreeShipping: boolean;
  shippingProgress: number;
  progressTier: ShippingProgressTier;
  /** ISO country code for the destination ("CA" default). Drives flat-rate shipping. */
  shippingCountry: string;
  setShippingCountry: (code: string) => void;
  isCanadaDestination: boolean;
  /** Flat shipping cost in dollars based on shippingCountry + subtotal */
  shippingCost: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  lastAddedItem: CartItem | null;
}


const CART_STORAGE_KEY = 'loj-cart';
const SHIPPING_COUNTRY_KEY = 'loj-ship-country';
const FREE_SHIPPING_THRESHOLD = 250; // $250 CAD for free shipping (CA + intl)

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shippingCountry, setShippingCountryState] = useState<string>('CA');

  // Persist destination country so the free-shipping bar in the cart drawer
  // reflects the user's last-entered country on revisit.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHIPPING_COUNTRY_KEY);
      if (stored) setShippingCountryState(stored);
    } catch { /* ignore */ }
  }, []);

  const setShippingCountry = useCallback((code: string) => {
    const next = (code || 'CA').trim().toUpperCase();
    setShippingCountryState(next);
    try { localStorage.setItem(SHIPPING_COUNTRY_KEY, next); } catch { /* ignore */ }
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      }
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage:', e);
      }
    }
  }, [items, isInitialized]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = newItem.quantity || 1;
    
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(
        item => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color && item.style === newItem.style
      );

      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [...currentItems, { ...newItem, quantity }];
    });

    setLastAddedItem({ ...newItem, quantity } as CartItem);
    setIsCartOpen(true);
    
    // Haptic feedback for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Clear last added item after animation
    setTimeout(() => setLastAddedItem(null), 2000);
  }, []);

  const addItems = useCallback((
    newItems: Array<Omit<CartItem, 'quantity'> & { quantity?: number }>,
    options: { openDrawer?: boolean } = {},
  ) => {
    if (!newItems.length) return;
    const { openDrawer = true } = options;

    setItems(currentItems => {
      const merged = [...currentItems];
      for (const incoming of newItems) {
        const quantity = incoming.quantity || 1;
        const existingIndex = merged.findIndex(
          item => item.id === incoming.id && item.size === incoming.size && item.color === incoming.color && item.style === incoming.style
        );
        if (existingIndex > -1) {
          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity: merged[existingIndex].quantity + quantity,
          };
        } else {
          merged.push({ ...incoming, quantity } as CartItem);
        }
      }
      return merged;
    });

    // Use the last item as the "last added" reference for any peek UI
    const last = newItems[newItems.length - 1];
    setLastAddedItem({ ...last, quantity: last.quantity || 1 } as CartItem);
    if (openDrawer) setIsCartOpen(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]); // bundle haptic = triple pulse
    }

    setTimeout(() => setLastAddedItem(null), 2000);
  }, []);


  const removeItem = useCallback((lineKey: string) => {
    setItems(currentItems => currentItems.filter(item => getCartLineKey(item) !== lineKey));
  }, []);

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineKey);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        getCartLineKey(item) === lineKey ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const progressTier: ShippingProgressTier = 
    hasFreeShipping ? 'unlocked' :
    shippingProgress >= 90 ? 'almost' :
    shippingProgress >= 50 ? 'halfway' : 'start';
  const isCanadaDestination = shippingCountry === 'CA';
  const shippingCost = hasFreeShipping
    ? 0
    : (isCanadaDestination ? 15 : 40);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addItems,

        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
        hasFreeShipping,
        shippingProgress,
        progressTier,
        shippingCountry,
        setShippingCountry,
        isCanadaDestination,
        shippingCost,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        lastAddedItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
