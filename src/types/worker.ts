import { DeliveryAddress, OrderItem, OrderStatus, PaymentMethod, Payment } from './orders';

export interface WorkerOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  dailyOrderNumber: number;
  totalPrice: number;
  deliveryPrice: number;
  subtotal: number;
  locationId?: string;
  clientId?: string;
  courierId?: string;
  kitchenId?: string;
  client?: {
    name: string;
    phone: string;
    email?: string;
  };
  courier?: {
    id: string;
    name: string;
    photoURL?: string;
  };
  kitchen?: {
    id: string;
    name: string;
  };
  distance?: number;
  orderItems: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  paymentMethod: PaymentMethod;
  payment: Payment;
  comment?: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  dotColor: string;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  fresh: { label: 'Nuevo', color: 'text-sky-700', bg: 'bg-sky-100', dotColor: 'bg-sky-400' },
  preparing: { label: 'Preparando', color: 'text-violet-700', bg: 'bg-violet-100', dotColor: 'bg-violet-500' },
  ready_for_pickup: { label: 'Listo', color: 'text-pink-700', bg: 'bg-pink-100', dotColor: 'bg-pink-400' },
  dispatched: { label: 'Despachado', color: 'text-orange-700', bg: 'bg-orange-100', dotColor: 'bg-orange-500' },
  delivered: { label: 'Entregado', color: 'text-teal-700', bg: 'bg-teal-100', dotColor: 'bg-teal-500' },
  pending_payment: { label: 'Pago pendiente', color: 'text-red-800', bg: 'bg-red-100', dotColor: 'bg-red-700' },
  cancelled: { label: 'Cancelado', color: 'text-neutral-500', bg: 'bg-neutral-100', dotColor: 'bg-neutral-400' },
};

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  bancolombia: 'Bancolombia',
  nequi: 'Nequi',
};

export interface WorkerKitchen {
  id: string;
  name: string;
  location?: string;
}

export interface WorkerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  roles: string[];
  assignedKitchens?: string[];
  points?: number;
}
