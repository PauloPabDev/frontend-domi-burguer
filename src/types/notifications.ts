export type NotificationCategory = 'functional' | 'promotional';

export type NotificationPreferences = Record<NotificationCategory, boolean>;

export interface NotificationPublicKey {
    enabled: boolean;
    publicKey: string | null;
}

/** Payload que manda el backend en cada push (lo lee src/sw.ts) */
export interface PushPayload {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    category?: NotificationCategory;
    image?: string;
    /** Solo en promociones: permite contar el clic */
    campaignId?: string;
}

/** Parámetro con el que el service worker marca que se abrió una promoción (lo lee PushCampaignClickTracker) */
export const CAMPAIGN_CLICK_PARAM = 'nc';

export type CampaignAudienceType = 'all' | 'clients' | 'roles' | 'users';

export interface CampaignAudience {
    type: CampaignAudienceType;
    roles?: string[];
    userIds?: string[];
}

export interface PushCampaignInput {
    title: string;
    body: string;
    url: string;
    imageUrl: string;
    audience: CampaignAudience;
}

export interface PushCampaign extends PushCampaignInput {
    id: string;
    status: 'sending' | 'sent';
    stats: { targetUsers: number; sent: number; failed: number; clicks: number };
    createdAt: string;
    sentAt: string | null;
}
