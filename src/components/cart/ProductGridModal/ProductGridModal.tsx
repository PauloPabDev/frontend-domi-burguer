"use client";

import { Modal } from "@/components/ui/modal/Modal";
import { ProductCard } from "./ProductCard";
import { useProductGridModal } from "./useProductGridModal";

interface ProductGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductGridModal({ isOpen, onClose }: ProductGridModalProps) {
  const { products, getQuantityInCart, addProductToCart, removeProductFromCart } = useProductGridModal();

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Agregar Productos"
      size="xl"
      footer={{ confirm: { label: "Cerrar", onClick: onClose } }}
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
