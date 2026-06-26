"use client";

import { useEffect } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { ProductCard } from "./ProductCard";
import { useProductGridModal } from "./useProductGridModal";

interface ProductGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductGridModal({ isOpen, onClose }: ProductGridModalProps) {
  const { products, getQuantityInCart, addProductToCart, removeProductFromCart, saveSnapshot, handleCancel, handleSave } =
    useProductGridModal(onClose);

  useEffect(() => {
    if (isOpen) saveSnapshot();
  }, [isOpen, saveSnapshot]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleCancel()}
      title="Agregar Productos"
      size="xl"
      hideCloseButton={true}
      footer={{
        // cancel: { label: "Cancelar", onClick: handleCancel },
        confirm: { label: "Guardar", onClick: handleSave },
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={getQuantityInCart(product.id)}
            onAddToCart={addProductToCart}
            onRemoveFromCart={removeProductFromCart}
          />
        ))}
      </div>
    </Modal>
  );
}
