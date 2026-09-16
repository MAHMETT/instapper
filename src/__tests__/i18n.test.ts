import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isLocale, translate } from '@/features/i18n/locale';
import { en } from '@/features/i18n/messages.en';
import { id } from '@/features/i18n/messages.id';

describe('isLocale', () => {
  it('accepts the supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('id')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(2)).toBe(false);
  });
});

describe('defaults', () => {
  it('ships with Indonesian as the default language', () => {
    expect(DEFAULT_LOCALE).toBe('id');
  });
});

describe('catalogs', () => {
  it('define exactly the same key set', () => {
    expect(Object.keys(id).sort()).toEqual(Object.keys(en).sort());
  });

  it('have no blank messages', () => {
    for (const catalog of [en, id]) {
      for (const [key, value] of Object.entries(catalog)) {
        if (typeof value === 'string') {
          expect(value.trim(), key).not.toBe('');
        }
      }
    }
  });
});

describe('translate', () => {
  it('looks up a plain message per locale', () => {
    expect(translate('en', 'nav.home')).toBe('Home');
    expect(translate('id', 'nav.home')).toBe('Beranda');
  });

  it('interpolates parameters', () => {
    expect(translate('en', 'progress.fetching', { done: 2, total: 5 })).toBe('Fetching 2/5');
    expect(translate('id', 'progress.fetching', { done: 2, total: 5 })).toBe('Mengambil 2/5');
  });

  it('leaves placeholders it has no value for alone', () => {
    expect(translate('en', 'progress.fetching', {})).toBe('Fetching {done}/{total}');
  });

  it('pluralises English but not Indonesian', () => {
    expect(translate('en', 'export.count', { count: 1 })).toBe('1 thumbnail will be downloaded.');
    expect(translate('en', 'export.count', { count: 2 })).toBe('2 thumbnails will be downloaded.');
    expect(translate('id', 'export.count', { count: 1 })).toBe('1 thumbnail akan diunduh.');
    expect(translate('id', 'export.count', { count: 2 })).toBe('2 thumbnail akan diunduh.');
  });

  it('switches wording on the chosen layout', () => {
    expect(translate('en', 'export.progressBody', { count: 3, layout: 'by-date' })).toContain(
      'filing them by month',
    );
    expect(translate('en', 'export.progressBody', { count: 3, layout: 'flat' })).toContain(
      'keeping one flat folder',
    );
    expect(translate('id', 'export.progressBody', { count: 3, layout: 'by-date' })).toContain(
      'menyusunnya per bulan',
    );
  });

  it('mentions failures only when there are some', () => {
    expect(translate('en', 'export.doneBody', { exported: 3, failed: 0 })).toBe(
      '3 thumbnails downloaded.',
    );
    expect(translate('en', 'export.doneBody', { exported: 3, failed: 2 })).toBe(
      '3 thumbnails downloaded, 2 could not be fetched.',
    );
    expect(translate('id', 'export.doneBody', { exported: 3, failed: 2 })).toBe(
      '3 thumbnail berhasil diunduh, 2 gagal diambil.',
    );
  });
});
