import { lowerBoundFor } from '@/shared/date-range';
import { scrapeState, settings } from '@/shared/storage';
import { CONFIG } from './config';
import { scrapeAndStore } from './scraper';

/** Consecutive out-of-range passes before the scroller gives up. */
const OUT_OF_RANGE_PASSES_TO_STOP = 3;

let scrolling = false;
let scrollTimer: ReturnType<typeof setInterval> | null = null;
let loadWaitTimer: ReturnType<typeof setTimeout> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let observer: MutationObserver | null = null;
let outOfRangePasses = 0;
let passInFlight = false;

function performScroll(): void {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  const main = document.querySelector<HTMLElement>(CONFIG.SELECTORS.MAIN_CONTAINER);
  if (main) {
    main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
  }
}

/**
 * Scrape once, then give up if the page has scrolled past the selected range.
 *
 * Runs at most one pass at a time: overlapping passes would each read the same
 * stored list and the later write would drop the earlier one's additions.
 *
 * ponytail: the stop test is a heuristic — three passes in a row whose *newest*
 * thumbnail is already older than the floor. It assumes a roughly
 * reverse-chronological, viewport-windowed grid, so a non-chronological explore
 * page could stop early. Require an explicit "load more" signal if that bites.
 */
async function pass(): Promise<void> {
  if (passInFlight) return;
  passInFlight = true;

  try {
    const { seenDates } = await scrapeAndStore();
    if (!scrolling) return;

    const { dateRange } = await settings.getValue();
    const floor = lowerBoundFor(dateRange);
    const newest = seenDates.length > 0 ? Math.max(...seenDates) : null;

    if (floor === null || newest === null || newest >= floor) {
      outOfRangePasses = 0;
      return;
    }

    outOfRangePasses++;
    if (outOfRangePasses >= OUT_OF_RANGE_PASSES_TO_STOP) {
      stop();
      await scrapeState.setValue({ stoppedByRange: true });
    }
  } finally {
    passInFlight = false;
  }
}

export function start(): void {
  if (scrolling) return;
  scrolling = true;
  outOfRangePasses = 0;
  void scrapeState.setValue({ stoppedByRange: false });

  // Initial scrape
  void pass();

  // Observe DOM mutations and debounce re-scrape
  const target = document.querySelector(CONFIG.SELECTORS.MAIN_CONTAINER) ?? document.body;
  observer = new MutationObserver(() => {
    if (!scrolling) return;
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void pass();
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
        void pass();
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
