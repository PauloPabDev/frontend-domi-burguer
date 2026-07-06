import { OrderComplement, OrderItem } from '@/types/orders';
import { RawSocketComplement, RawSocketOrder, RawSocketOrderItem, FirestoreTimestamp } from '@/types/rawSocketOrder';
import { WorkerOrder } from '@/types/worker';

function firestoreTimestampToISO(ts: FirestoreTimestamp | string | null | undefined): string | null {
  if (!ts) return null;
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (typeof ts._seconds !== 'number') return null;
  const ms = ts._seconds * 1000 + (ts._nanoseconds ?? 0) / 1_000_000;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeComplement(raw: RawSocketComplement): OrderComplement {
  return {
    name: raw.id,
    price: raw.price,
    quantity: raw.quantity,
  };
}

function normalizeOrderItem(raw: RawSocketOrderItem, index: number): OrderItem {
  const complements: OrderComplement[] | undefined = raw.complements?.length
    ? raw.complements.map(normalizeComplement)
    : undefined;

  return {
    id: `${raw.id}-${index}`,
    name: raw.id,
    price: raw.price,
    quantity: raw.quantity,
    ...(complements && { complements }),
  };
}

export function normalizeSocketOrder(raw: RawSocketOrder): WorkerOrder {
  const deliveryPrice = raw.delivery?.price ?? 0;
  const distance = raw.delivery?.distance;
  return {
    ...raw,
    id: raw.id,
    status: raw.status,
    dailyOrderNumber: raw.dailyOrderNumber,
    totalPrice: raw.totalPrice,
    deliveryPrice,
    subtotal: raw.totalPrice - deliveryPrice,
    paymentMethod: raw.paymentMethod,
    comment: raw.comment,
    locationId: raw.locationId,
    orderItems: raw.orderItems.map(normalizeOrderItem),
    ...(raw.clientId && { clientId: raw.clientId }),
    ...(raw.client && { client: raw.client }),
    ...(raw.deliveryAddress && { deliveryAddress: raw.deliveryAddress }),
    ...(raw.assignedCourierUserId && { courierId: raw.assignedCourierUserId }),
    ...(raw.assignedKitchenId && { kitchenId: raw.assignedKitchenId }),
    ...(distance !== undefined && { distance }),
    createdAt: firestoreTimestampToISO(raw.createdAt) ?? '',
    updatedAt: firestoreTimestampToISO(raw.updatedAt) ?? '',
  };
}

export function normalizeSocketOrders(raws: RawSocketOrder[]): WorkerOrder[] {
  return raws.map(normalizeSocketOrder);
}
