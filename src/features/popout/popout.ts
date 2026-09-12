import { browser } from 'wxt/browser';

const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 630;

/** Parse URL search params for popout mode and sender tab ID. */
export function parsePopoutParams(search: string): {
  popout: boolean;
  senderTabId: number | null;
} {
  const params = new URLSearchParams(search);
  const raw = params.get('senderTabId');
  const id = raw ? Number(raw) : null;
  return {
    popout: params.get('uilocation') === 'popout',
    senderTabId: id !== null && Number.isFinite(id) ? id : null,
  };
}

/** Check if the page is running in popout mode. */
export function isPopoutMode(): boolean {
  return parsePopoutParams(window.location.search).popout;
}

/** Get the sender tab ID from URL params. */
export function getSenderTabId(): number | null {
  return parsePopoutParams(window.location.search).senderTabId;
}

/** Build the URL for opening the popup in a new window. */
export function buildPopoutUrl(tabId?: number): string {
  const url = new URL(browser.runtime.getURL('/popup.html'));
  url.searchParams.set('uilocation', 'popout');
  if (tabId != null) url.searchParams.set('senderTabId', String(tabId));
  return url.toString();
}

/** Open the popup in a new browser window. */
export async function openPopoutWindow(tabId?: number): Promise<void> {
  const url = buildPopoutUrl(tabId);
  await browser.windows.create({
    url,
    type: 'popup',
    focused: true,
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
  });
}
