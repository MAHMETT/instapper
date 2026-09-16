import type { MessageKey } from '@/features/i18n/locale';
import type { DateRangeSettings, ScrapedImage } from './types';

/** Windows the UI can filter by; `custom` uses explicit bounds instead. */
export type DateRangePreset = 'all' | '1m' | '3m' | '6m' | '8m' | '12m' | 'custom';

/** Product default: the last eight months. */
export const DEFAULT_DATE_RANGE: DateRangePreset = '8m';

/** Default filter state, shared by the storage fallback and the UI. */
export const DEFAULT_DATE_RANGE_SETTINGS: DateRangeSettings = {
  preset: DEFAULT_DATE_RANGE,
  from: null,
  to: null,
};

export const DATE_RANGE_OPTIONS: ReadonlyArray<{ value: DateRangePreset; labelKey: MessageKey }> = [
  { value: 'all', labelKey: 'range.all' },
  { value: '1m', labelKey: 'range.1m' },
  { value: '3m', labelKey: 'range.3m' },
  { value: '6m', labelKey: 'range.6m' },
  { value: '8m', labelKey: 'range.8m' },
  { value: '12m', labelKey: 'range.12m' },
  { value: 'custom', labelKey: 'range.custom' },
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

/** Resolve the persisted filter into concrete bounds. */
export function boundsForRange(range: DateRangeSettings, now: number = Date.now()): DateBounds {
  if (range.preset !== 'custom') return boundsForPreset(range.preset, now);

  return {
    from: dayBound(range.from ?? '', 'start'),
    to: dayBound(range.to ?? '', 'end'),
  };
}

/**
 * The oldest a scrape may descend to before it is walking further back in time
 * than the user asked for. Null when the range has no floor.
 */
export function lowerBoundFor(range: DateRangeSettings, now: number = Date.now()): number | null {
  return boundsForRange(range, now).from;
}
