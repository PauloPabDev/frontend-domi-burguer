import { OrderStatus, PaymentMethod } from './orders';

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface RawSocketOrderItem {
  id: string;
  price: number;
  quantity: number;
  complements?: RawSocketComplement[];
}

export interface RawSocketComplement {
  id: string;
  price: number;
  quantity: number;
}

export interface RawSocketDelivery {
  distance: number;
  price: number;
  duration: number;
}

export interface RawSocketTimeLapse {
  courierUserId: string | null;
  updatedAt: FirestoreTimestamp;
  userId: string;
}

export interface RawSocketOrder {
  id: string;
  status: OrderStatus;
  dailyOrderNumber: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  comment?: string;
  locationId?: string;

  delivery: RawSocketDelivery | null;
  orderItems: RawSocketOrderItem[];

  clientId: string;
  userCreateId?: string;
  assignedCourierUserId?: string | null;
  assignedKitchenId?: string | null;

  payment?: { status: string };
  origin?: unknown;
  codes?: string[];
  timeLapseStatus?: unknown[];
  timeLapseAssignedCourier?: RawSocketTimeLapse[];
  timeLapseKitchen?: unknown[];

  estimatedDeliveryTime?: FirestoreTimestamp | null;
  createdAt: FirestoreTimestamp | string | null;
  updatedAt: FirestoreTimestamp | string | null;
}
