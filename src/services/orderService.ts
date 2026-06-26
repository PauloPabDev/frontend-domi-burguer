import { Order, OrderStatus } from '@/types/orders';
import { getApiUrl } from '@/utils/apiUrl';

export class OrderService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getUserOrders(token: string): Promise<{ body: Order[] }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/orders/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los pedidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  static async getOrderById(orderId: string, token: string): Promise<{ body: Order }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  static async cancelOrder(orderId: string, token: string): Promise<{ body: Order }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cancelar el pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  static getOrderStatusInfo(status: OrderStatus) {
    const statusMap: Record<OrderStatus, { label: string; color: string; bgColor: string; borderColor: string; isButton: boolean }> = {
      fresh: {
        label: 'CREADO',
        color: 'text-neutral-800',
        bgColor: 'bg-[#c4d600]',
        borderColor: 'border-[#c4d600]',
        isButton: false
      },
      preparing: {
        label: 'EN PREPARACIÓN',
        color: 'text-[#c4a600]',
        bgColor: 'bg-white',
        borderColor: 'border-[#c4a600]',
        isButton: false
      },
      ready_for_pickup: {
        label: 'EN CAMINO',
        color: 'text-[#c4a600]',
        bgColor: 'bg-white',
        borderColor: 'border-[#c4a600]',
        isButton: false
      },
      dispatched: {
        label: 'EN CAMINO',
        color: 'text-[#c4a600]',
        bgColor: 'bg-white',
        borderColor: 'border-[#c4a600]',
        isButton: false
      },
      delivered: {
        label: 'COMPRAR DE NUEVO',
        color: 'text-white',
        bgColor: 'bg-[#e73533]',
        borderColor: 'border-[#e73533]',
        isButton: true
      },
      pending_payment: {
        label: 'PAGO PENDIENTE',
        color: 'text-white',
        bgColor: 'bg-red-800',
        borderColor: 'border-red-800',
        isButton: false
      },
      cancelled: {
        label: 'CANCELADO',
        color: 'text-neutral-600',
        bgColor: 'bg-neutral-200',
        borderColor: 'border-neutral-200',
        isButton: false
      }
    };

    return statusMap[status] ?? statusMap.fresh;
  }
}
