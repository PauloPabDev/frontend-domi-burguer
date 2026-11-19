"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Minus, Plus, Search } from 'lucide-react';
import { cn, normalize } from '@/lib/utils';
import type { OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import type { Complement } from '@/types/products';
import { fmt } from './utils';
import type { NuevaOrdenForm } from './types';

const MAX_RESULTS = 12;
const MAX_HABITUAL = 6;

const chipBase =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100/50';

/** Adiciones que este cliente ha pedido antes, de la más a la menos frecuente (solo las que siguen en el catálogo). */
function useHabitual(form: NuevaOrdenForm): Complement[] {
  const { orders, allComplements } = form;
  return useMemo(() => {
    const counts = new Map<string, number>();
    orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'deleted')
      .forEach((o) =>
        o.orderItems.forEach((oi) =>
          oi.complements?.forEach((c) => counts.set(String(c.id), (counts.get(String(c.id)) ?? 0) + 1)),
        ),
      );
    return allComplements
      .filter((c) => counts.has(String(c.id)))
      .sort((a, b) => (counts.get(String(b.id)) ?? 0) - (counts.get(String(a.id)) ?? 0))
      .slice(0, MAX_HABITUAL);
  }, [orders, allComplements]);
}

function AddChip({ complement, onAdd }: { complement: Complement; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Agregar ${complement.name}${complement.price ? `, ${fmt(complement.price)}` : ''}`}
      className={cn(chipBase, 'border-neutral-black-20 bg-white text-neutral-black-80 hover:border-neutral-black-80')}
    >
      <Plus className="size-4" aria-hidden="true" />
      {complement.name}
      {complement.price ? <span className="text-xs font-bold text-neutral-black-80/70">{fmt(complement.price)}</span> : null}
    </button>
  );
}

/** Adiciones de una línea como chips, sin modal: elegidas (con − / +), las que suele pedir el cliente y buscador. */
export function ComplementChips({ item, form }: { item: OrderItem; form: NuevaOrdenForm }) {
  const { allComplements, complementsLoading, updateItemComplements } = form;
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const habitual = useHabitual(form);

  // Al abrirse bajo una línea que puede quedar fuera de pantalla (móvil), la trae a la vista.
  useEffect(() => {
    rootRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  const selectedIds = new Set(item.complements.map((c) => String(c.id)));
  const change = (complement: Complement, delta: 1 | -1) => {
    const existing = item.complements.find((c) => c.id === complement.id);
    const quantity = (existing?.quantity ?? 0) + delta;
    let next: Complement[];
    if (quantity <= 0) next = item.complements.filter((c) => c.id !== complement.id);
    else if (existing) next = item.complements.map((c) => (c.id === complement.id ? { ...c, quantity } : c));
    else next = [...item.complements, { ...complement, quantity, minusComplement: false }];
    updateItemComplements(item.itemId, next);
  };

  const term = normalize(search.trim());
  const matches = allComplements.filter(
    (c) => !selectedIds.has(String(c.id)) && (!term || normalize(c.name).includes(term)),
  );
  const habitualFree = habitual.filter((c) => !selectedIds.has(String(c.id)));
  const searchId = `adiciones-${item.itemId}`;

  return (
    <div ref={rootRef} className="grid gap-4 border-t border-neutral-black-10 pt-3">
      {item.complements.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-black-80/70">En esta línea</h4>
          <ul className="flex flex-wrap gap-2">
            {item.complements.map((c) => (
              <li
                key={c.id}
                className="inline-flex min-h-11 items-center gap-1 rounded-full border-[1.5px] border-neutral-black-80 bg-neutral-black-80 pl-4 pr-1 text-sm font-semibold text-white"
              >
                <Check className="size-4" aria-hidden="true" />
                <span>
                  {c.minusComplement ? `Sin ${c.name}` : c.name}
                  {!c.minusComplement && c.price ? <span className="ml-1 text-xs opacity-85">{fmt(c.price)}</span> : null}
                </span>
                <button
                  type="button"
                  onClick={() => change(c, -1)}
                  aria-label={`Quitar una unidad de ${c.name}`}
                  className="grid size-9 place-items-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <output aria-label={`Cantidad de ${c.name}`} className="min-w-4 text-center tabular-nums">{c.quantity}</output>
                <button
                  type="button"
                  onClick={() => change(c, 1)}
                  aria-label={`Agregar una unidad más de ${c.name}`}
                  className="grid size-9 place-items-center rounded-full hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {habitualFree.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-black-80/70">Las que suele pedir este cliente</h4>
          <div className="flex flex-wrap gap-2">
            {habitualFree.map((c) => (
              <AddChip key={c.id} complement={c} onAdd={() => change(c, 1)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor={searchId} className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-black-80/70">
          Buscar adición
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-black-80/70" aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar adición…"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-neutral-black-20 bg-white pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100/50"
          />
        </div>
        <div className="mt-3" aria-live="polite">
          {complementsLoading ? (
            <p className="text-sm text-neutral-black-80/70">Cargando adiciones…</p>
          ) : allComplements.length === 0 ? (
            <p className="text-sm text-neutral-black-80/70">No hay adiciones disponibles.</p>
          ) : matches.length === 0 ? (
            <p className="text-sm text-neutral-black-80/70">
              {term ? `No hay adiciones para “${search.trim()}”.` : 'Ya agregaste todas las adiciones.'}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {matches.slice(0, MAX_RESULTS).map((c) => (
                  <AddChip key={c.id} complement={c} onAdd={() => change(c, 1)} />
                ))}
              </div>
              {matches.length > MAX_RESULTS && (
                <p className="mt-2 text-xs text-neutral-black-80/70">
                  Mostrando {MAX_RESULTS} de {matches.length}. Escribe para filtrar.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
