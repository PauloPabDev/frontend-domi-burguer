import { WorkerOrder, WorkerKitchen, WorkerUser } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { getApiUrl } from '@/utils/apiUrl';

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

  static async getCouriersList(token: string): Promise<{ body: WorkerUser[] }> {
    const params = new URLSearchParams({ key: 'roles', value: 'courier' });
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
}
