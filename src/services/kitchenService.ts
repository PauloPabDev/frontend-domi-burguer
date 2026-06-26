import { Kitchen } from '@/types/kitchens';
import { getApiUrl } from '@/utils/apiUrl';

interface KitchenResponse {
  body: Kitchen[];
}

export class KitchenService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async findKitchens(): Promise<KitchenResponse> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/kitchens`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar las cocinas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en findKitchenss:', error);
      throw error;
    }
  }
  static async findKitchensPublic(): Promise<KitchenResponse> {
    try {
      const response = await fetch(`${this.API_URL}api/v2/kitchens/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar las cocinas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en findKitchenss:', error);
      throw error;
    }
  }
}