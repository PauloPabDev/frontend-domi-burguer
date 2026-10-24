/** El navegador puede recibir push (service worker + Push API + Notification API) */
export function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

export function isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    // iPadOS se identifica como Mac pero con pantalla táctil
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** La PWA está instalada en la pantalla de inicio (en iOS es requisito para recibir push) */
export function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

/** El service worker de la app (solo se registra en producción) */
export async function getPushRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!isPushSupported()) return null;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;
    return navigator.serviceWorker.ready;
}

/** La clave pública VAPID llega en base64url; pushManager.subscribe la necesita como bytes */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const output = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
}
