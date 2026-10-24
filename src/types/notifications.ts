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
}
