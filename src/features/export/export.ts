import { zipSync } from 'fflate';

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

export interface ExportImagesOptions {
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
  urls: string[],
  options: ExportImagesOptions = {},
): Promise<ExportImagesResult> {
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
    const queue = [...urls.entries()];
    const workers = Array.from({ length: 4 }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        const [i, url] = item;
        const name = `image-${pad(i + 1, width)}.${extFromUrl(url)}`;
        try {
          const res = await fetch(url, { signal, credentials: 'omit' });
          if (!res.ok) {
            failed++;
          } else {
            files[name] = new Uint8Array(await res.arrayBuffer());
          }
        } catch {
          if (signal?.aborted) throw new DOMException('Export aborted', 'AbortError');
          failed++;
        }
        done++;
        onProgress?.({ phase: 'fetching', done, total });
      }
    });

    await Promise.all(workers);

    if (Object.keys(files).length === 0) {
      return { ok: false, total, failed, error: 'All image downloads failed' };
    }

    onProgress?.({ phase: 'zipping', done: total, total });

    const zipped = zipSync(files, { level: 0 });
    const blob = new Blob([zipped as BlobPart], { type: 'application/zip' });
    const blobUrl = URL.createObjectURL(blob);
    const zipName =
      filename ?? `instapper_thumbnails_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;

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
