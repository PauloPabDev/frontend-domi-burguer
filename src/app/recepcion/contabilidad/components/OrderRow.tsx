"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Bike, MapPin, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { formatTime } from '@/lib/dates';
import { OrderItem } from '@/types/orders';
import { OrderNumberChip, OrderClientChip } from '@/components/ui/OrderClientChips';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';
import bancolombiaLogo from "@/media/img/bancolombia.png";
import nequiLogo from "@/media/img/nequi.png";
import efectivoLogo from "@/media/img/efectivo.jpeg";
import type { StaticImageData } from 'next/image';

// ─── ProductSummaryBadges ─────────────────────────────────────────────────────

function ProductSummaryBadges({ items }: { items: OrderItem[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map((item, i) => {
        const hasComplements = item.complements && item.complements.length > 0;
        const color = item.colorPrimary ?? '#e53935';
        return (
          <div
            key={i}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: color }}
          >
            <span>{item.quantity}</span>
            {hasComplements && (
              <AlertCircle size={10} className="opacity-90 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PaymentCell ──────────────────────────────────────────────────────────────

const PAYMENT_LOGOS: Record<string, { src: StaticImageData; alt: string }> = {
  cash: { src: efectivoLogo, alt: 'Efectivo' },
  bancolombia: { src: bancolombiaLogo, alt: 'Bancolombia' },
  nequi: { src: nequiLogo, alt: 'Nequi' },
};

function PaymentCell({
  paymentMethod,
  paid,
  total,
}: {
  paymentMethod: string;
  paid: boolean;
  total: number;
}) {
  const logo = PAYMENT_LOGOS[paymentMethod];
  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className={cn('text-sm font-bold', paid ? 'text-green-600' : 'text-neutral-black-80')}>
        {formatCOP(total)}
      </span>
      <span
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
          paid
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700',
        )}
      >
        {logo ? (
          <Image src={logo.src} alt={logo.alt} width={12} height={12} className="object-contain rounded-sm shrink-0" />
        ) : (
          <CreditCard size={10} className="shrink-0" />
        )}
        {paid ? 'Pagado' : 'Pendiente'}
      </span>
    </div>
  );
}

// ─── CourierChip ──────────────────────────────────────────────────────────────

function CourierChip({ courier }: { courier?: WorkerOrder['courier'] }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-neutral-black-5 px-2.5 py-1 shrink-0">
      {courier?.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={courier.photoURL}
          alt={courier.name}
          className="w-4 h-4 rounded-full object-cover shrink-0"
        />
      ) : courier?.name ? (
        <span className="w-4 h-4 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-[9px] font-bold shrink-0">
          {courier.name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <Bike size={11} className="text-neutral-black-40 shrink-0" />
      )}
      <span className="text-xs font-medium text-neutral-black-60 max-w-[60px] truncate">
        {courier?.name ?? 'Sin moto'}
      </span>
    </div>
  );
}

// ─── AddressCell ──────────────────────────────────────────────────────────────

function AddressCell({ order }: { order: WorkerOrder }) {
  const address = order.location?.address ?? order.deliveryAddress?.address;
  if (!address) return <span className="text-xs text-neutral-black-30">—</span>;
  return (
    <div className="flex items-center gap-1 min-w-0">
      <MapPin size={11} className="text-neutral-black-40 shrink-0" />
      <span className="text-xs text-neutral-black-60 truncate max-w-[120px]">{address}</span>
    </div>
  );
}

// ─── OrderRow ─────────────────────────────────────────────────────────────────

export function OrderRow({ order }: { order: WorkerOrder }) {
  const paid = order.payment?.status === 'approved';
  const statusColor = STATUS_CONFIG[order.status]?.hex ?? '#e5e5e5';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-black-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: statusColor }}
    >

      {/* Número de orden */}
      <OrderNumberChip orderNumber={order.dailyOrderNumber} />

      {/* Cliente */}
      <OrderClientChip
        name={order.client?.name ?? order.user?.name}
        phone={order.client?.phone ?? order.user?.phone}
        clientId={order.clientId}
        avatarSrc={order.client?.photoURL ?? order.user?.photoURL}
        isUser={!order.clientId && !!order.userId}
        origin={order.origin}
      />

      {/* Domiciliario */}
      <CourierChip courier={order.courier} />

      {/* Productos resumidos */}
      <div className="flex-1 min-w-0">
        <ProductSummaryBadges items={order.orderItems} />
      </div>

      {/* Pago */}
      <PaymentCell
        paymentMethod={order.paymentMethod}
        paid={paid}
        total={order.totalPrice}
      />

      {/* Hora de creación */}
      <span className="text-xs font-semibold text-neutral-black-40 shrink-0">
        {formatTime(order.createdAt)}
      </span>

      {/* Dirección abreviada */}
      <AddressCell order={order} />

      {/* Ver más */}
      <Link
        href={`/orders/${order.id}`}
        className="flex items-center gap-1 shrink-0 rounded-xl bg-neutral-black-5 hover:bg-neutral-black-10 px-3 py-1.5 text-xs font-semibold text-neutral-black-60 transition-colors"
      >
        Ver más
        <ChevronRight size={13} />
      </Link>
    </div>
  );
}
