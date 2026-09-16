import { exportFilename } from '@/features/export/csv';
import { buildImageZip, zipBlobUrl } from '@/features/export/zip';
import type { ScrapedImage, ZipGrouping, ZipImageFormat } from '@/shared/types';

export interface ExportImagesOptions {
  format: ZipImageFormat;
  grouping?: ZipGrouping;
  onProgress?: (p: { phase: 'fetching' | 'zipping'; done: number; total: number }) => void;
  signal?: AbortSignal;
  filename?: string;
}

export interface ExportImagesResult {
  ok: boolean;
  total: number;
  failed: number;
  error?: string;
}

/** Fetch images, bundle into ZIP, and trigger download — runs directly in popup. */
export async function exportImagesZip(
  images: ScrapedImage[],
  options: ExportImagesOptions,
): Promise<ExportImagesResult> {
  const { format, grouping, onProgress, signal, filename } = options;

  if (images.length === 0) {
    return { ok: false, total: 0, failed: 0, error: 'No images to export' };
  }

  const total = images.length;
  let failed = 0;

  try {
    if (signal?.aborted) {
      throw new DOMException('Export aborted', 'AbortError');
    }

    const result = await buildImageZip(images, {
      format,
      grouping,
      signal,
      onProgress: (p) => onProgress?.({ phase: p.phase, done: p.done, total: p.total }),
    });
    failed = result.failed;

    const blobUrl = zipBlobUrl(result.zip);
    const zipName = filename ?? exportFilename('zip');

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = zipName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    return { ok: true, total, failed };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    return { ok: false, total, failed, error: err instanceof Error ? err.message : String(err) };
  }
}
