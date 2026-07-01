import { Product } from '@/types/product';
import { getApiUrl } from '@/utils/apiUrl';

export class ProductService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getAll(token: string): Promise<{ body: Product[] }> {
    const params = new URLSearchParams({ page: '1', limit: '500' });
    const response = await fetch(`${this.API_URL}api/v2/products?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error fetching products');
    return response.json();
  }
}
