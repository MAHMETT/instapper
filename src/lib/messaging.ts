import { defineExtensionMessaging } from '@webext-core/messaging';
import type { DownloadPayload, DownloadResult } from './types';

/**
 * Kontrak pesan antar konteks.
 * - startAutoScroll / stopAutoScroll / getStatus  -> dikirim ke tab (content script)
 * - downloadCsv                                   -> dikirim ke background
 */
export interface ProtocolMap {
  startAutoScroll(): { status: 'started' | 'already-running' };
  stopAutoScroll(): { status: 'stopped' };
  getStatus(): { isScrolling: boolean };
  downloadCsv(payload: DownloadPayload): DownloadResult;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
