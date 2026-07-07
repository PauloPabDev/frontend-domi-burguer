"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import { DeliveryInfo } from '@/services/workerOrderService';

const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`;

interface ResumenPedidoProps {
  orderItems: OrderItem[];
  subtotal: number;
  total: number;
  delivery: DeliveryInfo | null;
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const additions = item.complements.filter((c) => !c.minusComplement && c.name);
  const removals = item.complements.filter((c) => c.minusComplement && c.name);

  return (
    <div className="flex gap-3 py-2 border-b border-neutral-black-10 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-neutral-black-80">{item.product.name}</span>
          {item.quantity > 1 && (
            <span className="text-xs text-neutral-black-40">×{item.quantity}</span>
          )}
        </div>
        {item.quantity > 1 && (
          <p className="text-xs text-neutral-black-40">{fmt(item.product.price)} c/u</p>
        )}
        {additions.length > 0 && (
          <p className="text-xs text-green-600 mt-0.5">
            + {additions.map((c) => c.name).join(', ')}
          </p>
        )}
        {removals.length > 0 && (
          <p className="text-xs text-neutral-black-40 line-through mt-0.5">
            {removals.map((c) => c.name).join(', ')}
          </p>
        )}
      </div>
      <span className="text-sm font-semibold text-neutral-black-80 shrink-0">
        {fmt(item.product.price * item.quantity)}
      </span>
    </div>
  );
}

export function ResumenPedido({ orderItems, subtotal, total, delivery }: ResumenPedidoProps) {
  const [expanded, setExpanded] = useState(true);
  const totalUnidades = orderItems.reduce((s, i) => s + i.quantity, 0);

  if (orderItems.length === 0) return null;

  return (
    <section className="rounded-xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-black-5 transition-colors"
      >
        <h3 className="font-bold text-sm text-neutral-black-80">Resumen del pedido</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary-red">{fmt(total)}</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-neutral-black-40" />
            : <ChevronDown className="w-4 h-4 text-neutral-black-40" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-neutral-black-10">
          <div className="flex flex-col gap-2 pt-3">
            {orderItems.map((item) => (
              <OrderItemRow key={item.itemId} item={item} />
            ))}
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between text-sm text-neutral-black-60">
              <span>Subtotal ({totalUnidades} {totalUnidades === 1 ? 'producto' : 'productos'})</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {delivery && (
              <div className="flex justify-between text-sm text-neutral-black-60">
                <span className="flex items-center gap-1.5">
                  Domicilio
                  {delivery.distance > 0 && (
                    <span className="text-neutral-black-40 text-xs">
                      {(delivery.distance / 1000).toFixed(1)} km
                      {delivery.duration ? ` · ~${Math.round(delivery.duration / 60)} min` : ''}
                    </span>
                  )}
                </span>
                <span>{fmt(delivery.price)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-neutral-black-80 pt-2 border-t border-neutral-black-20">
              <span>Total</span>
              <span className="text-primary-red">{fmt(total)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
