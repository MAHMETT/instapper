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

import { DEFAULT_LOCALE } from '@/features/i18n/locale';
import { DEFAULT_DATE_RANGE_SETTINGS } from '@/shared/date-range';
import { scrapedImages, scrapingHistory, settings, updateSettings } from '@/shared/storage';
import type { Settings } from '@/shared/types';

interface ItemOptions {
  version?: number;
  migrations?: Record<number, (value: unknown) => unknown>;
}

/**
 * Run every migration step from `fromVersion` up to the item's target version,
 * the way wxt does on a version bump.
 */
function runMigrations(item: unknown, fromVersion: number, value: unknown): unknown {
  const options = item as ItemOptions;
  const target = options.version ?? 1;

  let migrated = value;
  for (let version = fromVersion + 1; version <= target; version++) {
    migrated = options.migrations?.[version]?.(migrated) ?? migrated;
  }
  return migrated;
}

describe('scrapedImages storage migration', () => {
  it('is declared as v2 with a migration', () => {
    const options = scrapedImages as unknown as ItemOptions;
    expect(options.version).toBe(2);
    expect(typeof options.migrations?.[2]).toBe('function');
  });

  it('upgrades v1 url strings into undated images', () => {
    expect(runMigrations(scrapedImages, 1, ['https://a.jpg', 'https://b.jpg'])).toEqual([
      { url: 'https://a.jpg', takenAt: null },
      { url: 'https://b.jpg', takenAt: null },
    ]);
  });

  it('leaves already-migrated values untouched, so it can run twice', () => {
    const value = [{ url: 'https://a.jpg', takenAt: 1234 }];
    expect(runMigrations(scrapedImages, 1, value)).toEqual(value);
  });

  it('drops entries that are not urls', () => {
    const messy = ['https://a.jpg', 42, null, undefined, {}, { url: 'https://b.jpg' }];
    expect(runMigrations(scrapedImages, 1, messy)).toEqual([
      { url: 'https://a.jpg', takenAt: null },
      { url: 'https://b.jpg', takenAt: null },
    ]);
  });

  it('coerces a missing takenAt to null', () => {
    expect(runMigrations(scrapedImages, 1, [{ url: 'https://a.jpg' }])).toEqual([
      { url: 'https://a.jpg', takenAt: null },
    ]);
  });

  it('survives a non-array value', () => {
    expect(runMigrations(scrapedImages, 1, null)).toEqual([]);
    expect(runMigrations(scrapedImages, 1, 'nonsense')).toEqual([]);
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

    const migrated = runMigrations(scrapingHistory, 1, sessions) as Record<string, unknown>[];

    expect(migrated[0]?.id).toBe('session-1');
    expect(migrated[0]?.date).toBe(1700000000000);
    expect(migrated[0]?.sourceUrl).toBe('https://instagram.com/explore/tags/cats/');
    expect(migrated[0]?.images).toEqual([
      { url: 'https://a.jpg', takenAt: null },
      { url: 'https://b.jpg', takenAt: null },
    ]);
  });

  it('tolerates sessions with no images field', () => {
    const migrated = runMigrations(scrapingHistory, 1, [{ id: 'x' }]) as Record<string, unknown>[];
    expect(migrated[0]?.images).toEqual([]);
    expect(migrated[0]?.id).toBe('x');
  });

  it('survives a non-array value', () => {
    expect(runMigrations(scrapingHistory, 1, null)).toEqual([]);
  });
});

describe('settings storage migration', () => {
  it('is declared as v3, with a migration from v1 and from v2', () => {
    const options = settings as unknown as ItemOptions;
    expect(options.version).toBe(3);
    expect(typeof options.migrations?.[2]).toBe('function');
    expect(typeof options.migrations?.[3]).toBe('function');
  });

  it('fills in every preference when upgrading from v1', () => {
    expect(runMigrations(settings, 1, { zipImageFormat: 'png' })).toEqual({
      zipImageFormat: 'png',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
      locale: DEFAULT_LOCALE,
    });
  });

  // A v2 install already has a date range; it must gain the locale, not lose it.
  it('adds the locale when upgrading from v2 without touching the date range', () => {
    expect(
      runMigrations(settings, 2, {
        zipImageFormat: 'png',
        dateRange: { preset: '1m', from: null, to: null },
      }),
    ).toEqual({
      zipImageFormat: 'png',
      dateRange: { preset: '1m', from: null, to: null },
      locale: DEFAULT_LOCALE,
    });
  });

  it('defaults the interface language to Indonesian', () => {
    expect((runMigrations(settings, 1, {}) as Settings).locale).toBe('id');
  });

  it('keeps a stored language', () => {
    expect((runMigrations(settings, 2, { locale: 'en' }) as Settings).locale).toBe('en');
  });

  it('falls back to defaults when nothing is stored', () => {
    expect(runMigrations(settings, 1, undefined)).toEqual({
      zipImageFormat: 'jpeg',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
      locale: DEFAULT_LOCALE,
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
      locale: 'en',
    });

    await updateSettings({ zipImageFormat: 'png' });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: { preset: '1m', from: null, to: null },
      locale: 'en',
    });
  });

  it('stores the date range without disturbing the zip format', async () => {
    await settings.setValue({
      zipImageFormat: 'png',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
      locale: DEFAULT_LOCALE,
    });

    await updateSettings({
      dateRange: { preset: 'custom', from: '2026-01-10', to: '2026-01-20' },
    });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: { preset: 'custom', from: '2026-01-10', to: '2026-01-20' },
      locale: DEFAULT_LOCALE,
    });
  });

  it('changes the language without disturbing the other preferences', async () => {
    await settings.setValue({
      zipImageFormat: 'png',
      dateRange: { preset: '3m', from: null, to: null },
      locale: DEFAULT_LOCALE,
    });

    await updateSettings({ locale: 'en' });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: { preset: '3m', from: null, to: null },
      locale: 'en',
    });
  });

  it('starts from the defaults when nothing is stored yet', async () => {
    store.delete('local:settings');

    await updateSettings({ zipImageFormat: 'png' });

    expect(await settings.getValue()).toEqual({
      zipImageFormat: 'png',
      dateRange: DEFAULT_DATE_RANGE_SETTINGS,
      locale: DEFAULT_LOCALE,
    });
  });
});
