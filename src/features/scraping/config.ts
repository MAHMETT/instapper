export const CONFIG = {
  /** Scroll interval to trigger loading next content (fallback when observer misses mutations). */
  SCROLL_INTERVAL_MS: 5000,
  /** Delay after scroll before safety scrape runs. */
  LOAD_WAIT_MS: 2500,
  /** Debounce scrape when MutationObserver detects new nodes/src attributes. */
  MUTATION_DEBOUNCE_MS: 500,
  SELECTORS: {
    ARTICLE_IMAGES: 'article img',
    FALLBACK_IMAGES: 'a[href^="/p/"] img',
    MAIN_CONTAINER: 'main',
  },
} as const;
