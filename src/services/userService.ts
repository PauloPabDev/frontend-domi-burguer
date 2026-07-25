import { UserProfile } from '@/types/user';
import { getApiUrl } from '@/utils/apiUrl';

export class UserService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getUserById(userId: string, token: string): Promise<{ body: UserProfile }> {
    const response = await fetch(`${this.API_URL}api/v2/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el usuario (${response.status})`);
    }

    return await response.json();
  }

  static async getCurrentUser(token: string): Promise<{ body: UserProfile }> {
    const response = await fetch(`${this.API_URL}api/v2/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el usuario actual (${response.status})`);
    }

    return await response.json();
  }

  static async findByPhone(phone: string, token: string): Promise<{ body: UserProfile }> {
    const response = await fetch(`${this.API_URL}api/v2/users/phone/${encodeURIComponent(phone)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Usuario no encontrado');
    return response.json();
  }
}
