import { isScrolling, start, stop } from '../lib/auto-scroller';
import { onMessage, removeAllListeners } from '../lib/messaging';

export default defineContentScript({
  matches: ['https://*.instagram.com/*'],
  runAt: 'document_idle',
  main(ctx) {
    console.log('[Instapper] content script loaded');

    onMessage('startAutoScroll', () => {
      if (isScrolling()) return { status: 'already-running' as const };
      start();
      return { status: 'started' as const };
    });

    onMessage('stopAutoScroll', () => {
      stop();
      return { status: 'stopped' as const };
    });

    onMessage('getStatus', () => ({
      isScrolling: isScrolling(),
    }));

    ctx.onInvalidated(() => {
      stop();
      removeAllListeners();
    });
  },
});
