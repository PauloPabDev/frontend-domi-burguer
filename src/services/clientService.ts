import { getApiUrl } from '@/utils/apiUrl';

export interface ApiClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
}

export class ClientService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getById(id: string, token: string): Promise<{ body: ApiClient }> {
    const response = await fetch(`${this.API_URL}api/v2/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error fetching client');
    return response.json();
  }
}
