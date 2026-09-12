import { browser } from 'wxt/browser';
import { cancelExport, runExport } from '@/features/export/runner';
import { onMessage } from '@/shared/messaging';

async function ensureOffscreen(): Promise<void> {
  const url = browser.runtime.getURL('/offscreen.html');
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [url],
  });
  if (contexts.length > 0) return;
  await chrome.offscreen.createDocument({
    url: '/offscreen.html',
    reasons: ['BLOBS'],
    justification: 'Fetch thumbnails and create ZIP blob for download',
  });
}

export default defineBackground({
  type: 'module',
  main() {
    // Listen for TRIGGER_DOWNLOAD from the offscreen document
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.target === 'background' && msg.type === 'TRIGGER_DOWNLOAD') {
        browser.downloads.download({
          url: msg.blobUrl,
          filename: msg.filename,
          saveAs: false,
        });
      }
    });

    if (import.meta.env.FIREFOX) {
      onMessage('startExport', async (message) => {
        const result = await runExport(message.data);
        if (result.ok) {
          await browser.downloads.download({
            url: result.blobUrl,
            filename: result.filename,
            saveAs: false,
          });
        }
        return result;
      });

      onMessage('cancelExport', async () => {
        cancelExport();
      });
    } else {
      onMessage('startExport', async (message) => {
        await ensureOffscreen();
        chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'START_EXPORT',
          urls: message.data,
        });
        return { ok: true };
      });

      onMessage('cancelExport', async () => {
        chrome.runtime.sendMessage({ target: 'offscreen', type: 'CANCEL_EXPORT' });
      });
    }

    browser.runtime.onInstalled.addListener(() => {
      console.log('Instapper installed', { id: browser.runtime.id });
    });
  },
});
