"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { Product } from "@/types/products";
import { showFoodToast } from "@/components/toastFood";

interface ProductThumbnailProps {
  product: Product;
  isActive: boolean;
  onSelect: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductThumbnail({ product, isActive, onSelect, onAddToCart }: ProductThumbnailProps) {
  return (
    <div
      className={`relative w-full max-w-[280px] aspect-square mx-auto cursor-pointer rounded-2xl ${isActive ? "bg-accent-yellow-40" : "bg-accent-yellow-20"}`}
      onClick={onSelect}
    >
      <ProductImage
        src={product.image1}
        alt={product.name}
        className="absolute inset-3 rounded-xl bg-transparent"
        sizes="(max-width: 1023px) 45vw, 280px"
      />
      {product.isNew && !product.soldOut && (
        <span className="absolute z-10 top-2 left-2 rounded-full bg-primary-red px-2.5 py-0.5 text-[10px] lg:text-xs font-bold text-white">
          NUEVO
        </span>
      )}
      {product.soldOut && (
        <span className="absolute z-10 bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-neutral-black-80 px-3 py-1 text-xs font-bold text-white">
          AGOTADO
        </span>
      )}
      <Button
        variant="primary"
        size="icon-sm"
        className={`absolute z-10 top-1.5 right-1.5 lg:w-10 lg:h-10 ${isActive || product.soldOut ? "hidden" : ""}`}
        disabled={product.soldOut}
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
          showFoodToast(product);
        }}
      >
        <Plus className="text-white" />
      </Button>
    </div>
  );
}
