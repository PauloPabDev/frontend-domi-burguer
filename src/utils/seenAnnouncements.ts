const STORAGE_KEY = 'announcements-seen';
// Tope para que la lista no crezca sin fin; se descartan los más antiguos
const MAX_SEEN = 200;

/** Un aviso editado con "volver a mostrar" cambia de versión y vuelve a salir. */
export function announcementKey(announcement: { id: string; version: number }): string {
  return `${announcement.id}:${announcement.version}`;
}

function readKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

// Se lee siempre del almacenamiento (no se cachea) para que varias pestañas abiertas no repitan el aviso
export function getSeenKeys(): Set<string> {
  return new Set(readKeys());
}

export function markAnnouncementSeen(announcement: { id: string; version: number }): void {
  try {
    const keys = readKeys();
    const key = announcementKey(announcement);
    if (keys.includes(key)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys, key].slice(-MAX_SEEN)));
  } catch {
    // sin almacenamiento disponible: el aviso podría repetirse, no pasa nada
  }
}
