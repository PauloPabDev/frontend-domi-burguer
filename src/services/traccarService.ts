import { getApiUrl } from '@/utils/apiUrl';

/** Objeto device tal como lo devuelve Traccar (sin normalizar), con todos sus campos. */
export interface TraccarRawDevice {
  id: number | string;
  name?: string;
  uniqueId?: string;
  status?: string;
  lastUpdate?: string | null;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Última posición del device tal como la devuelve Traccar (sin normalizar). */
export interface TraccarRawPosition {
  id?: number;
  deviceId?: number | string;
  latitude?: number;
  longitude?: number;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TraccarDeviceAttributesResponse {
  device: TraccarRawDevice;
  position: TraccarRawPosition | null;
  /** device.attributes + position.attributes fusionados (batería, ignición, id_arceliuz, etc.) */
  attributes: Record<string, unknown>;
}

export class TraccarService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  /**
   * Todos los datos crudos de un device de Traccar (device + última posición).
   * Se usa principalmente para leer el atributo personalizado `id_arceliuz`
   * (el email del domiciliario en la app) y así cruzarlo con WorkerUser.
   * Devuelve null si Traccar no conoce ese id.
   */
  static async getDeviceAttributesById(
    token: string,
    deviceId: string,
  ): Promise<TraccarDeviceAttributesResponse | null> {
    const response = await fetch(`${this.API_URL}api/v2/traccar/devices/${deviceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Error al obtener los atributos del dispositivo de Traccar');

    const { body } = await response.json();
    return body;
  }
}
