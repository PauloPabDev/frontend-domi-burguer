export type NoteTargetType = 'client' | 'user' | 'location';
export type NoteKind = 'tip' | 'warning' | 'praise' | 'access' | 'other';

export const NOTE_MAX_PHOTOS = 4;
export const NOTE_MAX_TEXT = 1000;

export interface NotePhoto {
  id: string;
  /** URL firmada y temporal de la foto completa (la API la renueva en cada consulta) */
  url: string;
  thumbUrl: string;
  contentType: string;
  size: number;
}

export interface Note {
  id: string;
  targetType: NoteTargetType;
  targetId: string;
  kind: NoteKind;
  text: string;
  photos: NotePhoto[];
  pinned: boolean;
  /** uid del empleado que la escribió */
  userCreateId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  updatedAt: string;
}

/** Foto ya comprimida, lista para subir, con su miniatura */
export interface NotePhotoUpload {
  photo: Blob;
  thumb: Blob;
}

export interface NoteCreateInput {
  targetType: NoteTargetType;
  targetId: string;
  kind: NoteKind;
  text: string;
  photos: NotePhotoUpload[];
}

export interface NoteUpdateInput {
  kind?: NoteKind;
  text?: string;
  pinned?: boolean;
}
