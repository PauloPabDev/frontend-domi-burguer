import { getApiUrl } from '@/utils/apiUrl';
import { DocumentSection, DocumentDetail } from '@/types/documents';

export class DocumentsService {
  private static get API_URL(): string {
    return getApiUrl();
  }

  static async getForRole(token: string): Promise<{ body: { sections: DocumentSection[] } }> {
    const response = await fetch(`${this.API_URL}api/v2/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al obtener los documentos');
    return response.json();
  }

  static async getById(token: string, id: string): Promise<{ body: DocumentDetail }> {
    const response = await fetch(`${this.API_URL}api/v2/documents/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 403) throw new Error('No tienes acceso a este documento');
      if (response.status === 404) throw new Error('Documento no encontrado');
      throw new Error('Error al obtener el documento');
    }
    return response.json();
  }
}
