import type { ZipImageFormat } from '@/shared/types';

const MIME: Record<ZipImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
};

const EXT: Record<ZipImageFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
};

/** File extension used for images stored as `format`. */
export function targetExt(format: ZipImageFormat): string {
  return EXT[format];
}

/** Whether image bytes served as `contentType` still need converting to `format`. */
export function needsConversion(contentType: string, format: ZipImageFormat): boolean {
  return contentType !== MIME[format];
}

/**
 * Re-encode image bytes as `format`; bytes already in that format are returned
 * untouched. The response content type is the source of truth — Instagram serves
 * WebP from `.jpg` paths, so the URL extension would guess wrong.
 */
export async function convertImage(
  bytes: Uint8Array,
  contentType: string,
  format: ZipImageFormat,
): Promise<Uint8Array> {
  if (!needsConversion(contentType, format)) return bytes;

  const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: contentType }));
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    if (format === 'jpeg') {
      // JPEG has no alpha channel — without a backdrop, transparency encodes as black.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, bitmap.width, bitmap.height);
    }
    ctx.drawImage(bitmap, 0, 0);

    const blob = await canvas.convertToBlob({ type: MIME[format] });
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    bitmap.close();
  }
}
