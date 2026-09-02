import { getApiUrl } from '@/utils/apiUrl';

/** Una conexión websocket identificada (cliente o trabajador). */
export interface SocketConnectionEntry {
  socketId: string;
  role: string | null;
  userId: string | null;
  email: string | null;
  kitchenId: string | null;
  orderId: string | null;
  page: string | null;
  connectedAt: string;
}

export interface SocketConnectionsSnapshot {
  summary: {
    total: number;
    clients: { sockets: number; uniqueUsers: number };
    workers: { sockets: number; uniqueUsers: number; byRole: Record<string, number> };
  };
  workers: SocketConnectionEntry[];
  clients: SocketConnectionEntry[];
}

export class MonitoringService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  /** Snapshot actual de conexiones websocket (clientes y trabajadores), solo admin. */
  static async getConnectionsStatus(token: string): Promise<SocketConnectionsSnapshot> {
    const response = await fetch(`${this.API_URL}api/v2/monitoring/connections`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Error al obtener el estado de conexiones');

    const { body } = await response.json();
    return body;
  }
}
