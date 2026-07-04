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

  static async findByPhone(phone: string, token: string): Promise<{ body: ApiClient }> {
    const response = await fetch(`${this.API_URL}api/v2/clients/phone/${encodeURIComponent(phone)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Cliente no encontrado');
    return response.json();
  }

  static async create(data: { name: string; phone: string }, token: string): Promise<{ body: ApiClient }> {
    const response = await fetch(`${this.API_URL}api/v2/clients/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear cliente');
    return response.json();
  }
}
