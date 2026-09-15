import { zipSync } from 'fflate';
import { convertImage, targetExt } from '@/features/export/convert';
import type { ZipImageFormat } from '@/shared/types';

const CONCURRENCY = 4;

export interface ZipProgress {
  phase: 'fetching' | 'zipping';
  done: number;
  total: number;
  failed: number;
}

export interface BuildZipOptions {
  format: ZipImageFormat;
  signal?: AbortSignal;
  onProgress?: (progress: ZipProgress) => void | Promise<void>;
}

export interface BuildZipResult {
  zip: Uint8Array;
  total: number;
  failed: number;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/**
 * Fetch every URL, re-encode it to `format` unless it already is that format,
 * and bundle the results into a ZIP archive. Throws when nothing was collected.
 */
export async function buildImageZip(
  urls: string[],
  { format, signal, onProgress }: BuildZipOptions,
): Promise<BuildZipResult> {
  const total = urls.length;
  const width = String(total).length;
  const ext = targetExt(format);
  const files: Record<string, Uint8Array> = {};
  const queue = [...urls.entries()];
  let done = 0;
  let failed = 0;

  const worker = async (): Promise<void> => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const [index, url] = item;
      try {
        const res = await fetch(url, { signal, credentials: 'omit' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        const contentType = (res.headers.get('content-type') ?? '').split(';')[0]?.trim() ?? '';
        files[`image-${pad(index + 1, width)}.${ext}`] = await convertImage(
          bytes,
          contentType,
          format,
        );
      } catch (err) {
        if (signal?.aborted) throw err;
        failed++;
      }
      done++;
      await onProgress?.({ phase: 'fetching', done, total, failed });
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (total > 0 && done === failed) {
    throw new Error('All image downloads failed');
  }

  await onProgress?.({ phase: 'zipping', done, total, failed });

  return { zip: zipSync(files, { level: 0 }), total, failed };
}

/** Wrap ZIP bytes in an object URL for downloading. Caller revokes it. */
export function zipBlobUrl(zip: Uint8Array): string {
  return URL.createObjectURL(new Blob([zip as BlobPart], { type: 'application/zip' }));
}
