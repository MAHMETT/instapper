import type { ScrapedImage } from './types';

/** Windows the UI can filter by; `custom` uses explicit bounds instead. */
export type DateRangePreset = 'all' | '1m' | '3m' | '6m' | '8m' | '12m' | 'custom';

/** Product default: the last eight months. */
export const DEFAULT_DATE_RANGE: DateRangePreset = '8m';

export const DATE_RANGE_OPTIONS: ReadonlyArray<{ value: DateRangePreset; label: string }> = [
  { value: 'all', label: 'All dates' },
  { value: '1m', label: 'Last 1 month' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '8m', label: 'Last 8 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom range' },
];

const PRESET_MONTHS: Partial<Record<DateRangePreset, number>> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '8m': 8,
  '12m': 12,
};

/** Inclusive millisecond bounds; null means unbounded on that side. */
export interface DateBounds {
  from: number | null;
  to: number | null;
}

const UNBOUNDED: DateBounds = { from: null, to: null };

/** Resolve a preset into concrete bounds. */
export function boundsForPreset(preset: DateRangePreset, now: number = Date.now()): DateBounds {
  const months = PRESET_MONTHS[preset];
  if (months === undefined) return UNBOUNDED;

  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  return { from: from.getTime(), to: null };
}

/** Turn a `YYYY-MM-DD` input value into a bound at that day's start or end. */
export function dayBound(value: string, edge: 'start' | 'end'): number | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (edge === 'end') date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/** Format a timestamp for an `<input type="date">` value. */
export function toDateInputValue(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Keep thumbnails published inside the bounds. Undated thumbnails always stay:
 * dropping them would silently hide images while the on-screen counter still
 * counts them.
 */
export function filterByDateRange(images: ScrapedImage[], bounds: DateBounds): ScrapedImage[] {
  if (bounds.from === null && bounds.to === null) return images;

  return images.filter((image) => {
    if (image.takenAt === null) return true;
    if (bounds.from !== null && image.takenAt < bounds.from) return false;
    if (bounds.to !== null && image.takenAt > bounds.to) return false;
    return true;
  });
}
