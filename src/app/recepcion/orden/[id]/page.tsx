"use client";

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkerOrder } from '@/hooks/reception/useWorkerOrder';
import { useOrderActions } from '@/hooks/reception/useOrderActions';
import { usePaymentChangeRequest } from '@/hooks/reception/usePaymentChangeRequest';
import { OrderPageShell } from '@/components/recepcion/OrderPageShell';
import { RecepcionOrderCard } from '@/components/recepcion/RecepcionOrderCard';

export default function RecepcionOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const { kitchens } = useKitchenSelector();
  const { order, loading, error, refresh } = useWorkerOrder(id, kitchens);
  const actions = useOrderActions(refresh);
  const requestPaymentChange = usePaymentChangeRequest();
  const isAdmin = userProfile?.roles?.includes('admin') ?? false;

  return (
    <OrderPageShell
      backHref="/recepcion"
      backLabel="Volver a recepción"
      loading={loading}
      error={error}
      hasOrder={!!order}
      onRefresh={refresh}
    >
      {order && (
        <RecepcionOrderCard
          order={order}
          kitchens={kitchens}
          onStatusChange={actions.onStatusChange}
          onAssignCourier={actions.onAssignCourier}
          onAssignKitchen={actions.onAssignKitchen}
          onDelete={async (orderId) => {
            await actions.onDelete(orderId);
            router.replace('/recepcion');
          }}
          onPaymentMethodChange={actions.onPaymentMethodChange}
          onMarkPaid={actions.onMarkPaid}
          {...(isAdmin
            ? { onAdminPaymentChange: actions.onAdminPaymentChange }
            : { onRequestPaymentChange: requestPaymentChange })}
        />
      )}
    </OrderPageShell>
  );
}
