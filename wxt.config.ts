import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Instapper — Instagram Scraper',
    description:
      'Scrape and export image thumbnails from Instagram hashtag and profile pages.',
    permissions: ['storage', 'downloads', 'activeTab'],
    host_permissions: ['https://*.instagram.com/*'],
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      96: '/icon/96.png',
      128: '/icon/128.png',
    },
  },
});
