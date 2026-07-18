export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalPrice?: number;
  deliveryPrice?: number;
  subtotal?: number;
  orderItems: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  paymentMethod: PaymentMethod;
  comment?: string;
  estimatedDeliveryTime?: string;
  locationId?: string;
  dailyOrderNumber?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image1?: string;
  image2?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  complements?: OrderComplement[];
}


export interface OrderComplement {
  name: string;
  quantity: number;
  price: number;
  colorPrimary?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryAddress {
  name: string;
  address: string;
  city: string;
  country: string;
  floor?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  deliveryPrice: number;
  comment?: string;
}

export interface Delivery {
  distance: number;
  price: number;
  duration: number;
}

export type PaymentMethod = 'cash' | 'bancolombia' | 'nequi';

export interface Payment {
  status: 'pending' | 'approved' | 'rejected';
  method: PaymentMethod;
}

export type OrderStatus =
  | 'fresh'
  | 'preparing'
  | 'ready_for_pickup'
  | 'dispatched'
  | 'delivered'
  | 'invoiced'
  | 'pending_payment'
  | 'cancelled';

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  color: string;
  bgColor: string;
}
