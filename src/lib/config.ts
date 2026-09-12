export const CONFIG = {
  /** Interval ticker untuk memicu muat konten berikutnya (fallback bila observer tidak menangkap mutasi). */
  SCROLL_INTERVAL_MS: 5000,
  /** Jeda setelah scroll sebelum scrape pengaman dijalankan. */
  LOAD_WAIT_MS: 2500,
  /** Debounce scrape saat MutationObserver mendeteksi node/src baru. */
  MUTATION_DEBOUNCE_MS: 500,
  SELECTORS: {
    ARTICLE_IMAGES: 'article img',
    FALLBACK_IMAGES: 'a[href^="/p/"] img',
    MAIN_CONTAINER: 'main',
  },
} as const;
