"use client";

import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShoppingBag } from 'lucide-react';

interface OrderPageShellProps {
  backHref: string;
  backLabel: string;
  loading: boolean;
  error: string | null;
  hasOrder: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}

/** Marco de las páginas de una orden: volver, recargar y los estados de carga / error / no encontrada */
export function OrderPageShell({ backHref, backLabel, loading, error, hasOrder, onRefresh, children }: OrderPageShellProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando orden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-3 pb-10">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-black-50 hover:text-primary-red transition-colors"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Recargar orden"
          className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {hasOrder ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
          <ShoppingBag size={40} className="opacity-30" />
          <p className="text-sm">{error ?? 'Orden no encontrada'}</p>
        </div>
      )}
    </div>
  );
}
