import { defineExtensionMessaging } from '@webext-core/messaging';
import type { ScrapedImage } from './types';

/**
 * Cross-context message contract.
 * - startAutoScroll / stopAutoScroll / getStatus  -> sent to tab (content script)
 * - startExport / cancelExport                     -> sent to background
 */
export interface ProtocolMap {
  startAutoScroll(): { status: 'started' | 'already-running' };
  stopAutoScroll(): { status: 'stopped' };
  getStatus(): { isScrolling: boolean };
  startExport(images: ScrapedImage[]): { ok: boolean; error?: string };
  cancelExport(): void;
}

export const { sendMessage, onMessage, removeAllListeners } =
  defineExtensionMessaging<ProtocolMap>();
