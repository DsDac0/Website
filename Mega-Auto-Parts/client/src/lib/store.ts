import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  sessionId: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// Generate a simple session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: generateSessionId(),
      
      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            item => item.productId === newItem.productId
          );
          
          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += 1;
            return { items: updatedItems };
          } else {
            return {
              items: [...state.items, { ...newItem, quantity: 1 }]
            };
          }
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          return total + (parseFloat(item.price) * item.quantity);
        }, 0);
      },
      
      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
