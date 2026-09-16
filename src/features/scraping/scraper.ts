import { scrapedImages } from '@/shared/storage';
import type { ScrapedImage } from '@/shared/types';
import { CONFIG } from './config';
import { publishedAtFromHref } from './post-date';

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
 * Publish time of the post a thumbnail belongs to. The shortcode in the
 * surrounding post link encodes it; anything undecodable stays null and is kept
 * by the date filter rather than hidden.
 */
function publishedAtFor(img: HTMLImageElement): number | null {
  return publishedAtFromHref(img.closest('a[href]')?.getAttribute('href'));
}

function collect(selector: string, into: Map<string, ScrapedImage>): void {
  for (const img of document.querySelectorAll<HTMLImageElement>(selector)) {
    if (!isValidThumbnail(img)) continue;
    const url = img.currentSrc || img.src;
    if (!url || into.has(url)) continue;
    into.set(url, { url, takenAt: publishedAtFor(img) });
  }
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
export function findImages(): ScrapedImage[] {
  const found = new Map<string, ScrapedImage>();

  // Strategy 1: Images directly inside post links (highest confidence)
  collect(CONFIG.SELECTORS.POST_LINK_IMAGES, found);

  // Strategy 2: Broader search — only if strategy 1 found nothing
  if (found.size === 0) {
    collect(CONFIG.SELECTORS.ARTICLE_IMAGES, found);
  }

  return [...found.values()];
}

/** Merge found images into the existing list, preserving the original order. */
export function getUniqueImages(
  existing: ScrapedImage[],
  found: ScrapedImage[],
): { updatedList: ScrapedImage[]; addedCount: number; datedCount: number } {
  const byUrl = new Map(existing.map((image) => [image.url, image]));
  let addedCount = 0;
  let datedCount = 0;

  for (const image of found) {
    if (!image.url) continue;

    const current = byUrl.get(image.url);
    if (!current) {
      byUrl.set(image.url, image);
      addedCount++;
    } else if (current.takenAt === null && image.takenAt !== null) {
      // Re-scraping fills in dates for thumbnails stored before we tracked them.
      byUrl.set(image.url, { ...current, takenAt: image.takenAt });
      datedCount++;
    }
  }

  return { updatedList: [...byUrl.values()], addedCount, datedCount };
}

/** Scrape the page, persist any new images, and return how many were added. */
export async function scrapeAndStore(): Promise<number> {
  const found = findImages();
  if (found.length === 0) return 0;

  const existing = await scrapedImages.getValue();
  const { updatedList, addedCount, datedCount } = getUniqueImages(existing, found);

  if (addedCount > 0 || datedCount > 0) {
    await scrapedImages.setValue(updatedList);
  }

  return addedCount;
}
