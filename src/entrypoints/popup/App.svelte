<script lang="ts">
import { browser } from 'wxt/browser';
import { DEFAULT_LOCALE, isLocale, setLocale } from '@/features/i18n/locale';
import { getSenderTabId, isPopoutMode, openPopoutWindow } from '@/features/popout/popout';
import { toggleTheme as doToggleTheme, getStoredTheme, type Theme } from '@/features/theme/theme';
import { currentSession, settings, uiState } from '@/shared/storage';
import type { Locale, ScrapingSession } from '@/shared/types';
import BottomTabBar from './components/BottomTabBar.svelte';
import BrandHeader from './components/BrandHeader.svelte';
import AboutPage from './pages/AboutPage.svelte';
import ExtractPage from './pages/ExtractPage.svelte';
import HistoryDetailPage from './pages/HistoryDetailPage.svelte';
import HistoryPage from './pages/HistoryPage.svelte';
import HomePage from './pages/HomePage.svelte';
import SettingsPage from './pages/SettingsPage.svelte';

// ── State ────────────────────────────────────────────────
const detached = $state(isPopoutMode());
let activeTab = $state<'home' | 'history' | 'about' | 'settings'>('home');
let subPage = $state<string | null>(null);
let connected = $state(false);
let tabId = $state<number | undefined>(undefined);
let theme = $state<Theme>(getStoredTheme());
let selectedSession = $state<ScrapingSession | null>(null);

// ── Tab resolution ───────────────────────────────────────
async function resolveTab(): Promise<void> {
  // Priority 1: use tabId from currentSession if scraping is active
  const session = await currentSession.getValue();
  if (session?.tabId) {
    try {
      const tab = await browser.tabs.get(session.tabId);
      if (tab.url?.includes('instagram.com')) {
        tabId = tab.id;
        connected = true;
        return;
      }
    } catch {
      /* tab closed */
    }
  }

  // Priority 2: existing logic
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
    // Try to find any Instagram tab first (even if not active)
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
    // Fallback: check active tab
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
  uiState.getValue().then((state) => {
    activeTab = state.activeTab;
    subPage = state.subPage;
  });
  resolveTab();
});

// Keep the interface language in sync with the stored preference, so changing
// it takes effect immediately and the detached window follows along.
$effect(() => {
  function apply(state: { locale: Locale }): void {
    setLocale(isLocale(state.locale) ? state.locale : DEFAULT_LOCALE);
  }

  settings.getValue().then(apply);
  return settings.watch(apply);
});

// ── Navigation ───────────────────────────────────────────
function handleTabChange(tab: string) {
  activeTab = tab as 'home' | 'history' | 'about' | 'settings';
  subPage = null;
  uiState.setValue({ activeTab, subPage: null });
}

function handleNavigate(page: string) {
  subPage = page;
  uiState.setValue({ activeTab, subPage: page });
}

function handleBack() {
  subPage = null;
  selectedSession = null;
  uiState.setValue({ activeTab, subPage: null });
}

function handleViewDetail(session: ScrapingSession) {
  selectedSession = session;
  subPage = 'historyDetail';
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
        <HistoryPage
          onNavigateToExtract={() => handleNavigate('extract')}
          onViewDetail={handleViewDetail}
        />
      {:else if activeTab === 'about'}
        <AboutPage />
      {:else}
        <SettingsPage />
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

    <!-- History detail sub-page -->
    <div class="page {subPage === 'historyDetail' ? 'page-active' : 'page-hidden-right'}">
      {#if selectedSession}
        <HistoryDetailPage
          session={selectedSession}
          images={selectedSession.images}
          onBack={handleBack}
        />
      {/if}
    </div>
  </div>

  <BottomTabBar {activeTab} onTabChange={handleTabChange} />
</div>
