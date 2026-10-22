"use client";

import { Check, ChefHat } from 'lucide-react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { getComplementQuantities } from '@/components/ui/OrderItemsCompactList';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { ClientAvatar } from '@/components/ui/OrderClientChips';
import { cn } from '@/lib/utils';

interface KitchenOrderCardCompactProps {
  order: WorkerOrder;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const COOK_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; variant: 'primary' | 'dark'; icon: typeof Check }>> = {
  fresh: { next: 'preparing', label: 'Preparar', variant: 'primary', icon: ChefHat },
  preparing: { next: 'ready_for_pickup', label: 'Listo', variant: 'dark', icon: Check },
};

/**
 * Vista simple de cocina (pensada para celular): en dos filas lo mínimo para
 * trabajar la orden — número · cliente · tiempo, y debajo los productos con sus
 * complementos y notas, más el comentario si lo hay — con el siguiente paso
 * siempre a la derecha, al alcance del pulgar.
 *
 * El estado se lee por el color de toda la card (fondo y borde).
 */
export const KitchenOrderCardCompact: React.FC<KitchenOrderCardCompactProps> = ({ order, onStatusChange }) => {
  const transition = COOK_TRANSITIONS[order.status];
  const statusConfig = STATUS_CONFIG[order.status];
  const clientName = order.client?.name ?? order.user?.name ?? 'Cliente';
  const avatarSrc = order.clientId ? order.client?.photoURL : order.user?.photoURL;

  return (
    <div
      className={cn('rounded-2xl border-2 shadow-sm px-3 py-2.5 flex items-center gap-3', statusConfig?.bg)}
      style={{ borderColor: statusConfig?.hex }}
    >
      <div className="flex-1 min-w-0 space-y-2">
        {/* 1. Número · cliente · tiempo transcurrido */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 min-w-8 h-8 px-1.5 flex items-center justify-center bg-primary-red rounded-full text-sm font-bold text-white">
            {order.dailyOrderNumber}
          </span>
          <ClientAvatar src={avatarSrc} name={clientName} size={24} />
          <span className="flex-1 min-w-0 truncate text-sm font-bold text-neutral-black-80">{clientName}</span>
          <OrderElapsedTime createdAt={order.createdAt} status={order.status} className="shrink-0 text-xs" />
        </div>

        {/* 2. Productos: cantidad en el color del producto + nombre, y en la misma píldora sus
            complementos con la cantidad total (por unidad × cantidad del producto) */}
        <ul className="flex flex-wrap gap-1">
          {order.orderItems.map((item, index) => (
            <li
              key={index}
              className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0 max-w-full rounded-xl bg-white/80 pl-0.5 pr-2 py-0.5"
            >
              <span className="flex items-center gap-1 min-w-0">
                <span
                  className="shrink-0 min-w-5 h-5 px-1 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
                >
                  {item.quantity}
                </span>
                <span className="truncate text-xs font-semibold text-neutral-black-80">{item.name}</span>
              </span>
              {item.complements?.map((c, i) => (
                <span key={i} className="flex items-center gap-0.5 min-w-0 pl-1.5 border-l border-neutral-black-20">
                  <span
                    className="shrink-0 min-w-4 h-4 px-0.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-60)' }}
                  >
                    {getComplementQuantities(item, c).total}
                  </span>
                  <span className="truncate text-[11px] font-medium text-neutral-black-100">{c.name}</span>
                </span>
              ))}
              {item.notes && (
                <span className="min-w-0 pl-1.5 border-l border-neutral-black-20 text-[11px] italic text-amber-700">
                  {item.notes}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* 3. Comentario de la orden: completo, suele traer instrucciones de preparación */}
        {order.comment && <OrderComment comment={order.comment} className="rounded-lg p-1.5" />}
      </div>

      {/* 4. Siguiente paso: círculo solo con ícono (el label queda como tooltip); con texto
          le quitaría a los productos el ancho que necesitan para caber en uno o dos renglones */}
      {transition && onStatusChange && (
        <OrderActionButtons
          label={transition.label}
          variant={transition.variant}
          size="md"
          icon={<transition.icon size={18} />}
          className="shrink-0"
          onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
        />
      )}
    </div>
  );
};
