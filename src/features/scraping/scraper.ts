import { scrapedImages } from '@/shared/storage';
import { CONFIG } from './config';

/** Check if an image element is a valid thumbnail (not an avatar, icon, or placeholder). */
function isValidThumbnail(img: HTMLImageElement): boolean {
  const url = img.currentSrc || img.src;
  if (!url || url.startsWith('data:')) return false;
  // Skip very small images (avatars, icons, emoji) — thumbnails are always ≥ 50 px
  if (img.naturalWidth > 0 && img.naturalWidth < 50) return false;
  if (img.naturalHeight > 0 && img.naturalHeight < 50) return false;
  return true;
}

/** Query DOM for image URLs, falling back to post-link images if the primary set is empty. */
export function findImages(): string[] {
  const urls = new Set<string>();

  for (const img of document.querySelectorAll<HTMLImageElement>(CONFIG.SELECTORS.ARTICLE_IMAGES)) {
    if (isValidThumbnail(img)) urls.add(img.currentSrc || img.src);
  }

  if (urls.size === 0) {
    for (const img of document.querySelectorAll<HTMLImageElement>(
      CONFIG.SELECTORS.FALLBACK_IMAGES,
    )) {
      if (isValidThumbnail(img)) urls.add(img.currentSrc || img.src);
    }
  }

  return [...urls];
}

/** Merge found URLs into the existing list, returning only genuinely new entries. */
export function getUniqueImages(
  existing: string[],
  found: string[],
): { updatedList: string[]; addedCount: number } {
  const set = new Set(existing);
  let addedCount = 0;

  for (const url of found) {
    if (url && !set.has(url)) {
      set.add(url);
      addedCount++;
    }
  }

  return { updatedList: [...set], addedCount };
}

/** Scrape the page, persist any new images, and return how many were added. */
export async function scrapeAndStore(): Promise<number> {
  const found = findImages();
  if (found.length === 0) return 0;

  const existing = await scrapedImages.getValue();
  const { updatedList, addedCount } = getUniqueImages(existing, found);

  if (addedCount > 0) {
    await scrapedImages.setValue(updatedList);
  }

  return addedCount;
}
