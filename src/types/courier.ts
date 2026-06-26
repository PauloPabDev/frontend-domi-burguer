import { DeliveryAddress, OrderItem, PaymentMethod, OrderStatus } from './orders';

export interface CourierOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  dailyOrderNumber: number;
  totalPrice: number;
  deliveryPrice: number;
  subtotal: number;
  locationId: string;
  courierId?: string;
  client?: {
    name: string;
    phone: string;
    email?: string;
  };
  kitchen?: {
    id: string;
    name: string;
  };
  distance?: number;
  orderItems: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  comment?: string;
}

export interface CourierStats {
  earnings: number;
  deliveries: number;
  totalDistance: number;
}

export type ConnectionStatus =
  | 'IDLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'OFFLINE';
