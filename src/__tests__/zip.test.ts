import { describe, expect, it } from 'vitest';
import { folderFor, sortedByDate } from '@/features/export/zip';
import type { ScrapedImage } from '@/shared/types';

function image(url: string, takenAt: number | null): ScrapedImage {
  return { url, takenAt };
}

describe('folderFor', () => {
  it('zero-pads the month', () => {
    expect(folderFor(new Date(2025, 0, 9, 12).getTime())).toBe('2025-01');
    expect(folderFor(new Date(2025, 8, 30, 12).getTime())).toBe('2025-09');
    expect(folderFor(new Date(2025, 11, 1, 12).getTime())).toBe('2025-12');
  });

  it('files undated thumbnails under a clearly named folder', () => {
    expect(folderFor(null)).toBe('unknown-date');
  });
});

describe('sortedByDate', () => {
  it('orders oldest first', () => {
    const ordered = sortedByDate([
      image('newest', Date.UTC(2026, 5, 1)),
      image('oldest', Date.UTC(2025, 0, 1)),
      image('middle', Date.UTC(2026, 1, 1)),
    ]);
    expect(ordered.map((i) => i.url)).toEqual(['oldest', 'middle', 'newest']);
  });

  it('keeps undated thumbnails last, in their original order', () => {
    const ordered = sortedByDate([
      image('undated-a', null),
      image('dated', Date.UTC(2026, 0, 1)),
      image('undated-b', null),
    ]);
    expect(ordered.map((i) => i.url)).toEqual(['dated', 'undated-a', 'undated-b']);
  });

  it('does not mutate the input', () => {
    const input = [image('b', Date.UTC(2026, 1, 1)), image('a', Date.UTC(2026, 0, 1))];
    sortedByDate(input);
    expect(input.map((i) => i.url)).toEqual(['b', 'a']);
  });

  it('handles an empty list', () => {
    expect(sortedByDate([])).toEqual([]);
  });
});
