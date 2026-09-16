import { derived, get, writable } from 'svelte/store';
import type { Locale } from '@/shared/types';
import { en } from './messages.en';
import { id } from './messages.id';

/** Default interface language. */
export const DEFAULT_LOCALE: Locale = 'id';

/** Languages offered in Settings, in display order. */
export const LOCALES: readonly Locale[] = ['id', 'en'];

export type MessageParams = Record<string, string | number>;

/** A message is either a plain string or a function for counts and the like. */
export type Message = string | ((params: MessageParams) => string);

/** Every key the English catalog defines; other catalogs must match it exactly. */
export type MessageKey = keyof typeof en;

const CATALOGS: Record<Locale, Record<MessageKey, Message>> = { en, id };

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'id';
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/** Look a key up in a specific locale. */
export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const message = CATALOGS[locale][key];
  return typeof message === 'function' ? message(params ?? {}) : interpolate(message, params);
}

/** BCP 47 tag for each UI language, for `Intl` formatting. */
const INTL_TAG: Record<Locale, string> = { en: 'en-GB', id: 'id-ID' };

/** Date and time rendered in the user's interface language. */
export function formatDateTime(timestamp: number, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

/** Date only, rendered in the user's interface language. */
export function formatDate(timestamp: number, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

const localeStore = writable<Locale>(DEFAULT_LOCALE);

/** The active locale. Use inside components so the store is tracked. */
export const currentLocale = { subscribe: localeStore.subscribe };

/** The active locale, for plain (non-reactive) code. */
export function getLocale(): Locale {
  return get(localeStore);
}

export function setLocale(next: Locale): void {
  localeStore.set(next);
}

/**
 * Translation function exposed as a store, so components can call `$t('key')`
 * and re-render whenever the language changes.
 */
export const t = derived(
  localeStore,
  (locale) =>
    (key: MessageKey, params?: MessageParams): string =>
      translate(locale, key, params),
);
