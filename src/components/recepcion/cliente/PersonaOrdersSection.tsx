"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, ShoppingBag } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { PersonaOrderRow } from './PersonaOrderRow';

interface PersonaOrdersSectionProps {
  orders: WorkerOrder[];
  loading: boolean;
}

export function PersonaOrdersSection({ orders, loading }: PersonaOrdersSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-sm text-neutral-black-80">Pedidos</h3>
          {orders.length > 0 && (
            <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
              {orders.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-black-50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-black-50" />
        )}
      </button>

      {expanded && (
        loading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-black-50 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-neutral-black-40 border border-dashed border-neutral-black-20 rounded-xl">
            <ShoppingBag className="w-6 h-6 opacity-40" />
            <p className="text-xs">Sin pedidos registrados</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {orders.map((order) => (
              <PersonaOrderRow key={order.id} order={order} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
