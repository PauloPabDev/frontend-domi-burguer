import { WorkerOrder } from './worker';

export type CourierOrder = WorkerOrder;

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
