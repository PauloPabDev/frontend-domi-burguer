"use client";

import { useEffect, useState } from 'react';
import { ChevronDown, PieChart } from 'lucide-react';
import { STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';

const OPEN_KEY = 'domi_status_pie_open';

/**
 * Dona flotante (abajo a la izquierda) con la distribución de órdenes por estado, usando
 * los colores de STATUS_CONFIG. Visible por defecto; se oculta a un botón chico y la
 * preferencia se guarda por navegador (compartida entre recepción y admin).
 */
export function OrderStatusPie({ orders }: { orders: { status: OrderStatus }[] }) {
  // Se lee tras montar para no romper la hidratación
  const [open, setOpen] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem(OPEN_KEY) === '0') setOpen(false);
    } catch {
      // Almacenamiento bloqueado: se queda visible
    }
  }, []);

  const toggle = () =>
    setOpen((prev) => {
      try {
        localStorage.setItem(OPEN_KEY, prev ? '0' : '1');
      } catch {
        // Sin persistencia: el cambio aplica solo a esta sesión
      }
      return !prev;
    });

  if (!open) {
    return (
      <button
        type="button"
        onClick={toggle}
        title="Mostrar resumen por estado"
        aria-label="Mostrar resumen por estado"
        className="fixed bottom-3 left-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-black-20 bg-white text-neutral-black-60 shadow-md transition-colors hover:text-neutral-black-80"
      >
        <PieChart size={16} />
      </button>
    );
  }

  const total = orders.length;
  const segments = (Object.keys(STATUS_CONFIG) as OrderStatus[])
    .map((status) => ({ status, count: orders.filter((o) => o.status === status).length }))
    .filter((s) => s.count > 0);

  let accumulated = 0;

  return (
    <div className="fixed bottom-3 left-3 z-30 flex items-center gap-2.5 rounded-2xl border border-neutral-black-20 bg-white p-2 pr-3 shadow-md">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="20" cy="20" r="15" fill="none" stroke="#e5e5e5" strokeWidth="8" />
          {segments.map(({ status, count }) => {
            const pct = (count / total) * 100;
            const offset = -accumulated;
            accumulated += pct;
            return (
              <circle
                key={status}
                cx="20"
                cy="20"
                r="15"
                fill="none"
                stroke={STATUS_CONFIG[status].hex}
                strokeWidth="8"
                pathLength={100}
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-black-80">
          {total}
        </span>
      </div>

      <ul className="space-y-0.5 text-[11px] text-neutral-black-60">
        {segments.length === 0 && <li>Sin órdenes</li>}
        {segments.map(({ status, count }) => (
          <li key={status} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_CONFIG[status].hex }} />
            <span>{STATUS_CONFIG[status].label}</span>
            <span className="ml-auto pl-2 font-bold text-neutral-black-80">{count}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={toggle}
        title="Ocultar resumen"
        aria-label="Ocultar resumen por estado"
        className="-mr-1 self-start rounded-full p-1 text-neutral-black-40 transition-colors hover:bg-neutral-black-10 hover:text-neutral-black-80"
      >
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
