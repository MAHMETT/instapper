import { onMessage } from '../lib/messaging';
import { downloadFile } from '../lib/download';

export default defineBackground(() => {
  onMessage('downloadCsv', async (message) => downloadFile(message.data));

  browser.runtime.onInstalled.addListener(() => {
    console.log('Instapper installed', { id: browser.runtime.id });
  });
});
