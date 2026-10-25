import { getApiUrl } from '@/utils/apiUrl';
import { Announcement, AdminAnnouncement, AnnouncementInput } from '@/types/announcements';

const ACTIVE_CACHE_MS = 60_000;

interface ActiveCacheEntry {
  key: 'auth' | 'anon';
  at: number;
  promise: Promise<{ body: Announcement[] }>;
}

export class AnnouncementsService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  // El host que muestra los avisos al abrir la app y la página /avisos piden lo mismo:
  // se comparte la respuesta unos segundos (y la petición en vuelo) para no duplicar la llamada.
  private static activeCache: ActiveCacheEntry | null = null;

  /**
   * Avisos vigentes para este visitante. Con token cuenta como "con sesión" para la audiencia.
   * La respuesta cambia según haya sesión, así que el caché distingue las dos.
   */
  static getActive(token?: string, force = false): Promise<{ body: Announcement[] }> {
    const key = token ? 'auth' : 'anon';
    const cached = this.activeCache;
    if (!force && cached && cached.key === key && Date.now() - cached.at < ACTIVE_CACHE_MS) {
      return cached.promise;
    }

    const promise = fetch(`${this.API_URL}api/v2/announcements/active`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: 'no-store',
    }).then((response) => {
      if (!response.ok) throw new Error('Error al obtener los avisos');
      return response.json() as Promise<{ body: Announcement[] }>;
    });

    this.activeCache = { key, at: Date.now(), promise };
    // si falla no se queda en caché: el próximo intento vuelve a pedirlo
    promise.catch(() => {
      if (this.activeCache?.promise === promise) this.activeCache = null;
    });
    return promise;
  }

  static invalidateActive(): void {
    this.activeCache = null;
  }

  // ---- Administración ----

  static async getAll(token: string): Promise<{ body: AdminAnnouncement[] }> {
    const response = await fetch(`${this.API_URL}api/v2/announcements`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener los avisos');
    return response.json();
  }

  static async create(token: string, data: AnnouncementInput): Promise<{ body: AdminAnnouncement }> {
    const response = await fetch(`${this.API_URL}api/v2/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await this.errorMessage(response, 'Error al crear el aviso'));
    this.invalidateActive();
    return response.json();
  }

  static async update(
    token: string,
    id: string,
    data: AnnouncementInput
  ): Promise<{ body: AdminAnnouncement }> {
    const response = await fetch(`${this.API_URL}api/v2/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await this.errorMessage(response, 'Error al actualizar el aviso'));
    this.invalidateActive();
    return response.json();
  }

  /** Archiva el aviso (no se borra). */
  static async archive(token: string, id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}api/v2/announcements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await this.errorMessage(response, 'Error al archivar el aviso'));
    this.invalidateActive();
  }

  // La validación del backend explica qué campo falló: se la mostramos al admin tal cual
  private static async errorMessage(response: Response, fallback: string): Promise<string> {
    const data = await response.json().catch(() => null);
    return data?.message || fallback;
  }
}
