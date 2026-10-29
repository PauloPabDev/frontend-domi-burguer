import {
    NotificationPreferences,
    NotificationPublicKey,
    PushCampaign,
    PushCampaignInput,
} from '@/types/notifications';
import { getApiUrl } from '@/utils/apiUrl';
import { getPushRegistration } from '@/utils/pushSupport';

interface ApiResponse<T> {
    body: T;
    statusCode: number;
    message: string;
}

export class NotificationService {
    private static get API_URL(): string {
        return `${getApiUrl()}api/v2/notifications`;
    }

    private static async request<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.API_URL}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!response.ok) {
            throw new Error('Error al comunicarse con el servicio de notificaciones');
        }
        const json: ApiResponse<T> = await response.json();
        return json.body;
    }

    static getPublicKey(): Promise<NotificationPublicKey> {
        return this.request<NotificationPublicKey>('/public-key', null);
    }

    static subscribe(subscription: PushSubscription, token: string): Promise<{ id: string }> {
        return this.request('/subscriptions', token, {
            method: 'POST',
            body: JSON.stringify({
                subscription: subscription.toJSON(),
                userAgent: navigator.userAgent.slice(0, 512),
            }),
        });
    }

    static unsubscribe(endpoint: string, token: string): Promise<null> {
        return this.request(`/subscriptions?endpoint=${encodeURIComponent(endpoint)}`, token, {
            method: 'DELETE',
        });
    }

    /**
     * Desvincula este dispositivo del usuario (al cerrar sesión). Mantiene el permiso y la suscripción
     * del navegador: el próximo usuario que inicie sesión aquí la reutiliza. No lanza errores.
     */
    static async detachCurrentDevice(token: string): Promise<void> {
        try {
            const registration = await getPushRegistration();
            const subscription = await registration?.pushManager.getSubscription();
            if (subscription) await this.unsubscribe(subscription.endpoint, token);
        } catch (error) {
            console.error('Error desvinculando el dispositivo de las notificaciones:', error);
        }
    }

    static getPreferences(token: string): Promise<NotificationPreferences> {
        return this.request<NotificationPreferences>('/preferences', token);
    }

    static getCampaigns(token: string): Promise<PushCampaign[]> {
        return this.request<PushCampaign[]>('/campaigns', token);
    }

    static sendCampaign(campaign: PushCampaignInput, token: string): Promise<PushCampaign> {
        return this.request<PushCampaign>('/campaigns', token, {
            method: 'POST',
            body: JSON.stringify(campaign),
        });
    }

    /** Cuenta el clic de una promoción. No lanza errores: es solo una estadística */
    static async trackCampaignClick(campaignId: string): Promise<void> {
        try {
            await this.request(`/campaigns/${encodeURIComponent(campaignId)}/click`, null, { method: 'POST' });
        } catch (error) {
            console.error('Error registrando el clic de la promoción:', error);
        }
    }

    static updatePreferences(
        changes: Partial<NotificationPreferences>,
        token: string
    ): Promise<NotificationPreferences> {
        return this.request<NotificationPreferences>('/preferences', token, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    }
}
