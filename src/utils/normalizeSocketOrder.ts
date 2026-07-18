import { OrderComplement, OrderItem, OrderStatus, Payment } from '@/types/orders';
import { RawSocketOrder, RawSocketOrderItem, FirestoreTimestamp } from '@/types/rawSocketOrder';
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

function normalizeOrderItem(raw: RawSocketOrderItem): OrderItem {
  const complements: OrderComplement[] | undefined = raw.complements?.length
    ? raw.complements.map(normalizeOrderItem)
    : [];
  return {
    id: raw.id,
    name: raw.id,
    price: raw.price,
    quantity: raw.quantity || 1,
    ...(complements && { complements }),
  };
}

export function normalizeSocketOrder(raw: RawSocketOrder): WorkerOrder {
  const { payment: rawPayment, timeLapseStatus: rawTimeLapseStatus, ...restRaw } = raw;
  const deliveryPrice = raw.delivery?.price ?? 0;
  const distance = raw.delivery?.distance;
  return {
    ...restRaw,
    origin: raw.origin === 'public' ? 'public' : null,
    delivery: raw.delivery ?? { price: 0, duration: 0, distance: 0 },
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
    ...(raw.userCreateId && { userId: raw.userCreateId }),
    ...(raw.deliveryAddress && { deliveryAddress: raw.deliveryAddress }),
    ...(raw.assignedCourierUserId && { courierId: raw.assignedCourierUserId }),
    ...(raw.assignedKitchenId && { kitchenId: raw.assignedKitchenId }),
    ...(distance !== undefined && { distance }),
    ...(rawPayment && {
      payment: {
        status: rawPayment.status as Payment['status'],
        method: raw.paymentMethod,
      },
    }),
    createdAt: firestoreTimestampToISO(raw.createdAt) ?? '',
    updatedAt: firestoreTimestampToISO(raw.updatedAt) ?? '',
    ...(rawTimeLapseStatus?.length && {
      timeLapseStatus: rawTimeLapseStatus.map((e) => ({
        status: e.status as OrderStatus,
        updatedAt: firestoreTimestampToISO(e.updatedAt) ?? String(e.updatedAt),
        userId: e.userId,
      })),
    }),
  };
}

export function normalizeSocketOrders(raws: RawSocketOrder[]): WorkerOrder[] {
  return raws.map(normalizeSocketOrder);
}
