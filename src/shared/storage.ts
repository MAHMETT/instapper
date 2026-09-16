import { storage } from 'wxt/utils/storage';
import type {
  CurrentSession,
  ExportJobState,
  ScrapedImage,
  ScrapedImages,
  ScrapingSession,
  Settings,
  UIState,
} from './types';

/** Accept both shapes so migrations stay idempotent. */
function toScrapedImages(value: unknown): ScrapedImage[] {
  if (!Array.isArray(value)) return [];
  const images: ScrapedImage[] = [];
  for (const entry of value) {
    if (typeof entry === 'string') {
      images.push({ url: entry, takenAt: null });
    } else if (entry && typeof (entry as ScrapedImage).url === 'string') {
      const image = entry as ScrapedImage;
      images.push({ url: image.url, takenAt: image.takenAt ?? null });
    }
  }
  return images;
}

function toScrapingSessions(value: unknown): ScrapingSession[] {
  if (!Array.isArray(value)) return [];
  return value.map((session) => ({
    ...(session as ScrapingSession),
    images: toScrapedImages((session as { images?: unknown })?.images),
  }));
}

/**
 * Single source of thumbnail data shared between popup and content script.
 * v1 stored bare URL strings, so v2 backfills a null publish time for them.
 */
export const scrapedImages = storage.defineItem<ScrapedImages>('local:scrapedImages', {
  fallback: [],
  version: 2,
  migrations: {
    2: (oldValue: unknown) => toScrapedImages(oldValue),
  },
});

export const exportJob = storage.defineItem<ExportJobState>('local:exportJob', {
  fallback: { status: 'idle', phase: null, done: 0, total: 0, failed: 0 },
});

export const scrapingHistory = storage.defineItem<ScrapingSession[]>('local:scrapingHistory', {
  fallback: [],
  version: 2,
  migrations: {
    2: (oldValue: unknown) => toScrapingSessions(oldValue),
  },
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
