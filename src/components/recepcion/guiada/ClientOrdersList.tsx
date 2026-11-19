"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkerOrder } from '@/types/worker';
import { ClientOrderCard } from './ClientOrderCard';
import type { NuevaOrdenForm } from './types';

const VISIBLE = 2;

/** Pedidos anteriores del cliente (más reciente primero): muestra 2 y "Ver N más". */
export function ClientOrdersList({ orders, form }: { orders: WorkerOrder[]; form: NuevaOrdenForm }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? orders : orders.slice(0, VISIBLE);

  return (
    <section aria-labelledby="client-orders-title" className="flex flex-col gap-3">
      <h3 id="client-orders-title" className="font-bold text-neutral-black-80">Pedidos anteriores</h3>

      {form.ordersLoading ? (
        <p role="status" className="rounded-xl border border-neutral-black-20 bg-white p-4 text-sm text-neutral-black-80/70 shadow-sm">
          Cargando pedidos…
        </p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm">
          <p className="font-bold text-neutral-black-80">Sin pedidos todavía</p>
          <p className="text-sm text-neutral-black-80/70">Cuando este cliente haga su primer pedido aparecerá aquí.</p>
        </div>
      ) : (
        <>
          {shown.map((o) => <ClientOrderCard key={o.id} order={o} form={form} />)}
          {orders.length > VISIBLE && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              rightIcon={<ChevronDown className={expanded ? 'size-4 rotate-180' : 'size-4'} aria-hidden="true" />}
              className="h-11"
            >
              {expanded ? 'Ver menos' : `Ver ${orders.length - VISIBLE} más`}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
