import { PointType } from './points';

/** Lo que recepción envía al pedir puntos por encima del tope diario */
export interface PointsGrantRequestInput {
  userId: string;
  points: number;
  type: PointType;
  reason: string;
}

/** Solicitud pendiente tal como le llega a los admins */
export interface PointsGrantRequest {
  id: string;
  userId: string;
  userName: string;
  points: number;
  type: PointType;
  reason: string;
  requestedBy: { id: string; name: string };
  createdAt: string;
  /** true cuando llega al conectarse (ya estaba pendiente), no como aviso nuevo */
  replay?: boolean;
}

export interface PointsGrantRequestResult extends Omit<PointsGrantRequest, 'replay'> {
  requestId: string;
  resolution: 'approve' | 'reject';
  resolvedBy: { id: string; name: string };
  resolvedAt: string;
}
