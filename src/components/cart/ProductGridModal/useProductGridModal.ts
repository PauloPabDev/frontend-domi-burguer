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
      const cartItem = items.find((item) => item.productId === productId && item.complements.length === 0);
      return cartItem?.quantity || 0;
    },
    [items]
  );

  const addProductToCart = useCallback(
    (product: Product) => {
      // Producto agotado: no se puede agregar al carrito
      if (product.soldOut) return;

      const existingItem = items.find(
        (item) => item.productId === product.id && item.complements.length === 0
      );

      if (existingItem) {
        updateCartQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        const productToAdd: Product = {
          ...product,
          quantity: 1,
          complements: [],
        };
        const uniqueId = generateCartItemId(productToAdd.id, productToAdd.complements);
        const totalPrice = calculateTotalPrice(productToAdd.basePrice, productToAdd.complements);

        addItem({
          id: uniqueId,
          productId: productToAdd.id,
          name: productToAdd.name,
          price: totalPrice,
          basePrice: productToAdd.basePrice,
          quantity: 1,
          image1: productToAdd.image1,
          image2: productToAdd.image2 || null,
          complements: [],
          allowCustomization: productToAdd.allowCustomization,
          customizationType: productToAdd.customizationType,
        });
      }
    },
    [items, addItem, updateCartQuantity]
  );

  const removeProductFromCart = useCallback(
    (productId: number) => {
      const existingItem = items.find(
        (item) => item.productId === productId && item.complements.length === 0
      );

      if (existingItem && existingItem.quantity > 1) {
        updateCartQuantity(existingItem.id, existingItem.quantity - 1);
      } else if (existingItem) {
        updateCartQuantity(existingItem.id, 0);
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
