import { storage } from 'wxt/utils/storage';
import { DEFAULT_LOCALE } from '@/features/i18n/locale';
import { DEFAULT_DATE_RANGE_SETTINGS } from './date-range';
import type {
  CurrentSession,
  ExportJobState,
  ScrapedImage,
  ScrapedImages,
  ScrapeState,
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

/** JPEG by default: Instagram thumbnails already ship as JPEG, so the default
 * export stays byte-for-byte identical to the raw download. */
const DEFAULT_SETTINGS: Settings = {
  zipImageFormat: 'jpeg',
  dateRange: DEFAULT_DATE_RANGE_SETTINGS,
  locale: DEFAULT_LOCALE,
};

/** Fill in any preference added since the stored value was written. */
function withSettingsDefaults(value: unknown): Settings {
  return { ...DEFAULT_SETTINGS, ...(value as Partial<Settings> | null) };
}

/** User preferences. v1 stored only `zipImageFormat`, v2 added `dateRange`. */
export const settings = storage.defineItem<Settings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 3,
  migrations: {
    2: (oldValue: unknown) => withSettingsDefaults(oldValue),
    3: (oldValue: unknown) => withSettingsDefaults(oldValue),
  },
});

/** Merge a partial update, so one preference never clobbers the others. */
export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const current = await settings.getValue();
  await settings.setValue({ ...current, ...patch });
}

/** Set by the content script when scrolling stops at the date range floor. */
export const scrapeState = storage.defineItem<ScrapeState>('local:scrapeState', {
  fallback: { stoppedByRange: false },
});
