import { Location } from "./locations";
export type KitchenStatus = 'active' | 'inactive' | 'maintenance';

export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Kitchen {
  id: string;
  name: string;
  locationId: string;
  status: KitchenStatus;
  phone: string;
  openingHours: string;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  // location?: Location;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  address: string;
  dailyOrders: number;
  location?: Location;
  open?: boolean;
}

/** Respuesta de GET /api/v2/kitchens/public/status */
export interface KitchenOpenStatus {
  id: string;
  name: string;
  openingHours: string;
  /** null = horario vacío o inválido */
  open: boolean | null;
  opensAt: string | null;
  closesAt: string | null;
  minutesUntilOpen: number | null;
  minutesUntilClose: number | null;
  closingSoon: boolean;
  serverNow: string;
}

/** Estado de la cocina elegida (o de la que abre primero) que trae selectKitchen/location */
export type KitchenSelectionStatus = Omit<KitchenOpenStatus, "id" | "name" | "openingHours">;

/** Con todas las cocinas cerradas: domicilio estimado de la que abre primero */
export interface ClosedDelivery {
  kitchen: { id: string; name: string };
  delivery: { distance: number; price: number; duration: number };
}

// id, name, locationId, address, coordinates, status, dailyOrders, phone, openingHours, createdAt, updatedAt