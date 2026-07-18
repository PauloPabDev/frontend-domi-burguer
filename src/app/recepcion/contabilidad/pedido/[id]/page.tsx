"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Bike, ChefHat, Clock, CreditCard, MapPin,
  MessageSquare, Phone, User, ShoppingBag,
} from 'lucide-react';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { PAYMENT_LABELS, WorkerOrder } from '@/types/worker';
import { formatCOP } from '../../utils';

const PAYMENT_STATUS = {
  pending:  { label: 'Pago pendiente', color: 'text-orange-700', bg: 'bg-orange-100' },
  approved: { label: 'Pagado',         color: 'text-teal-700',   bg: 'bg-teal-100'   },
  rejected: { label: 'Rechazado',      color: 'text-red-700',    bg: 'bg-red-100'    },
} as const;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
      <p className="px-4 py-2.5 text-[10px] font-bold text-neutral-black-50 uppercase tracking-wider border-b border-neutral-black-10">
        {title}
      </p>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={14} className="text-neutral-black-50 shrink-0" />
      <span className="text-xs text-neutral-black-50 w-20 shrink-0">{label}</span>
      <span className="text-sm font-medium text-neutral-black-80">{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<WorkerOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`order_${id}`);
    if (!raw) return;
    try { setOrder(JSON.parse(raw)); } catch { /* ignore */ }
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-4 text-neutral-black-50">
        <ShoppingBag size={40} className="opacity-30" />
        <p className="text-sm">Pedido no encontrado.</p>
        <button
          onClick={() => router.back()}
          className="text-primary-red text-sm font-semibold hover:underline"
        >
          Volver
        </button>
      </div>
    );
  }

  const clientName  = order.client?.name ?? order.user?.name ?? 'Sin cliente';
  const clientPhone = order.client?.phone ?? order.user?.phone;
  const address     = order.deliveryAddress?.address;
  const floor       = order.deliveryAddress?.floor;
  const items       = order.orderItems ?? [];
  const paymentStatusConfig = order.payment?.status
    ? PAYMENT_STATUS[order.payment.status]
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-neutral-black-10 transition-colors text-neutral-black-50 shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="w-10 h-10 rounded-full bg-primary-red text-white text-sm font-bold flex items-center justify-center shrink-0">
          {order.dailyOrderNumber ?? '?'}
        </span>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-neutral-black-80 leading-none">
            Pedido #{order.dailyOrderNumber ?? '—'}
          </h1>
          <p className="text-xs text-neutral-black-50 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        <OrderStatusBadge status={order.status} className="text-xs shrink-0" />
      </div>

      {/* ── Cliente ────────────────────────────────────── */}
      <Card title="Cliente">
        <div className="space-y-2.5">
          <Row icon={User}  label="Nombre"    value={clientName} />
          {clientPhone && <Row icon={Phone} label="Teléfono" value={clientPhone} />}
          {address && (
            <Row
              icon={MapPin}
              label="Dirección"
              value={address + (floor ? ` — ${floor}` : '')}
            />
          )}
        </div>
      </Card>

      {/* ── Estado y pago (2 columnas) ─────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Card title="Estado del pedido">
          <OrderStatusBadge status={order.status} />
        </Card>

        <Card title="Pago">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-black-80">
              <CreditCard size={14} className="text-neutral-black-50 shrink-0" />
              {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
            </div>
            {paymentStatusConfig && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold w-fit ${paymentStatusConfig.bg} ${paymentStatusConfig.color}`}
              >
                {paymentStatusConfig.label}
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* ── Domiciliario + Cocina (2 columnas si ambos) ── */}
      {(order.courier?.name || order.kitchen?.name) && (
        <div className={`grid gap-3 ${order.courier?.name && order.kitchen?.name ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {order.courier?.name && (
            <Card title="Domiciliario">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-black-80">
                <Bike size={15} className="text-neutral-black-50 shrink-0" />
                {order.courier.name}
              </div>
            </Card>
          )}
          {order.kitchen?.name && (
            <Card title="Cocina">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-black-80">
                <ChefHat size={15} className="text-neutral-black-50 shrink-0" />
                {order.kitchen.name}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Productos ──────────────────────────────────── */}
      <Card title="Productos">
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-neutral-black-80">
                  {item.quantity ?? 1}× {item.name ?? '—'}
                </span>
                <span className="text-sm text-neutral-black-80 ml-4 shrink-0">
                  {formatCOP((item.price ?? 0) * (item.quantity ?? 1))}
                </span>
              </div>
              {(item.complements?.length ?? 0) > 0 && (
                <ul className="mt-1 pl-4 space-y-0.5">
                  {item.complements!.map((c, ci) => (
                    <li key={ci} className="flex justify-between text-xs text-neutral-black-50">
                      <span>{c.quantity ?? 1}× {c.name ?? '—'}</span>
                      {(c.price ?? 0) > 0 && (
                        <span>+{formatCOP((c.price ?? 0) * (c.quantity ?? 1))}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Totals */}
          <div className="border-t border-neutral-black-10 pt-3 space-y-1.5">
            {(order.subtotal ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-neutral-black-50">
                <span>Subtotal</span>
                <span>{formatCOP(order.subtotal)}</span>
              </div>
            )}
            {(order.deliveryPrice ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-neutral-black-50">
                <span>Domicilio</span>
                <span>{formatCOP(order.deliveryPrice)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-neutral-black-80 pt-1">
              <span>Total</span>
              <span>{formatCOP(order.totalPrice ?? 0)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Comentario ─────────────────────────────────── */}
      {order.comment && (
        <Card title="Comentario del cliente">
          <div className="flex items-start gap-2 text-sm text-neutral-black-80">
            <MessageSquare size={14} className="text-neutral-black-50 mt-0.5 shrink-0" />
            <span className="italic">{order.comment}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
