import { zipSync } from 'fflate';
import type { ExportProgress, ExportResult } from './types';

export interface ExportImagesOptions {
  onProgress?: (p: ExportProgress) => void;
  signal?: AbortSignal;
  filename?: string;
}

/** Build a ZIP archive from a map of `filename -> raw bytes`. */
export function buildZip(files: Record<string, Uint8Array>): Uint8Array {
  return zipSync(files, { level: 0 });
}

/** Trigger a client-side download of a generated Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const EXT_RE = /\.(jpe?g|png|webp|gif|avif|heic)$/i;

function extFromUrl(url: string): string {
  const path = url.split(/[?#]/)[0] ?? url;
  const m = path.match(EXT_RE);
  if (!m?.[1]) return 'jpg';
  return m[1].toLowerCase().replace('jpeg', 'jpg');
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

const CONCURRENCY = 4;

/** Fetch every URL, bundle the images into a ZIP, and trigger a browser download. */
export async function exportImagesZip(
  urls: string[],
  options: ExportImagesOptions = {},
): Promise<ExportResult> {
  const { onProgress, signal, filename } = options;

  if (urls.length === 0) {
    return { ok: false, total: 0, failed: 0, error: 'No images to export' };
  }

  const total = urls.length;
  const width = String(total).length;
  const files: Record<string, Uint8Array> = {};
  let failed = 0;
  let done = 0;

  if (signal?.aborted) {
    throw new DOMException('Export aborted', 'AbortError');
  }

  try {
    // Worker-pool fetch with concurrency 4
    const inFlight: Promise<void>[] = [];
    const queue = [...urls.entries()];

    const worker = async (): Promise<void> => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        const [i, url] = item;
        const name = `image-${pad(i + 1, width)}.${extFromUrl(url)}`;
        try {
          const res = await fetch(url, {
            signal,
            credentials: 'omit',
          });
          if (!res.ok) {
            failed++;
          } else {
            const bytes = new Uint8Array(await res.arrayBuffer());
            files[name] = bytes;
          }
        } catch (_err) {
          if (signal?.aborted) {
            throw new DOMException('Export aborted', 'AbortError');
          }
          failed++;
        }
        done++;
        onProgress?.({ phase: 'fetching', done, total });
      }
    };

    for (let i = 0; i < CONCURRENCY; i++) {
      inFlight.push(worker());
    }
    await Promise.all(inFlight);

    if (Object.keys(files).length === 0) {
      return {
        ok: false,
        total,
        failed,
        error: 'All image downloads failed',
      };
    }

    onProgress?.({ phase: 'zipping', done: total, total });

    const zipped = buildZip(files);
    const blob = new Blob([zipped as BlobPart], { type: 'application/zip' });

    const zipName =
      filename ?? `instapper_thumbnails_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    downloadBlob(blob, zipName);

    return { ok: true, total, failed };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    return {
      ok: false,
      total,
      failed,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
