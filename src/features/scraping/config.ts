export const CONFIG = {
  /** Scroll interval to trigger loading next content (fallback when observer misses mutations). */
  SCROLL_INTERVAL_MS: 5000,
  /** Delay after scroll before safety scrape runs. */
  LOAD_WAIT_MS: 2500,
  /** Debounce scrape when MutationObserver detects new nodes/src attributes. */
  MUTATION_DEBOUNCE_MS: 500,
  /** Minimum image dimension to consider as a thumbnail (px). */
  MIN_THUMBNAIL_SIZE: 110,
  SELECTORS: {
    /** Images inside post links — most reliable for thumbnails. */
    POST_LINK_IMAGES: 'a[href*="/p/"] img, a[href*="/reel/"] img',
    /** Broader fallback: images in article grids. */
    ARTICLE_IMAGES: 'article img',
    /** Container for scroll detection. */
    MAIN_CONTAINER: 'main',
  },
  /** CSS class fragments that indicate non-thumbnail images (avatars, icons, stories). */
  SKIP_CLASS_PATTERNS: ['avatar', 'profile', 'story', 'emoji', 'badge', 'icon', 'sticker'],
} as const;
