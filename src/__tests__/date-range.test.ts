import { describe, expect, it } from 'vitest';
import {
  boundsForPreset,
  boundsForRange,
  dayBound,
  filterByDateRange,
  lowerBoundFor,
  toDateInputValue,
} from '@/shared/date-range';
import type { ScrapedImage } from '@/shared/types';

// Local noon avoids DST edges, and keeps assertions timezone-independent.
const NOW = new Date(2026, 5, 15, 12, 0, 0).getTime();

function image(url: string, takenAt: number | null): ScrapedImage {
  return { url, takenAt };
}

describe('boundsForPreset', () => {
  it('leaves all-dates unbounded', () => {
    expect(boundsForPreset('all', NOW)).toEqual({ from: null, to: null });
  });

  it('leaves the custom preset unbounded so explicit bounds are used instead', () => {
    expect(boundsForPreset('custom', NOW)).toEqual({ from: null, to: null });
  });

  it('moves the lower bound back by the preset month count', () => {
    expect(boundsForPreset('8m', NOW)).toEqual({
      from: new Date(2025, 9, 15, 12, 0, 0).getTime(),
      to: null,
    });
    expect(boundsForPreset('1m', NOW)).toEqual({
      from: new Date(2026, 4, 15, 12, 0, 0).getTime(),
      to: null,
    });
    expect(boundsForPreset('12m', NOW)).toEqual({
      from: new Date(2025, 5, 15, 12, 0, 0).getTime(),
      to: null,
    });
  });
});

describe('dayBound', () => {
  it('parses a date at the start of the day', () => {
    expect(dayBound('2026-06-15', 'start')).toBe(new Date(2026, 5, 15, 0, 0, 0, 0).getTime());
  });

  it('parses a date at the very end of the day, so the range is inclusive', () => {
    expect(dayBound('2026-06-15', 'end')).toBe(new Date(2026, 5, 15, 23, 59, 59, 999).getTime());
  });

  it('returns null for empty or unparseable values', () => {
    expect(dayBound('', 'start')).toBeNull();
    expect(dayBound('not-a-date', 'start')).toBeNull();
  });
});

describe('toDateInputValue', () => {
  it('zero-pads month and day', () => {
    expect(toDateInputValue(new Date(2026, 0, 5, 12).getTime())).toBe('2026-01-05');
    expect(toDateInputValue(new Date(2026, 11, 31, 12).getTime())).toBe('2026-12-31');
  });
});

describe('filterByDateRange', () => {
  const images = [
    image('old', Date.UTC(2020, 0, 1)),
    image('recent', Date.UTC(2026, 5, 1)),
    image('undated', null),
    image('future', Date.UTC(2030, 0, 1)),
  ];

  it('returns the list untouched when unbounded', () => {
    expect(filterByDateRange(images, { from: null, to: null })).toBe(images);
  });

  it('drops thumbnails published before the lower bound', () => {
    const kept = filterByDateRange(images, { from: Date.UTC(2026, 0, 1), to: null });
    expect(kept.map((i) => i.url)).toEqual(['recent', 'undated', 'future']);
  });

  it('drops thumbnails published after the upper bound', () => {
    const kept = filterByDateRange(images, { from: null, to: Date.UTC(2026, 11, 31) });
    expect(kept.map((i) => i.url)).toEqual(['old', 'recent', 'undated']);
  });

  it('always keeps undated thumbnails, even in an empty window', () => {
    const kept = filterByDateRange(images, {
      from: Date.UTC(2029, 0, 1),
      to: Date.UTC(2029, 11, 31),
    });
    expect(kept.map((i) => i.url)).toEqual(['undated']);
  });

  it('treats both bounds as inclusive', () => {
    const at = Date.UTC(2026, 5, 15);
    expect(filterByDateRange([image('at', at)], { from: at, to: at })).toHaveLength(1);
  });

  it('supports an upper bound only', () => {
    const kept = filterByDateRange(images, { from: null, to: Date.UTC(2025, 0, 1) });
    expect(kept.map((i) => i.url)).toEqual(['old', 'undated']);
  });
});

describe('boundsForRange', () => {
  it('resolves a preset window', () => {
    expect(boundsForRange({ preset: 'all', from: null, to: null }, NOW)).toEqual({
      from: null,
      to: null,
    });
    expect(boundsForRange({ preset: '8m', from: null, to: null }, NOW)).toEqual({
      from: new Date(2025, 9, 15, 12, 0, 0).getTime(),
      to: null,
    });
  });

  it('resolves a custom window, including the whole end day', () => {
    expect(boundsForRange({ preset: 'custom', from: '2026-01-10', to: '2026-01-20' }, NOW)).toEqual(
      {
        from: new Date(2026, 0, 10, 0, 0, 0, 0).getTime(),
        to: new Date(2026, 0, 20, 23, 59, 59, 999).getTime(),
      },
    );
  });

  it('leaves a blank custom window unbounded', () => {
    expect(boundsForRange({ preset: 'custom', from: null, to: null }, NOW)).toEqual({
      from: null,
      to: null,
    });
  });
});

describe('lowerBoundFor', () => {
  it('returns the floor for a preset', () => {
    expect(lowerBoundFor({ preset: '1m', from: null, to: null }, NOW)).toBe(
      new Date(2026, 4, 15, 12, 0, 0).getTime(),
    );
  });

  it('returns the custom start when set', () => {
    expect(lowerBoundFor({ preset: 'custom', from: '2026-01-10', to: null }, NOW)).toBe(
      new Date(2026, 0, 10, 0, 0, 0, 0).getTime(),
    );
  });

  // A null floor is what keeps the scroller from ever auto-stopping.
  it('returns null when the range has no floor', () => {
    expect(lowerBoundFor({ preset: 'all', from: null, to: null }, NOW)).toBeNull();
    expect(lowerBoundFor({ preset: 'custom', from: null, to: '2026-01-20' }, NOW)).toBeNull();
  });
});
