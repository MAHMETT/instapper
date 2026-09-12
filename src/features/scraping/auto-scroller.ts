import { CONFIG } from './config';
import { scrapeAndStore } from './scraper';

let scrolling = false;
let scrollTimer: ReturnType<typeof setInterval> | null = null;
let loadWaitTimer: ReturnType<typeof setTimeout> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let observer: MutationObserver | null = null;

function performScroll(): void {
  window.scrollTo(0, document.body.scrollHeight);

  const main = document.querySelector<HTMLElement>(CONFIG.SELECTORS.MAIN_CONTAINER);
  if (main) {
    main.scrollTop = main.scrollHeight;
  }
}

export function start(): void {
  if (scrolling) return;
  scrolling = true;

  // Initial scrape
  void scrapeAndStore();

  // Observe DOM mutations and debounce re-scrape
  const target = document.querySelector(CONFIG.SELECTORS.MAIN_CONTAINER) ?? document.body;
  observer = new MutationObserver(() => {
    if (!scrolling) return;
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void scrapeAndStore();
    }, CONFIG.MUTATION_DEBOUNCE_MS);
  });
  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });

  // Scroll ticker — fires periodically, waits for content to load, then scrapes
  scrollTimer = setInterval(() => {
    if (!scrolling) return;

    performScroll();

    loadWaitTimer = setTimeout(() => {
      if (scrolling) {
        void scrapeAndStore();
      }
    }, CONFIG.LOAD_WAIT_MS);
  }, CONFIG.SCROLL_INTERVAL_MS);
}

export function stop(): void {
  scrolling = false;

  if (scrollTimer !== null) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
  if (loadWaitTimer !== null) {
    clearTimeout(loadWaitTimer);
    loadWaitTimer = null;
  }
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  observer?.disconnect();
  observer = null;
}

export function isScrolling(): boolean {
  return scrolling;
}
