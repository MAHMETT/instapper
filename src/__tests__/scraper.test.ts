import { describe, expect, it, vi } from 'vitest';

vi.mock('wxt/utils/storage', () => ({
  storage: {
    defineItem: () => ({ getValue: vi.fn(), setValue: vi.fn() }),
  },
}));

import { getUniqueImages } from '@/features/scraping/scraper';

describe('getUniqueImages', () => {
  it('returns new entries and addedCount when all found are new', () => {
    const result = getUniqueImages([], ['https://a.jpg', 'https://b.jpg']);
    expect(result.addedCount).toBe(2);
    expect(result.updatedList).toEqual(['https://a.jpg', 'https://b.jpg']);
  });

  it('returns 0 addedCount when all found already exist', () => {
    const existing = ['https://a.jpg', 'https://b.jpg'];
    const result = getUniqueImages(existing, ['https://a.jpg', 'https://b.jpg']);
    expect(result.addedCount).toBe(0);
    expect(result.updatedList).toEqual(existing);
  });

  it('handles empty existing + non-empty found', () => {
    const result = getUniqueImages([], ['https://x.jpg']);
    expect(result.addedCount).toBe(1);
    expect(result.updatedList).toEqual(['https://x.jpg']);
  });

  it('handles non-empty existing + empty found', () => {
    const existing = ['https://a.jpg'];
    const result = getUniqueImages(existing, []);
    expect(result.addedCount).toBe(0);
    expect(result.updatedList).toEqual(existing);
  });

  it('handles duplicates within found (deduped)', () => {
    const result = getUniqueImages([], ['https://a.jpg', 'https://a.jpg', 'https://b.jpg']);
    expect(result.addedCount).toBe(2);
    expect(result.updatedList).toEqual(['https://a.jpg', 'https://b.jpg']);
  });

  it('filters out falsy/empty URLs from found', () => {
    const result = getUniqueImages([], ['https://a.jpg', '', 'https://b.jpg']);
    expect(result.addedCount).toBe(2);
    expect(result.updatedList).toEqual(['https://a.jpg', 'https://b.jpg']);
  });
});
