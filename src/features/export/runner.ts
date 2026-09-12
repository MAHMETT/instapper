import { zipSync } from 'fflate';
import { exportFilename, extFromUrl } from '@/features/export/csv';
import { exportJob } from '@/shared/storage';
import type { ExportRunError, ExportRunResult } from '@/shared/types';

const CONCURRENCY = 4;

let activeController: AbortController | null = null;

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

export async function runExport(
  urls: string[],
  options?: { signal?: AbortSignal },
): Promise<ExportRunResult | ExportRunError> {
  if (urls.length === 0) {
    return { ok: false, error: 'No images to export' };
  }

  const controller = new AbortController();
  activeController = controller;

  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const total = urls.length;
  const width = String(total).length;
  const files: Record<string, Uint8Array> = {};
  let failed = 0;
  let done = 0;

  try {
    if (controller.signal.aborted) {
      throw new DOMException('Export aborted', 'AbortError');
    }

    await exportJob.setValue({
      status: 'running',
      phase: 'fetching',
      done: 0,
      total,
      failed: 0,
    });

    const queue = [...urls.entries()];
    const inFlight: Promise<void>[] = [];

    const worker = async (): Promise<void> => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        const [i, url] = item;
        const name = `image-${pad(i + 1, width)}.${extFromUrl(url)}`;
        try {
          const res = await fetch(url, { signal: controller.signal, credentials: 'omit' });
          if (!res.ok) {
            failed++;
          } else {
            const bytes = new Uint8Array(await res.arrayBuffer());
            files[name] = bytes;
          }
        } catch (_err) {
          if (controller.signal.aborted) {
            throw new DOMException('Export aborted', 'AbortError');
          }
          failed++;
        }
        done++;
        await exportJob.setValue({
          status: 'running',
          phase: 'fetching',
          done,
          total,
          failed,
        });
      }
    };

    for (let i = 0; i < CONCURRENCY; i++) {
      inFlight.push(worker());
    }
    await Promise.all(inFlight);

    if (Object.keys(files).length === 0) {
      const error = 'All image downloads failed';
      await exportJob.setValue({ status: 'error', phase: null, done, total, failed, error });
      return { ok: false, error };
    }

    await exportJob.setValue({ status: 'running', phase: 'zipping', done, total, failed });

    const zipped = zipSync(files, { level: 0 });
    const blob = new Blob([zipped as BlobPart], { type: 'application/zip' });
    const blobUrl = URL.createObjectURL(blob);
    const filename = exportFilename('zip');

    const result: ExportRunResult = { ok: true, blobUrl, filename, total, failed };
    await exportJob.setValue({ status: 'done', phase: null, done, total, failed, filename });
    return result;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      const error = 'Export canceled';
      await exportJob.setValue({ status: 'idle', phase: null, done: 0, total: 0, failed: 0 });
      return { ok: false, error };
    }
    const error = err instanceof Error ? err.message : String(err);
    await exportJob.setValue({ status: 'error', phase: null, done, total, failed, error });
    return { ok: false, error };
  } finally {
    activeController = null;
  }
}

export function cancelExport(): void {
  activeController?.abort();
}
