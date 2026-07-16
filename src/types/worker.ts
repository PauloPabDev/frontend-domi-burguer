import { DeliveryAddress, OrderItem, OrderStatus, PaymentMethod, Payment } from './orders';

import { Location } from './locations';

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
  userId?: string;
  courierId?: string;
  assignedCourierUserId?: string;
  kitchenId?: string;
  delivery: {
    price: number;
    duration: number;
    distance: number;
  };
  client?: {
    name: string;
    phone: string;
    email?: string;
    photoURL?: string;
  };
  user?: {
    name: string;
    phone?: string;
    email?: string;
    photoURL?: string;
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
  payment?: Payment;
  comment?: string;
  location?: Location;
}

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  dotColor: string;
  hex: string;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  fresh: { label: 'Nuevo', color: 'text-sky-700', bg: 'bg-sky-100', dotColor: 'bg-sky-400', hex: '#38bdf8' },
  preparing: { label: 'Preparando', color: 'text-violet-700', bg: 'bg-violet-100', dotColor: 'bg-violet-500', hex: '#8b5cf6' },
  ready_for_pickup: { label: 'Listo', color: 'text-pink-700', bg: 'bg-pink-100', dotColor: 'bg-pink-400', hex: '#f472b6' },
  dispatched: { label: 'Despachado', color: 'text-orange-700', bg: 'bg-orange-100', dotColor: 'bg-orange-500', hex: '#f97316' },
  delivered: { label: 'Entregado', color: 'text-teal-700', bg: 'bg-teal-100', dotColor: 'bg-teal-500', hex: '#14b8a6' },
  pending_payment: { label: 'Pago pendiente', color: 'text-red-800', bg: 'bg-red-100', dotColor: 'bg-red-700', hex: '#b91c1c' },
  invoiced: { label: 'Facturación', color: 'text-emerald-700', bg: 'bg-emerald-100', dotColor: 'bg-emerald-500', hex: '#10b981' },
  cancelled: { label: 'Cancelado', color: 'text-neutral-500', bg: 'bg-neutral-100', dotColor: 'bg-neutral-400', hex: '#a3a3a3' },
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
