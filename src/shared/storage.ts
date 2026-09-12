import { storage } from 'wxt/utils/storage';
import type { ExportJobState, ScrapedImages } from './types';

/** Single source of thumbnail data shared between popup and content script. */
export const scrapedImages = storage.defineItem<ScrapedImages>('local:scrapedImages', {
  fallback: [],
});

export const exportJob = storage.defineItem<ExportJobState>('local:exportJob', {
  fallback: { status: 'idle', phase: null, done: 0, total: 0, failed: 0 },
});
