export function getSocketUrl(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8087/').replace(/\/$/, '');

  if (typeof window === 'undefined') return base;

  const currentHost = window.location.hostname;
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') return base;

  try {
    const url = new URL(base);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = currentHost;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return base;
  }

  return base;
}

export const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
  upgrade: true,
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
};
