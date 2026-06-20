"use client";

import React from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: number) => void;
}

export function ProductCard({
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart,
}: ProductCardProps) {
  const handleAdd = () => {
    onAddToCart(product);
  };

  const handleRemove = () => {
    onRemoveFromCart(product.id);
  };

  return (
    <div className="w-full bg-accent-yellow-20 rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-square w-full">
        <Image
          src={product.image1}
          alt={product.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
        />
      </div>

      <div className="p-3 bg-white flex flex-col gap-2">
        <h4 className="font-bold text-sm truncate">{product.name}</h4>
        <p className="text-sm text-neutral-black-60">
          ${product.basePrice.toLocaleString("es-CO")}
        </p>

        <div className="flex items-center justify-center gap-2 mt-1">
          {quantity === 0 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAdd}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              AGREGAR
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-3 w-full">
              <Button
                type="button"
                variant="yellow"
                size="icon-sm"
                onClick={handleRemove}
                className="w-8 h-8 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span
                className={cn(
                  "font-bold text-neutrosblack-80 text-sm min-w-[24px] text-center"
                )}
              >
                {String(quantity).padStart(2, "0")}
              </span>
              <Button
                type="button"
                variant="yellow"
                size="icon-sm"
                onClick={handleAdd}
                className="w-8 h-8 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
