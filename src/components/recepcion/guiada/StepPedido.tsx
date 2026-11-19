"use client";

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types/products';
import { OrderLines } from './OrderLines';
import { ProductRow } from './ProductRow';
import { RepeatLastOrder } from './RepeatLastOrder';
import type { StepProps } from './types';
import { countUnits } from './utils';

const card = 'rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm';

export function StepPedido({ form }: StepProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  // addProduct no devuelve la línea: guardamos los ids previos y abrimos la que aparezca nueva.
  const knownIdsRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    const known = knownIdsRef.current;
    const added = known && form.orderItems.find((i) => !known.has(i.itemId));
    if (!added) return;
    knownIdsRef.current = null;
    setOpenId(added.itemId);
  }, [form.orderItems]);

  const addCustom = (product: Product) => {
    knownIdsRef.current = new Set(form.orderItems.map((i) => i.itemId));
    form.addProduct(product);
  };

  const inOrder = (productId: number) =>
    form.orderItems.filter((i) => i.product.id === productId).reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="grid gap-4">
      <RepeatLastOrder form={form} />

      <section aria-labelledby="menu-titulo" className={card}>
        <h3 id="menu-titulo" className="mb-3 text-sm font-bold text-neutral-black-80">Menú</h3>
        <div className="grid gap-2">
          {form.allProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              inOrder={inOrder(product.id)}
              onAdd={form.addProduct}
              onAddCustom={addCustom}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="pedido-titulo" className={card}>
        <h3 id="pedido-titulo" className="mb-3 flex items-center justify-between text-sm font-bold text-neutral-black-80">
          Tu pedido
          <span className="rounded-full bg-neutral-black-10 px-2.5 py-0.5 text-xs">{countUnits(form.orderItems)}</span>
        </h3>
        <OrderLines
          form={form}
          openId={openId}
          onToggle={(id) => setOpenId((cur) => (cur === id ? null : id))}
        />
      </section>
    </div>
  );
}
