<script lang="ts">
import { browser } from 'wxt/browser';
import { getSenderTabId, isPopoutMode, openPopoutWindow } from '@/features/popout/popout';
import { toggleTheme as doToggleTheme, getStoredTheme, type Theme } from '@/features/theme/theme';
import BottomTabBar from './components/BottomTabBar.svelte';
import BrandHeader from './components/BrandHeader.svelte';
import AboutPage from './pages/AboutPage.svelte';
import ExtractPage from './pages/ExtractPage.svelte';
import HistoryPage from './pages/HistoryPage.svelte';
import HomePage from './pages/HomePage.svelte';

// ── State ────────────────────────────────────────────────
const detached = $state(isPopoutMode());
let activeTab = $state<'home' | 'history' | 'about'>('home');
let subPage = $state<string | null>(null);
let connected = $state(false);
let tabId = $state<number | undefined>(undefined);
let theme = $state<Theme>(getStoredTheme());

// ── Tab resolution ───────────────────────────────────────
async function resolveTab(): Promise<void> {
  if (detached) {
    const senderTabId = getSenderTabId();
    if (senderTabId) {
      try {
        const tab = await browser.tabs.get(senderTabId);
        if (tab.url?.includes('instagram.com')) {
          tabId = tab.id;
          connected = true;
          return;
        }
      } catch {
        /* tab closed — try fallback */
      }
    }
    try {
      const tabs = await browser.tabs.query({ url: '*://*.instagram.com/*' });
      const tab = tabs[0];
      if (tab) {
        tabId = tab.id;
        connected = true;
        return;
      }
    } catch {
      /* no instagram tab */
    }
    tabId = undefined;
    connected = false;
  } else {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab) return;
    tabId = tab.id;
    connected = !!tab.url?.includes('instagram.com');
  }
}

// ── Effects ──────────────────────────────────────────────

// Apply detached class to body for layout adaptation
$effect(() => {
  if (detached) document.body.classList.add('detached');
  return () => document.body.classList.remove('detached');
});

// Initialize
$effect(() => {
  resolveTab();
});

// ── Navigation ───────────────────────────────────────────
function handleTabChange(tab: string) {
  activeTab = tab as 'home' | 'history' | 'about';
  subPage = null;
}

function handleNavigate(page: string) {
  subPage = page;
}

function handleBack() {
  subPage = null;
}

function handleToggleTheme() {
  theme = doToggleTheme();
}

async function handlePopout() {
  await openPopoutWindow(tabId);
}
</script>

<div class="flex flex-col {detached ? 'min-h-screen' : 'min-h-[500px]'}">
  <div class="page-wrapper">
    <!-- Main pages (home/history/about) -->
    <div class="page {subPage === null ? 'page-active' : 'page-hidden-left'}">
      <BrandHeader {theme} {detached} onToggleTheme={handleToggleTheme} onPopout={handlePopout} />
      {#if activeTab === 'home'}
        <HomePage onNavigate={handleNavigate} />
      {:else if activeTab === 'history'}
        <HistoryPage />
      {:else}
        <AboutPage />
      {/if}
    </div>

    <!-- Extract sub-page -->
    <div class="page {subPage === 'extract' ? 'page-active' : 'page-hidden-right'}">
      <ExtractPage
        onBack={handleBack}
        {connected}
        {theme}
        {detached}
        onToggleTheme={handleToggleTheme}
        onPopout={handlePopout}
      />
    </div>
  </div>

  <BottomTabBar {activeTab} onTabChange={handleTabChange} />
</div>
