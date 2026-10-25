import { getApiUrl } from '@/utils/apiUrl';
import { Note, NoteCreateInput, NoteTargetType, NoteUpdateInput } from '@/types/notes';

/** Error de la API de notas con el código HTTP, para distinguir p. ej. 503 (sin almacenamiento de fotos) */
export class NotesApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'NotesApiError';
  }
}

export class NotesService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  /** La API devuelve rutas relativas firmadas (/api/v2/notes/media/...): se completan con su host. */
  private static withAbsoluteUrls(note: Note): Note {
    const base = this.API_URL.replace(/\/+$/, '');
    const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${base}${path}`);
    return {
      ...note,
      photos: (note.photos ?? []).map((photo) => ({
        ...photo,
        url: abs(photo.url),
        thumbUrl: abs(photo.thumbUrl),
      })),
    };
  }

  private static async parse<T>(response: Response, fallback: string): Promise<T> {
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new NotesApiError(data?.message || fallback, response.status);
    }
    return response.json();
  }

  static async getByTarget(
    token: string,
    targetType: NoteTargetType,
    targetId: string
  ): Promise<{ body: Note[] }> {
    const query = new URLSearchParams({ targetType, targetId });
    const response = await fetch(`${this.API_URL}api/v2/notes?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await this.parse<{ body: Note[] }>(response, 'Error al cargar las notas');
    return { body: (data.body ?? []).map((note) => this.withAbsoluteUrls(note)) };
  }

  static async create(token: string, input: NoteCreateInput): Promise<{ body: Note }> {
    // multipart: no se fija Content-Type, el navegador añade el boundary
    const form = new FormData();
    form.append('targetType', input.targetType);
    form.append('targetId', input.targetId);
    form.append('kind', input.kind);
    form.append('text', input.text);
    input.photos.forEach(({ photo, thumb }, index) => {
      form.append('photos', photo, `foto-${index + 1}.jpg`);
      form.append('thumbs', thumb, `foto-${index + 1}-mini.jpg`);
    });

    const response = await fetch(`${this.API_URL}api/v2/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await this.parse<{ body: Note }>(response, 'No se pudo guardar la nota');
    return { body: this.withAbsoluteUrls(data.body) };
  }

  static async update(token: string, id: string, changes: NoteUpdateInput): Promise<{ body: Note }> {
    const response = await fetch(`${this.API_URL}api/v2/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(changes),
    });
    const data = await this.parse<{ body: Note }>(response, 'No se pudo actualizar la nota');
    return { body: this.withAbsoluteUrls(data.body) };
  }

  static async deletePhoto(token: string, id: string, photoId: string): Promise<{ body: Note }> {
    const response = await fetch(`${this.API_URL}api/v2/notes/${id}/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await this.parse<{ body: Note }>(response, 'No se pudo quitar la foto');
    return { body: this.withAbsoluteUrls(data.body) };
  }

  static async remove(token: string, id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}api/v2/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await this.parse<unknown>(response, 'No se pudo eliminar la nota');
  }
}
