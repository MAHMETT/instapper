import { scrapedImages } from '@/shared/storage';
import { CONFIG } from './config';

/** Check if an image is a profile/avatar photo based on alt text. */
function isProfileImage(img: HTMLImageElement): boolean {
  const alt = (img.alt ?? '').toLowerCase();
  return alt.includes('profile picture') || alt.includes("'s profile") || alt.includes('avatar');
}

/** Check if an image is inside a story tray or navigation. */
function isNonPostContainer(img: HTMLImageElement): boolean {
  return !!img.closest('header, nav, [role="navigation"], [role="tablist"], a[href*="/stories/"]');
}

/** Check if an image is a valid thumbnail — strict filtering. */
function isValidThumbnail(img: HTMLImageElement): boolean {
  const url = img.currentSrc || img.src;
  if (!url || url.startsWith('data:')) return false;

  // Hard block: profile/avatar images by alt text
  if (isProfileImage(img)) return false;

  // Hard block: non-post containers (header, nav, stories)
  if (isNonPostContainer(img)) return false;

  // Skip small images (icons, badges, emoji)
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (w > 0 && w < 50) return false;
  if (h > 0 && h < 50) return false;

  return true;
}

/**
 * Find thumbnail images using a two-strategy approach:
 *
 * Strategy 1 (primary): Images inside post links — most reliable.
 *   Avatars are NEVER inside a[href*="/p/"] or a[href*="/reel/"] links.
 *
 * Strategy 2 (fallback): Broader article search with strict filtering.
 *   Only used when strategy 1 finds nothing (empty grid, page not loaded).
 */
export function findImages(): string[] {
  const urls = new Set<string>();

  // Strategy 1: Images directly inside post links (highest confidence)
  for (const img of document.querySelectorAll<HTMLImageElement>(
    CONFIG.SELECTORS.POST_LINK_IMAGES,
  )) {
    if (isValidThumbnail(img)) {
      urls.add(img.currentSrc || img.src);
    }
  }

  // Strategy 2: Broader search — only if strategy 1 found nothing
  if (urls.size === 0) {
    for (const img of document.querySelectorAll<HTMLImageElement>(
      CONFIG.SELECTORS.ARTICLE_IMAGES,
    )) {
      if (isValidThumbnail(img)) {
        urls.add(img.currentSrc || img.src);
      }
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
