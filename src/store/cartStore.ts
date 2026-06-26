import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Address } from "@/types/address";
import { Complement, CustomizationType } from "@/types/products";
import { generateCartItemId, calculateTotalPrice } from "@/lib/utils";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  image1: string;
  image2?: string | null;
  complements: Complement[];
  allowCustomization: boolean;
  customizationType: CustomizationType;
  rewardCode?: string; // Presente solo en items agregados como premio gratis
}

interface CartStore {
  items: CartItem[];
  address: Address | null;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeComplement: (itemId: string, complementId: number | string) => void;
  updateItemComplements: (itemId: string, newComplements: Complement[]) => void; // NUEVA
  setAddress: (address: Address) => void;
  removeAddress: () => void; // NUEVA
  clearCart: () => void;

  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  getDeliveryFee: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      address: null,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        }),

      removeComplement: (itemId, complementId) =>
        set((state) => {
          const itemIndex = state.items.findIndex((i) => i.id === itemId);
          if (itemIndex === -1) return state;

          const itemToRemoveFrom = state.items[itemIndex];

          const updatedComplements = itemToRemoveFrom.complements.filter(
            (c) => c.id !== complementId
          );
          const newPrice = calculateTotalPrice(
            itemToRemoveFrom.basePrice,
            updatedComplements
          );
          const newId = itemToRemoveFrom.rewardCode
            ? itemToRemoveFrom.id
            : generateCartItemId(itemToRemoveFrom.productId, updatedComplements);

          const existingItemIndex = state.items.findIndex(
            (i, index) => i.id === newId && index !== itemIndex
          );

          const newItems = [...state.items];

          if (existingItemIndex !== -1) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity:
                newItems[existingItemIndex].quantity +
                itemToRemoveFrom.quantity,
            };
            newItems.splice(itemIndex, 1);
          } else {
            newItems[itemIndex] = {
              ...itemToRemoveFrom,
              id: newId,
              complements: updatedComplements,
              price: newPrice,
            };
          }

          return { items: newItems };
        }),

      // NUEVA FUNCIÓN: Actualiza los complementos de un item del carrito
      updateItemComplements: (itemId, newComplements) =>
        set((state) => {
          const itemIndex = state.items.findIndex((i) => i.id === itemId);
          if (itemIndex === -1) return state;

          const item = state.items[itemIndex];
          const newPrice = calculateTotalPrice(item.basePrice, newComplements);
          const newId = item.rewardCode
            ? item.id
            : generateCartItemId(item.productId, newComplements);

          // Verificar si ya existe un item con los mismos complementos
          const existingItemIndex = state.items.findIndex(
            (i, index) => i.id === newId && index !== itemIndex
          );

          const newItems = [...state.items];

          if (existingItemIndex !== -1 && newId !== itemId) {
            // Si ya existe, combinar cantidades
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + item.quantity,
            };
            newItems.splice(itemIndex, 1);
          } else {
            // Si no existe, actualizar el item actual
            newItems[itemIndex] = {
              ...item,
              id: newId,
              complements: newComplements,
              price: newPrice,
            };
          }

          return { items: newItems };
        }),

      setAddress: (address) => set({ address }),
      removeAddress: () => set({ address: null }),
      clearCart: () => set({ items: [] }),

      getDeliveryFee: () => {
        const address = get().address;
        return address?.deliveryPrice || 0;
      },

      getSubtotal: () => {
        const subtotal = get().items.reduce((sum, item) => {
          return sum + (item.price || 0) * item.quantity;
        }, 0);

        return subtotal;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        const total = subtotal + deliveryFee;

        return total;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
