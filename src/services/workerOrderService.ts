import { WorkerOrder, WorkerKitchen, WorkerUser } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { getApiUrl } from '@/utils/apiUrl';

export interface AdminOrderPayload {
  clientId: string;
  locationId: string;
  comment: string;
  paymentMethod: string;
  orderItems: Array<{ id: string; complements?: Array<{ id: string }> }>;
  delivery: { price: number; distance: number };
  assignedKitchenId?: string;
}

export interface DeliveryInfo {
  price: number;
  distance: number;
  duration?: number;
  modified?: boolean;
}

export interface KitchenInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  dailyOrders?: number;
}

export class WorkerOrderService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async changeStatus(
    token: string,
    orderId: string,
    previousState: OrderStatus,
    nextState: OrderStatus
  ): Promise<{ body: WorkerOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/status/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ previousState, nextState }),
    });
    if (!response.ok) throw new Error('Error al cambiar el estado del pedido');
    return response.json();
  }

  static async assignCourier(
    token: string,
    orderId: string,
    courierUserId: string
  ): Promise<{ body: WorkerOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/courier/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courierUserId }),
    });
    if (!response.ok) throw new Error('Error al asignar domiciliario');
    return response.json();
  }

  static async assignKitchen(
    token: string,
    orderId: string,
    kitchenId: string
  ): Promise<{ body: WorkerOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/kitchen/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kitchenId }),
    });
    if (!response.ok) throw new Error('Error al asignar cocina');
    return response.json();
  }

  static async updatePaymentMethod(
    token: string,
    orderId: string,
    previousPaymentMethod: string,
    paymentMethod: string
  ): Promise<{ body: WorkerOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/paymentMethod/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ previousPaymentMethod, paymentMethod }),
    });
    if (!response.ok) throw new Error('Error al actualizar el método de pago');
    return response.json();
  }

  static async markPaid(
    token: string,
    orderId: string
  ): Promise<{ body: WorkerOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/payment/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al registrar el pago');
    return response.json();
  }

  static async getOrdersByDay(
    token: string,
    startDate: string,
    endDate: string,
    kitchenId?: string
  ): Promise<{ body: WorkerOrder[] }> {
    const params = new URLSearchParams({ startDate, endDate });
    if (kitchenId) params.set('kitchenId', kitchenId);
    const response = await fetch(`${this.API_URL}api/v2/orders/day?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener pedidos del día');
    return response.json();
  }

  static async getOrdersHistory(
    token: string,
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ body: WorkerOrder[] }> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${this.API_URL}api/v2/orders/history/${userId}?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error('Error al obtener historial');
    return response.json();
  }

  static async getCouriersList(token: string, pagination: { page: string; limit: string }): Promise<{ body: WorkerUser[] }> {
    const params = new URLSearchParams({ key: 'roles', value: 'courier', option: 'array-contains' });
    params.set('page', pagination.page);
    params.set('limit', pagination.limit);
    const response = await fetch(`${this.API_URL}api/v2/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener domiciliarios');
    return response.json();
  }

  static async getKitchensList(token: string): Promise<{ body: WorkerKitchen[] }> {
    const response = await fetch(`${this.API_URL}api/v2/kitchens`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener cocinas');
    return response.json();
  }

  static async createAdminOrder(
    payload: AdminOrderPayload,
    token: string
  ): Promise<{ body: WorkerOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/public/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Error al crear la orden');
    }
    return response.json();
  }

  static async deleteOrder(token: string, orderId: string): Promise<void> {
    const response = await fetch(`${this.API_URL}api/v2/orders/${orderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al eliminar la orden');
  }

  static async getSelectKitchen(
    locationId: string,
    token: string,
    kitchenId?: string
  ): Promise<{ body: { delivery: DeliveryInfo; kitchen: KitchenInfo } }> {
    const params = new URLSearchParams({ locationId });
    if (kitchenId) params.set('kitchenId', kitchenId);
    const response = await fetch(
      `${this.API_URL}api/v2/kitchens/selectKitchen/location?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error('Error al calcular precio de delivery');
    return response.json();
  }
}
