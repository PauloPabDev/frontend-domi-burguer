"use client";

import { useState } from 'react';
import { Camera, ChevronDown, MapPin, MessageCircle, Navigation, Phone, ShoppingBag } from 'lucide-react';
import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { PAYMENT_LABELS, STATUS_CONFIG } from '@/types/worker';
import { OrderNumberChip } from '@/components/ui/OrderClientChips';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { OrderItemsCompactList, OrderPriceBreakdown } from '@/components/ui/OrderItemsCompactList';
import { getCashChange } from '@/components/ui/OrderPaymentRow';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { NotesPanel } from '@/components/notes/NotesPanel';
import { getNavigationUrl } from '@/components/courier/CourierOrderCard';
import { cn } from '@/lib/utils';

// Etiquetas más claras para el domiciliario que las del tablero de recepción
export const FOCUS_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  ready_for_pickup: 'Listo en cocina',
  dispatched: 'En camino',
};

// wa.me pide el número con indicativo de país; los celulares colombianos son de 10 dígitos
function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits.length === 10 ? `57${digits}` : digits}`;
}

const CONTACT_BTN = 'flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[13px] font-bold';

function Section({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-neutral-black-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[52px] w-full items-center gap-2.5 text-left text-[15px] font-bold text-neutral-black-80"
      >
        {icon}
        {title}
        {hint && <span className="ml-auto text-[13px] font-semibold text-neutral-black-50">{hint}</span>}
        <ChevronDown size={18} className={cn('shrink-0 transition-transform', !hint && 'ml-auto', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

interface CourierFocusCardProps {
  order: CourierOrder;
  /** Estado a mostrar (puede ir adelantado al del servidor mientras se confirma el cambio) */
  status: OrderStatus;
}

export function CourierFocusCard({ order, status }: CourierFocusCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const phone = order.client?.phone ?? order.user?.phone;
  const name = order.client?.name ?? order.user?.name;
  const address = order.location?.address ?? order.deliveryAddress?.address;
  const floor = order.location?.floor ?? order.deliveryAddress?.floor;
  const km = order.delivery?.distance > 0 ? (order.delivery.distance / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 }) : null;
  const navigationUrl = getNavigationUrl(order);
  const paid = order.payment?.status === 'approved';
  const cash = order.paymentMethod === 'cash' && !paid;
  const cashChange = cash && order.totalPrice > 0 ? getCashChange(order.totalPrice) : null;
  const payLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const indications = [order.location?.comment, order.comment].filter(Boolean) as string[];
  const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const locationId = order.location?.id ?? order.locationId;
  const clientNotes = order.clientId
    ? { type: 'client' as const, id: order.clientId }
    : order.userId ? { type: 'user' as const, id: order.userId } : undefined;

  return (
    <article className="pb-2">
      <div className="mb-3 flex items-center gap-2">
        <OrderNumberChip orderNumber={order.dailyOrderNumber} order={order} className="min-w-9 h-9 px-2 py-0 justify-center" />
        {statusConfig && (
          <span className={cn('inline-flex h-[30px] items-center rounded-full px-3 text-[13px] font-bold', statusConfig.bg, statusConfig.color)}>
            {FOCUS_STATUS_LABEL[status] ?? statusConfig.label}
          </span>
        )}
        <OrderElapsedTime createdAt={order.createdAt} status={status} className="ml-auto text-sm [&_svg]:size-4" />
      </div>

      <h2 className="text-2xl font-extrabold leading-tight text-neutral-black-80 text-balance">{address ?? 'Sin dirección'}</h2>
      {floor && <p className="mt-1 text-base font-semibold text-neutral-black-80">{floor}</p>}
      {km && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-black-50">
          <MapPin size={16} />
          {km} km
        </p>
      )}

      {/* Cobro: la cifra que más importa en la puerta */}
      <div className={cn('mt-3.5 flex items-center justify-between gap-3 rounded-2xl border-2 px-3.5 py-3', cash ? 'border-amber-400 bg-amber-50' : 'border-neutral-black-10')}>
        <div>
          <p className="text-[13px] font-bold text-neutral-black-50">
            {paid ? `Pagado con ${payLabel}` : cash ? 'Cobrar en efectivo' : `${payLabel} sin confirmar`}
          </p>
          <p className="text-3xl font-extrabold tabular-nums leading-tight text-neutral-black-80">{formatCOP(order.totalPrice)}</p>
        </div>
        {cashChange ? (
          <div className="flex flex-col gap-0.5 text-right text-[13px] font-semibold text-neutral-black-50 tabular-nums">
            <span>Trae {formatCOP(cashChange.bill)}</span>
            <span className="text-base font-extrabold text-amber-800">Devolver {formatCOP(cashChange.change)}</span>
          </div>
        ) : paid ? (
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-sm font-extrabold text-green-800">No cobrar</span>
        ) : null}
      </div>

      {indications.length > 0 && (
        <div className="mt-3 rounded-2xl border border-yellow-300 bg-yellow-50 px-3.5 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-yellow-900">Indicaciones del cliente</p>
          {indications.map((text) => (
            <p key={text} className="mt-0.5 text-base font-semibold leading-snug text-yellow-950">{text}</p>
          ))}
        </div>
      )}

      <div className="mt-3.5">
        {name && <p className="text-[17px] font-extrabold text-neutral-black-80">{name}</p>}
        {phone && <p className="text-base font-semibold tabular-nums text-neutral-black-50">{phone}</p>}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {phone ? (
            <a href={`tel:${phone}`} className={cn(CONTACT_BTN, 'bg-green-100 text-green-900')}>
              <Phone size={22} />
              Llamar
            </a>
          ) : <span />}
          {phone ? (
            <a href={whatsappUrl(phone)} target="_blank" rel="noopener noreferrer" className={cn(CONTACT_BTN, 'bg-emerald-100 text-emerald-900')}>
              <MessageCircle size={22} />
              WhatsApp
            </a>
          ) : <span />}
          {navigationUrl ? (
            <a href={navigationUrl} target="_blank" rel="noopener noreferrer" className={cn(CONTACT_BTN, 'bg-blue-100 text-blue-900')}>
              <Navigation size={22} />
              Cómo llegar
            </a>
          ) : <span />}
        </div>
      </div>

      <div className="mt-2.5">
        <Section icon={<ShoppingBag size={20} />} title="Pedido" hint={`${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}>
          <OrderItemsCompactList items={order.orderItems} size="lg" />
          <div className="mt-3 border-t border-dashed border-neutral-black-10 pt-2 text-sm">
            <OrderPriceBreakdown items={order.orderItems} deliveryPrice={order.deliveryPrice} />
          </div>
        </Section>
        {(locationId || clientNotes) && (
          <Section icon={<Camera size={20} />} title="Fotos y notas">
            <div className="space-y-4">
              {locationId && <NotesPanel targetType="location" targetId={locationId} title="Notas del lugar" />}
              {clientNotes && <NotesPanel targetType={clientNotes.type} targetId={clientNotes.id} title="Notas del cliente" />}
            </div>
          </Section>
        )}
      </div>
    </article>
  );
}
