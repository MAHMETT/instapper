import { describe, expect, it, vi } from 'vitest';

vi.mock('wxt/utils/storage', () => ({
  storage: {
    defineItem: () => ({ getValue: vi.fn(), setValue: vi.fn() }),
  },
}));

import { getUniqueImages } from '@/features/scraping/scraper';
import type { ScrapedImage } from '@/shared/types';

const AT = Date.UTC(2026, 0, 1);
const LATER = Date.UTC(2026, 5, 1);

function image(url: string, takenAt: number | null = null): ScrapedImage {
  return { url, takenAt };
}

describe('getUniqueImages', () => {
  it('adds new entries and counts them', () => {
    const result = getUniqueImages([], [image('https://a.jpg', AT), image('https://b.jpg')]);
    expect(result.addedCount).toBe(2);
    expect(result.datedCount).toBe(0);
    expect(result.updatedList).toEqual([image('https://a.jpg', AT), image('https://b.jpg')]);
  });

  it('returns 0 addedCount when all found already exist', () => {
    const existing = [image('https://a.jpg', AT), image('https://b.jpg', LATER)];
    const result = getUniqueImages(existing, [
      image('https://a.jpg', AT),
      image('https://b.jpg', LATER),
    ]);
    expect(result.addedCount).toBe(0);
    expect(result.updatedList).toEqual(existing);
  });

  it('handles empty existing + non-empty found', () => {
    const result = getUniqueImages([], [image('https://x.jpg')]);
    expect(result.addedCount).toBe(1);
    expect(result.updatedList).toEqual([image('https://x.jpg')]);
  });

  it('handles non-empty existing + empty found', () => {
    const existing = [image('https://a.jpg')];
    const result = getUniqueImages(existing, []);
    expect(result.addedCount).toBe(0);
    expect(result.updatedList).toEqual(existing);
  });

  it('handles duplicates within found (deduped, first one wins)', () => {
    const result = getUniqueImages(
      [],
      [image('https://a.jpg', AT), image('https://a.jpg', LATER), image('https://b.jpg')],
    );
    expect(result.addedCount).toBe(2);
    expect(result.updatedList).toEqual([image('https://a.jpg', AT), image('https://b.jpg')]);
  });

  it('filters out falsy/empty URLs from found', () => {
    const result = getUniqueImages([], [image('https://a.jpg'), image(''), image('https://b.jpg')]);
    expect(result.addedCount).toBe(2);
    expect(result.updatedList.map((i) => i.url)).toEqual(['https://a.jpg', 'https://b.jpg']);
  });

  // Thumbnails stored before dates were tracked must pick one up on re-scrape,
  // otherwise the date filter could never see them.
  it('backfills a missing date from a later scrape', () => {
    const result = getUniqueImages([image('https://a.jpg', null)], [image('https://a.jpg', AT)]);
    expect(result.addedCount).toBe(0);
    expect(result.datedCount).toBe(1);
    expect(result.updatedList).toEqual([image('https://a.jpg', AT)]);
  });

  it('never overwrites a date that is already known', () => {
    const result = getUniqueImages([image('https://a.jpg', AT)], [image('https://a.jpg', LATER)]);
    expect(result.datedCount).toBe(0);
    expect(result.updatedList).toEqual([image('https://a.jpg', AT)]);
  });

  it('keeps the original ordering when backfilling', () => {
    const existing = [image('a', null), image('b', LATER), image('c', null)];
    const result = getUniqueImages(existing, [image('c', AT), image('a', AT)]);
    expect(result.updatedList.map((i) => i.url)).toEqual(['a', 'b', 'c']);
    expect(result.datedCount).toBe(2);
  });

  it('handles empty inputs', () => {
    expect(getUniqueImages([], [])).toEqual({ updatedList: [], addedCount: 0, datedCount: 0 });
  });
});
