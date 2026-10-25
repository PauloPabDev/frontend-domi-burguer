import { NotePhotoUpload } from '@/types/notes';

const PHOTO_MAX_SIDE = 1600;
const PHOTO_QUALITY = 0.82;
const THUMB_MAX_SIDE = 320;
const THUMB_QUALITY = 0.7;

type Source = { width: number; height: number; draw: CanvasImageSource; release: () => void };

/** Decodifica la imagen respetando la orientación EXIF (las fotos del celular vienen giradas). */
async function loadSource(file: File): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { width: bitmap.width, height: bitmap.height, draw: bitmap, release: () => bitmap.close() };
    } catch {
      // algunos navegadores no aceptan las opciones: se cae al <img>
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen'));
      img.src = url;
    });
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: image,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function render(source: Source, maxSide: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));

  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('Tu navegador no puede procesar la imagen'));

  // fondo blanco: un PNG con transparencia saldría negro en JPEG
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source.draw, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
      'image/jpeg',
      quality
    );
  });
}

/**
 * Reduce la foto (lado mayor 1600 px) y genera una miniatura (320 px), ambas en JPEG.
 * Pasar por un canvas también elimina el EXIF (incluida la ubicación GPS de la foto).
 */
export async function compressImage(file: File): Promise<NotePhotoUpload> {
  const source = await loadSource(file);
  try {
    const photo = await render(source, PHOTO_MAX_SIDE, PHOTO_QUALITY);
    const thumb = await render(source, THUMB_MAX_SIDE, THUMB_QUALITY);
    return { photo, thumb };
  } finally {
    source.release();
  }
}
