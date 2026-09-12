import { downloadFile } from '../lib/download';
import { onMessage } from '../lib/messaging';

export default defineBackground(() => {
  onMessage('downloadCsv', async (message) => downloadFile(message.data));

  browser.runtime.onInstalled.addListener(() => {
    console.log('Instapper installed', { id: browser.runtime.id });
  });
});
