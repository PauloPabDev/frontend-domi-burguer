"use client";

import { ChefHat, ChevronRight } from 'lucide-react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

interface AdminOrderRowProps {
  order: WorkerOrder;
  onOpen: (order: WorkerOrder) => void;
}

export function AdminOrderRow({ order, onOpen }: AdminOrderRowProps) {
  const paid = order.payment?.status === 'approved';
  const statusColor = STATUS_CONFIG[order.status]?.hex ?? '#e5e5e5';

  // Nota: usamos un <div> con role="button" y no un <button> real porque este
  // row contiene otros elementos interactivos (p.ej. el botón de OrderClientChip),
  // y anidar <button> dentro de <button> es HTML inválido y rompe la hidratación.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(order)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(order);
        }
      }}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-neutral-black-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4 text-left cursor-pointer"
      style={{ borderLeftColor: statusColor }}
    >
      <OrderNumberChip orderNumber={order.dailyOrderNumber} />

      <OrderClientChip
        name={order.client?.name ?? order.user?.name}
        phone={order.client?.phone ?? order.user?.phone}
        clientId={order.clientId}
        avatarSrc={order.client?.photoURL ?? order.user?.photoURL}
        isUser={!order.clientId && !!order.userId}
        origin={order.origin}
      />

      {order.kitchen?.name && (
        <span className="hidden md:flex items-center gap-1 rounded-full bg-neutral-black-5 px-2.5 py-1 shrink-0">
          <ChefHat size={11} className="text-neutral-black-40 shrink-0" />
          <span className="text-xs font-medium text-neutral-black-60 max-w-[100px] truncate">{order.kitchen.name}</span>
        </span>
      )}

      <div className="flex-1 min-w-0 hidden sm:block">
        <OrderStatusBadge status={order.status} className="text-xs px-2.5 py-1" />
      </div>

      <span
        className={cn(
          'text-sm font-bold shrink-0',
          paid ? 'text-green-600' : 'text-neutral-black-80',
        )}
      >
        {formatCOP(order.totalPrice)}
      </span>

      <span
        className={cn(
          'hidden sm:inline text-xs font-semibold rounded-full px-2 py-0.5 shrink-0',
          paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
        )}
      >
        {paid ? 'Pagado' : 'Pendiente'}
      </span>

      <OrderTimeChip time={formatTime(order.createdAt)} className="shrink-0" />

      <ChevronRight size={16} className="text-neutral-black-40 shrink-0" />
    </div>
  );
}
