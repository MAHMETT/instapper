import { browser } from 'wxt/browser';
import { cancelExport, runExport } from '@/features/export/runner';

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.target !== 'offscreen') return false;

  if (msg.type === 'START_EXPORT') {
    const port = browser.runtime.connect({ name: 'export-keepalive' });

    runExport(msg.urls).then((result) => {
      if (result.ok) {
        browser.runtime.sendMessage({
          target: 'background',
          type: 'TRIGGER_DOWNLOAD',
          blobUrl: result.blobUrl,
          filename: result.filename,
        });
      }
      sendResponse(result);
      port.disconnect();
    });

    return true;
  }

  if (msg.type === 'CANCEL_EXPORT') {
    cancelExport();
    sendResponse({ ok: true });
    return true;
  }

  return false;
});
