import { PaymentMethod, PaymentStatus } from './orders';

/** Qué parte del pago se cambia (mismos valores que PAYMENT_CHANGE_TYPES del backend) */
export type PaymentChangeType = 'paymentMethod' | 'paymentStatus';

export type PaymentChange =
  | { type: 'paymentMethod'; value: PaymentMethod }
  | { type: 'paymentStatus'; value: PaymentStatus };

/** Lo que recepción envía al pedir un cambio */
export type PaymentChangeRequestInput = PaymentChange & { reason: string };

export type PaymentChangeResolution = 'approve' | 'reject';

/** Solicitud pendiente tal como le llega a los admins */
export interface PaymentChangeRequest {
  id: string;
  orderId: string;
  dailyOrderNumber: number;
  kitchenId: string | null;
  type: PaymentChangeType;
  from: string;
  to: string;
  reason: string;
  requestedBy: { id: string; name: string };
  createdAt: string;
  /** true cuando llega al conectarse (ya estaba pendiente), no como aviso nuevo */
  replay?: boolean;
}

export interface PaymentChangeRequestResult extends Omit<PaymentChangeRequest, 'replay'> {
  requestId: string;
  resolution: PaymentChangeResolution;
  resolvedBy: { id: string; name: string };
  resolvedAt: string;
}

/** Evento `message` del socket (clase Message del backend) */
export interface SocketMessage<T = unknown> {
  type: string;
  message: string;
  status: string;
  date: string;
  data: T;
}

/** Respuesta (ack) de los eventos de solicitudes de cambio de pago */
export type SocketAck<T> = { ok: true; data: T } | { ok: false; error: string };
