"use client";

import { useCallback, useRef } from "react";
import { useMenu } from "@/hooks/home/useMenu";
import { useCartStore, CartItem } from "@/store/cartStore";
import { Product } from "@/types/products";
import { generateCartItemId, calculateTotalPrice } from "@/lib/utils";

export function useProductGridModal(onClose: () => void) {
  const { products } = useMenu();
  const { items, addItem, updateQuantity: updateCartQuantity } = useCartStore();
  const snapshot = useRef<CartItem[] | null>(null);

  const saveSnapshot = useCallback(() => {
    snapshot.current = useCartStore.getState().items.map((item) => ({ ...item }));
  }, []);

  const handleCancel = useCallback(() => {
    if (snapshot.current !== null) {
      useCartStore.setState({ items: snapshot.current });
      snapshot.current = null;
    }
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    snapshot.current = null;
    onClose();
  }, [onClose]);

  const getQuantityInCart = useCallback(
    (productId: number) => {
      return items
        .filter((item) => item.productId === productId && item.complements.length === 0)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [items]
  );

  // Cada clic en agregar crea una línea nueva e independiente (quantity 1)
  const addProductToCart = useCallback(
    (product: Product) => {
      // Producto agotado: no se puede agregar al carrito
      if (product.soldOut) return;

      addItem({
        id: generateCartItemId(product.id),
        productId: product.id,
        name: product.name,
        price: calculateTotalPrice(product.basePrice, []),
        basePrice: product.basePrice,
        quantity: 1,
        image1: product.image1,
        image2: product.image2 || null,
        complements: [],
        allowCustomization: product.allowCustomization,
        customizationType: product.customizationType,
      });
    },
    [addItem]
  );

  // Quita 1 unidad de la última línea simple del producto
  const removeProductFromCart = useCallback(
    (productId: number) => {
      const existingItem = items.findLast(
        (item) => item.productId === productId && item.complements.length === 0
      );

      if (existingItem) {
        updateCartQuantity(existingItem.id, existingItem.quantity - 1);
      }
    },
    [items, updateCartQuantity]
  );

  return {
    products,
    getQuantityInCart,
    addProductToCart,
    removeProductFromCart,
    saveSnapshot,
    handleCancel,
    handleSave,
  };
}
