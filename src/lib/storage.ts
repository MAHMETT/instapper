import { storage } from 'wxt/utils/storage';
import type { ScrapedImages } from './types';

/** Sumber tunggal data thumbnail yang dibagikan popup dan content script. */
export const scrapedImages = storage.defineItem<ScrapedImages>('local:scrapedImages', {
  fallback: [],
});
