"use client";

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useWorkerOrder } from '@/hooks/reception/useWorkerOrder';
import { useOrderActions } from '@/hooks/reception/useOrderActions';
import { OrderPageShell } from '@/components/recepcion/OrderPageShell';
import { AdminOrderPanel } from '@/components/admin/AdminOrderPanel';
import { CourierPanelProvider } from '@/contexts/CourierPanelContext';
import { formatDateTime } from '@/lib/dates';

export default function AdminOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { kitchens } = useKitchenSelector();
  const { order, loading, error, refresh } = useWorkerOrder(id, kitchens);
  const actions = useOrderActions(refresh);

  return (
    <CourierPanelProvider>
      <OrderPageShell
        backHref="/admin/ordenes"
        backLabel="Volver a órdenes"
        loading={loading}
        error={error}
        hasOrder={!!order}
        onRefresh={refresh}
      >
        {order && (
          <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3">
              <ShieldCheck size={16} className="text-primary-red shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wide">
                  Pedido · {formatDateTime(order.createdAt)}
                </p>
                <p className="text-2xl font-bold text-neutral-black-80 leading-none">#{order.dailyOrderNumber}</p>
              </div>
            </div>
            <AdminOrderPanel
              order={order}
              kitchens={kitchens}
              onClose={() => router.replace('/admin/ordenes')}
              {...actions}
            />
          </div>
        )}
      </OrderPageShell>
    </CourierPanelProvider>
  );
}
