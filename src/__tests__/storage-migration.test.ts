import { describe, expect, it, vi } from 'vitest';

// Capture the options each storage item is defined with, so the real migration
// functions run exactly as wxt would invoke them. Each item also gets a working
// in-memory getValue/setValue so merge behaviour can be exercised.
const { defineItemMock, store } = vi.hoisted(() => {
  const store = new Map<string, unknown>();
  const defineItemMock = vi.fn((key: string, options: Record<string, unknown>) => ({
    ...options,
    getValue: async () => (store.has(key) ? store.get(key) : options.fallback),
    setValue: async (value: unknown) => {
      store.set(key, value);
    },
  }));
  return { defineItemMock, store };
});

vi.mock('wxt/utils/storage', () => ({ storage: { defineItem: defineItemMock } }));

import { DEFAULT_DATE_RANGE_SETTINGS } from '@/shared/date-range';
import { scrapedImages, scrapingHistory, settings, updateSettings } from '@/shared/storage';

interface ItemOptions {
  version?: number;
  migrations?: Record<number, (value: unknown) => unknown>;
}

/** Run the v2 migration for a storage item, the way wxt does on version bump. */
function migrateToV2(item: unknown, value: unknown): unknown {
  const options = item as ItemOptions;
  return options.migrations?.[2]?.(value);
}

describe('scrapedImages storage migration', () => {
  it('is declared as v2 with a migration', () => {
    const options = scrapedImages as unknown as ItemOptions;
    expect(options.version).toBe(2);
    expect(typeof options.migrations?.[2]).toBe('function');
  });

  it('upgrades v1 url strings into undated images', () => {
    expect(migrateToV2(scrapedImages, ['https://a.jpg', 'https://b.jpg'])).toEqual([
      { url: 'https://a.jpg', takenAt: null },
      { url: 'https://b.jpg', takenAt: null },
    ]);
  });

  it('leaves already-migrated values untouched, so it can run twice', () => {
    const value = [{ url: 'https://a.jpg', takenAt: 1234 }];
    expect(migrateToV2(scrapedImages, value)).toEqual(value);
  });

  it('drops entries that are not urls', () => {
    const messy = ['https://a.jpg', 42, null, undefined, {}, { url: 'https://b.jpg' }];
    expect(migrateToV2(scrapedImages, messy)).toEqual([
      { url: 'https://a.jpg', takenAt: null },
      { url: 'https://b.jpg', takenAt: null },
    ]);
  });

  it('coerces a missing takenAt to null', () => {
    expect(migrateToV2(scrapedImages, [{ url: 'https://a.jpg' }])).toEqual([
      { url: 'https://a.jpg', takenAt: null },
    ]);
  });

  it('survives a non-array value', () => {
    expect(migrateToV2(scrapedImages, null)).toEqual([]);
    expect(migrateToV2(scrapedImages, 'nonsense')).toEqual([]);
  });
});

describe('scrapingHistory storage migration', () => {
  it('is declared as v2 with a migration', () => {
    const options = scrapingHistory as unknown as ItemOptions;
    expect(options.version).toBe(2);
    expect(typeof options.migrations?.[2]).toBe('function');
  });

  it('upgrades each session image list while preserving session fields', () => {
    const sessions = [
      {
        id: 'session-1',
        date: 1700000000000,
        sourceUrl: 'https://instagram.com/explore/tags/cats/',
        thumbnailCount: 2,
        images: ['https://a.jpg', 'https://b.jpg'],
      },
    ];

    const migrated = migrateToV2(scrapingHistory, sessions) as Record<string, unknown>[];

    expect(migrated[0]?.id).toBe('session-1');
    expect(migrated[0]?.date).toBe(1700000000000);
    expect(migrated[0]?.sourceUrl).toBe('https://instagram.com/explore/tags/cats/');
    expect(migrated[0]?.images).toEqual([
      { url: 'https://a.jpg', takenAt: null },
      { url: 'https://b.jpg', takenAt: null },
    ]);
  });

  it('tolerates sessions with no images field', () => {
    const migrated = migrateToV2(scrapingHistory, [{ id: 'x' }]) as Record<string, unknown>[];
    expect(migrated[0]?.images).toEqual([]);
    expect(migrated[0]?.id).toBe('x');
  });

  it('survives a non-array value', () => {
    expect(migrateToV2(scrapingHistory, null)).toEqual([]);
  });
});

describe('settings storage migration', () => {
  it('is declared as v2 with a migration', () => {
    const options = settings as unknown as ItemOptions;
    expect(options.version).toBe(2);
    expect(typeof options.migrations?.[2]).toBe('function');
  });

  it('adds the default date range when upgrading from v1', () => {
    expect(migrateToV2(settings, { zipImageFormat: 'png' })).toEqual({
      zipImageFormat: 'png',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
    });
  });

  it('keeps a stored date range, so it can run twice', () => {
    const value = {
      zipImageFormat: 'png',
      dateRange: { preset: '1m', from: null, to: null },
    };
    expect(migrateToV2(settings, value)).toEqual(value);
  });

  it('falls back to defaults when nothing is stored', () => {
    expect(migrateToV2(settings, undefined)).toEqual({
      zipImageFormat: 'jpeg',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
    });
  });
});

describe('updateSettings', () => {
  // Regression: writing the whole object from one page used to wipe the other
  // page's preference.
  it('merges a patch instead of replacing everything', async () => {
    await settings.setValue({
      zipImageFormat: 'jpeg',
      dateRange: { preset: '1m', from: null, to: null },
    });

    await updateSettings({ zipImageFormat: 'png' });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: { preset: '1m', from: null, to: null },
    });
  });

  it('stores the date range without disturbing the zip format', async () => {
    await settings.setValue({
      zipImageFormat: 'png',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
    });

    await updateSettings({
      dateRange: { preset: 'custom', from: '2026-01-10', to: '2026-01-20' },
    });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: { preset: 'custom', from: '2026-01-10', to: '2026-01-20' },
    });
  });

  it('starts from the defaults when nothing is stored yet', async () => {
    store.delete('local:settings');

    await updateSettings({ zipImageFormat: 'png' });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
    });
  });
});
