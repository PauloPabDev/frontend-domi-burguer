import { Point, PointType, PointsResponse } from '@/types/points';
import { getApiUrl } from '@/utils/apiUrl';

export class PointsService {
    private static get API_URL(): string {
        return getApiUrl();
    }

    static async getPointsByUserId(
        userId: string,
        token: string,
        limit?: number
    ): Promise<PointsResponse> {
        try {
            const response = await fetch(
                `${this.API_URL}api/v2/points/user/${userId}${limit ? `?limit=${limit}` : ''}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Error al obtener los puntos del usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user points:', error);
            throw error;
        }
    }

    /** Suma puntos al saldo del usuario (solo recepción y admin; lo exige la API). */
    static async addPoints(
        data: { userId: string; points: number; description: string; type: PointType },
        token: string
    ): Promise<{ body: Point }> {
        const response = await fetch(`${this.API_URL}api/v2/points/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const json = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(json?.message || 'No se pudieron asignar los puntos');
        }
        return json;
    }
}
