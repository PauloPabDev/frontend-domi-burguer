import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { getApiUrl } from '@/utils/apiUrl';

export class CourierService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async changeStatus(
    token: string,
    orderId: string,
    previousState: OrderStatus,
    nextState: OrderStatus
  ): Promise<{ body: CourierOrder }> {
    const response = await fetch(`${this.API_URL}api/v2/orders/status/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ previousState, nextState }),
    });

    if (!response.ok) {
      throw new Error('Error al cambiar el estado del pedido');
    }

    return await response.json();
  }

  static async getHistory(
    token: string,
    courierId: string,
    startDate: string,
    endDate: string
  ): Promise<{ body: CourierOrder[] }> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${this.API_URL}api/v2/orders/history/courier/${courierId}?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener el historial');
    }

    return await response.json();
  }
}
