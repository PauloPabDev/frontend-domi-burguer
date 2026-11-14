import { Address, Coordinates } from '@/types/address';
import { ClosedDelivery, Kitchen, KitchenSelectionStatus } from '@/types/kitchens';
import { Delivery } from '@/types/orders';
import { getApiUrl } from '@/utils/apiUrl';

interface AddressFormData {
  address: string;
  floor: string;
  comment: string;
  city: string;
  country: string;
  propertyType: string;
  coordinates: Coordinates;
}

interface AddressResponse {
  body: Address;
}

export class AddressService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async createAddress(data: AddressFormData): Promise<AddressResponse> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/locations/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error al crear dirección: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createAddress:', error);
      throw error;
    }
  }
  
  /**
   * Con todas las cocinas cerradas `delivery` y `kitchen` vienen null: el costo estimado llega en
   * `closedDelivery` y el estado (cuándo abrimos) en `kitchenStatus`.
   */
  static async createDelivery(addressId: string): Promise<{
    delivery: Delivery | null;
    kitchen: Kitchen | null;
    kitchenStatus: KitchenSelectionStatus | null;
    closedDelivery: ClosedDelivery | null;
  }> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/kitchens/selectKitchen/location?locationId=${addressId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al crear el precio del domicilio: ${response.statusText}`);
      }

      const { body } = await response.json();
      return {
        delivery: body.delivery ?? null,
        kitchen: body.kitchen ?? null,
        kitchenStatus: body.kitchenStatus ?? null,
        closedDelivery: body.closedDelivery ?? null,
      };
    } catch (error) {
      console.error('Error en createDeliveryPrice:', error);
      throw error;
    }
  }

  static parseAddress(fullAddress: string) {
    const parts = fullAddress.split(',').map(part => part.trim());
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      country: parts[2] || '',
    };
  }
}