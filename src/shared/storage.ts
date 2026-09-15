import { storage } from 'wxt/utils/storage';
import type {
  CurrentSession,
  ExportJobState,
  ScrapedImages,
  ScrapingSession,
  Settings,
  UIState,
} from './types';

/** Single source of thumbnail data shared between popup and content script. */
export const scrapedImages = storage.defineItem<ScrapedImages>('local:scrapedImages', {
  fallback: [],
});

export const exportJob = storage.defineItem<ExportJobState>('local:exportJob', {
  fallback: { status: 'idle', phase: null, done: 0, total: 0, failed: 0 },
});

export const scrapingHistory = storage.defineItem<ScrapingSession[]>('local:scrapingHistory', {
  fallback: [],
});

export const uiState = storage.defineItem<UIState>('local:uiState', {
  fallback: { activeTab: 'home', subPage: null },
});

export const currentSession = storage.defineItem<CurrentSession | null>('local:currentSession', {
  fallback: null,
});

/** User preferences. JPEG by default: Instagram thumbnails already ship as JPEG,
 * so the default export stays byte-for-byte identical to the raw download. */
export const settings = storage.defineItem<Settings>('local:settings', {
  fallback: { zipImageFormat: 'jpeg' },
});
