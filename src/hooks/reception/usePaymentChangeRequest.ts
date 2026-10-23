"use client";

import { useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { PaymentChangeRequestInput } from '@/types/paymentChangeRequest';
import { notify } from '@/utils/notify';

/**
 * Envía por socket la solicitud de cambio de pago de recepción a los admins.
 * Avisa si quedó en cola porque no hay admins conectados. Los errores se
 * relanzan sin toast: el modal de la solicitud los muestra en línea.
 */
export function usePaymentChangeRequest() {
  const { requestPaymentChange } = useSocket();

  return useCallback(
    async (orderId: string, input: PaymentChangeRequestInput) => {
      const { adminsOnline } = await requestPaymentChange(orderId, input);
      if (adminsOnline > 0) {
        notify.success('Solicitud enviada', 'Un administrador la revisará en un momento.');
      } else {
        notify.info('Solicitud en espera', 'No hay administradores conectados; la verán apenas entren.');
      }
    },
    [requestPaymentChange]
  );
}
