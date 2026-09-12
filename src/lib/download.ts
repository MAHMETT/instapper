import { browser } from 'wxt/browser';
import type { DownloadPayload, DownloadResult } from './types';

export function buildDataUrl(data: string, filename: string): string {
  const ext = filename.split('.').pop() ?? '';
  const mime = ext === 'json' ? 'application/json' : 'text/csv';
  return `data:${mime};charset=utf-8,${encodeURIComponent(data)}`;
}

export async function downloadFile(
  payload: DownloadPayload,
): Promise<DownloadResult> {
  try {
    const url = buildDataUrl(payload.data, payload.filename);
    await browser.downloads.download({
      url,
      filename: payload.filename,
      saveAs: true,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
