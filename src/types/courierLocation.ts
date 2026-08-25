/**
 * Ubicación en vivo de un domiciliario, tal como la reporta Traccar
 * (ver backend: src/Traccar). Se recibe por socket (`courierLocation/init`
 * con el snapshot completo, `courierLocation/update` con los que cambiaron).
 */
export interface CourierLocation {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'unknown';
  lat: number;
  lng: number;
  speed?: number | null;
  course?: number | null;
  lastUpdate?: string | null;
  fixTime?: string | null;
}
