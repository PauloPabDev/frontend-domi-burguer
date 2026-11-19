"use client";

import Image from 'next/image';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/products';
import { fmt } from './utils';

interface ProductRowProps {
  product: Product;
  inOrder: number;
  onAdd: (product: Product) => void;
  /** Agrega la línea y abre su personalizador. */
  onAddCustom: (product: Product) => void;
}

export function ProductRow({ product, inOrder, onAdd, onAddCustom }: ProductRowProps) {
  const soldOut = product.soldOut;
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border-[1.5px] bg-white p-2.5',
        inOrder > 0 ? 'border-primary-red-100 bg-primary-red/5' : 'border-neutral-black-20',
      )}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-black-3">
        <Image src={product.image1} alt="" fill sizes="48px" className="object-contain p-0.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight text-neutral-black-80">{product.name}</p>
        <p className="text-sm font-bold text-neutral-black-80">{fmt(product.price)}</p>
        {soldOut ? (
          <p className="text-xs font-semibold text-primary-red-100">Agotado</p>
        ) : inOrder > 0 ? (
          <p className="text-xs font-semibold text-primary-red-100">{inOrder} en el pedido</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        {product.allowCustomization && (
          <Button
            type="button"
            variant="light-outline"
            disabled={soldOut}
            onClick={() => onAddCustom(product)}
            aria-label={`Agregar ${product.name} con adiciones`}
            className="h-11 w-11 p-0 sm:w-auto sm:px-4"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Con adiciones</span>
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          disabled={soldOut}
          onClick={() => onAdd(product)}
          aria-label={`Agregar ${product.name}`}
          className="h-11 w-11 p-0"
        >
          <Plus className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
