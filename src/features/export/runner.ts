import { exportFilename } from '@/features/export/csv';
import { buildImageZip, zipBlobUrl } from '@/features/export/zip';
import { exportJob, settings } from '@/shared/storage';
import type { ExportRunError, ExportRunResult } from '@/shared/types';

let activeController: AbortController | null = null;

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

    const { zipImageFormat } = await settings.getValue();
    const { zip, failed } = await buildImageZip(urls, {
      format: zipImageFormat,
      signal: controller.signal,
      onProgress: (progress) =>
        exportJob.setValue({
          status: 'running',
          phase: progress.phase,
          done: progress.done,
          total: progress.total,
          failed: progress.failed,
        }),
    });

    const filename = exportFilename('zip');
    const result: ExportRunResult = { ok: true, blobUrl: zipBlobUrl(zip), filename, total, failed };

    await exportJob.setValue({ status: 'done', phase: null, done: total, total, failed, filename });

    return result;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      await exportJob.setValue({ status: 'idle', phase: null, done: 0, total: 0, failed: 0 });
      return { ok: false, error: 'Export canceled' };
    }
    const error = err instanceof Error ? err.message : String(err);
    await exportJob.setValue({ status: 'error', phase: null, done: 0, total, failed: 0, error });
    return { ok: false, error };
  } finally {
    activeController = null;
  }
}

export function cancelExport(): void {
  activeController?.abort();
}
