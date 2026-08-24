import { WorkerUser, WorkerKitchen } from '@/types/worker';
import { getApiUrl } from '@/utils/apiUrl';

export class AdminService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getUsers(
    token: string,
    page = 1,
    limit = 20,
    key?: string,
    value?: string,
    option?: string
  ): Promise<{ body: WorkerUser[]; total?: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (key && value && option) {
      params.set('key', key);
      params.set('value', value);
      params.set('option', option);
    }
    const response = await fetch(`${this.API_URL}api/v2/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  }

  static async getUserById(token: string, id: string): Promise<{ body: WorkerUser }> {
    const response = await fetch(`${this.API_URL}api/v2/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  }

  static async updateUserRoles(
    token: string,
    id: string,
    roles: string[]
  ): Promise<{ body: WorkerUser }> {
    const response = await fetch(`${this.API_URL}api/v2/users/role/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ roles }),
    });
    if (!response.ok) throw new Error('Error al actualizar roles');
    return response.json();
  }

  static async updateUserKitchens(
    token: string,
    id: string,
    kitchenIds: string[]
  ): Promise<{ body: WorkerUser }> {
    const response = await fetch(`${this.API_URL}api/v2/users/assignedKitchens/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kitchensIds: kitchenIds }),
    });
    if (!response.ok) throw new Error('Error al actualizar cocinas');
    return response.json();
  }

  static async getKitchens(token: string): Promise<{ body: WorkerKitchen[] }> {
    const response = await fetch(`${this.API_URL}api/v2/kitchens`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener cocinas');
    return response.json();
  }
}
