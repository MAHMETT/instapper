<script lang="ts">
import { browser } from 'wxt/browser';
import { buildCsv, exportFilename } from '@/features/export/csv';
import { exportImagesZip } from '@/features/export/export';
import { isPopoutMode } from '@/features/popout/popout';
import type { Theme } from '@/features/theme/theme';
import { sendMessage } from '@/shared/messaging';
import { currentSession, exportJob, scrapedImages, scrapingHistory } from '@/shared/storage';
import type { ExportProgress as ExportProgressType, ScrapingSession } from '@/shared/types';
import ActionBar from '../components/ActionBar.svelte';
import BrandHeader from '../components/BrandHeader.svelte';
import ConfirmClearDialog from '../components/ConfirmClearDialog.svelte';
import StatsCard from '../components/StatsCard.svelte';

let {
  onBack,
  connected,
  theme,
  detached,
  onToggleTheme,
  onPopout,
}: {
  onBack: () => void;
  connected: boolean;
  theme: Theme;
  detached: boolean;
  onToggleTheme: () => void;
  onPopout: () => void;
} = $props();

let count = $state(0);
let scrolling = $state(false);
let message = $state('');
let messageType = $state<'info' | 'error'>('info');
let showClearModal = $state(false);
let tabId = $state<number | undefined>(undefined);
let prevCount = $state(0);
let pop = $state(false);
let popTimer: ReturnType<typeof setTimeout> | undefined;

// Export state
let exporting = $state(false);
let exportProgress = $state<ExportProgressType | null>(null);
let abortController = $state<AbortController | null>(null);

// ── Derived ──────────────────────────────────────────────
const canDownload = $derived(count > 0);
const exportPercent = $derived(
  exportProgress && exportProgress.total > 0
    ? Math.round((exportProgress.done / exportProgress.total) * 100)
    : 0,
);

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

  // Priority 2: find any Instagram tab
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

  // Priority 3: check active tab (non-detached only)
  if (!detached) {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (tab?.url?.includes('instagram.com')) {
        tabId = tab.id;
        connected = true;
        return;
      }
    } catch {
      /* ignore */
    }
  }

  tabId = undefined;
  connected = false;
}

async function switchToTab() {
  if (tabId === undefined) return;
  try {
    const tab = await browser.tabs.get(tabId);
    if (tab.windowId) {
      await browser.windows.update(tab.windowId, { focused: true });
    }
    await browser.tabs.update(tabId, { active: true });
  } catch {
    /* ignore */
  }
}

// ── Effects ──────────────────────────────────────────────

// Animate stat pop on count change
$effect(() => {
  if (count !== prevCount && prevCount > 0) {
    pop = true;
    clearTimeout(popTimer);
    popTimer = setTimeout(() => {
      pop = false;
    }, 300);
  }
  prevCount = count;
});

// Escape key closes modal / cancels export
$effect(() => {
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (exporting) {
        sendMessage('cancelExport');
      } else if (showClearModal) {
        showClearModal = false;
      }
    }
  }
  window.addEventListener('keydown', onKeydown);
  return () => window.removeEventListener('keydown', onKeydown);
});

// Initialize: target tab, count, scrolling state
$effect(() => {
  resolveTab().then(() => {
    scrapedImages.getValue().then((images) => {
      count = images.length;
    });

    if (tabId !== undefined) {
      sendMessage('getStatus', undefined, tabId)
        .then((res) => {
          scrolling = res.isScrolling;
        })
        .catch(() => {});
    }
  });

  const unwatch = scrapedImages.watch((images) => {
    count = images.length;
  });

  const unwatchJob = exportJob.watch((state) => {
    if (state.status === 'running') {
      exporting = true;
      if (state.phase === 'fetching' || state.phase === 'zipping') {
        exportProgress = { phase: state.phase, done: state.done, total: state.total };
      }
      message = '';
    } else if (state.status === 'done') {
      exporting = false;
      exportProgress = null;
      if (state.failed > 0) {
        message = `Exported ${state.total - state.failed} images, ${state.failed} failed.`;
        messageType = 'error';
      } else {
        message = `Exported ${state.total} images.`;
        messageType = 'info';
      }
    } else if (state.status === 'error') {
      exporting = false;
      exportProgress = null;
      message = state.error || 'Export failed.';
      messageType = 'error';
    } else {
      if (exporting) {
        exporting = false;
        exportProgress = null;
        message = 'Export canceled.';
        messageType = 'info';
      }
    }
  });

  return () => {
    unwatch();
    unwatchJob();
  };
});

// ── Handlers ─────────────────────────────────────────────

async function handleStart() {
  if (tabId === undefined) return;
  scrolling = true;
  message = '';
  try {
    const tabs = detached
      ? await browser.tabs.query({ url: '*://*.instagram.com/*' })
      : await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab?.url) {
      tabId = tab.id;
      await currentSession.setValue({ sourceUrl: tab.url, startTime: Date.now(), tabId: tab.id });
    }
  } catch {
    /* ignore */
  }
  try {
    await sendMessage('startAutoScroll', undefined, tabId);
  } catch {
    scrolling = false;
    message = 'Refresh the Instagram page and try again.';
    messageType = 'error';
  }
}

async function handleStop() {
  if (tabId === undefined) return;
  try {
    await sendMessage('stopAutoScroll', undefined, tabId);
  } catch {
    /* content script may not be present */
  }
  scrolling = false;
}

async function handleDownload() {
  const images = await scrapedImages.getValue();
  if (images.length === 0) return;
  const csv = buildCsv(images);
  const filename = exportFilename('csv');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    await browser.downloads.download({ url: blobUrl, filename, saveAs: true });
    message = 'Download started.';
    messageType = 'info';
  } catch {
    message = 'Download failed.';
    messageType = 'error';
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}

async function confirmClear() {
  const images = await scrapedImages.getValue();
  const session = await currentSession.getValue();
  if (images.length > 0) {
    const entry: ScrapingSession = {
      id: crypto.randomUUID(),
      date: Date.now(),
      sourceUrl: session?.sourceUrl ?? 'unknown',
      thumbnailCount: images.length,
      images,
    };
    const history = await scrapingHistory.getValue();
    const updated = [entry, ...history].slice(0, 50);
    await scrapingHistory.setValue(updated);
  }
  await currentSession.setValue(null);
  await scrapedImages.setValue([]);
  showClearModal = false;
  count = 0;
  message = 'Data cleared.';
  messageType = 'info';
}

async function handleExport() {
  if (exporting) return;
  const images = await scrapedImages.getValue();
  if (images.length === 0) return;

  const controller = new AbortController();
  abortController = controller;
  exporting = true;
  exportProgress = null;
  message = '';

  try {
    const result = await exportImagesZip(images, {
      signal: controller.signal,
      onProgress: (p) => {
        exportProgress = p;
      },
    });

    if (result.failed > 0) {
      message = `Exported ${result.total - result.failed} images, ${result.failed} failed.`;
      messageType = 'error';
    } else {
      message = `Exported ${result.total} images.`;
      messageType = 'info';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      message = 'Export canceled.';
      messageType = 'info';
    } else {
      message = err instanceof Error ? err.message : 'Export failed.';
      messageType = 'error';
    }
  } finally {
    exporting = false;
    exportProgress = null;
    abortController = null;
  }
}
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
  <BrandHeader {theme} {detached} compact {onToggleTheme} {onPopout}>
    {#snippet children()}
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-surface-secondary hover:text-fg focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        aria-label="Back to Home"
        onclick={onBack}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    {/snippet}
    {#snippet status()}
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide transition-colors hover:brightness-110 {connected
          ? 'bg-success/15 text-success'
          : 'bg-surface-secondary text-fg-muted'}"
        onclick={switchToTab}
        title={connected ? 'Switch to connected tab' : 'No Instagram tab found'}
      >
        {#if connected}
          <span class="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
        {/if}
        {connected ? 'Connected' : 'Ready'}
      </button>
    {/snippet}
  </BrandHeader>

  <main class="flex flex-1 flex-col rounded-xl border border-border bg-surface p-6">
    <div class="mb-5">
      <h1 class="text-lg font-bold text-fg">Extract thumbnails</h1>
      <p class="mt-1 text-sm text-fg-secondary">Grab thumbnails. Instantly.</p>
    </div>

    <StatsCard {count} {pop} />

    <div class="mt-4">
      <ActionBar
        {scrolling}
        {canDownload}
        {exporting}
        {exportProgress}
        {exportPercent}
        onStart={handleStart}
        onStop={handleStop}
        onDownload={handleDownload}
        onExport={handleExport}
        onExportCancel={() => abortController?.abort()}
        onClear={() => (showClearModal = true)}
      />

      {#if message}
        <p
          class="mt-3 text-center text-xs min-h-[18px] {messageType === 'error'
            ? 'text-danger'
            : 'text-fg-muted'}"
          aria-live="polite"
        >
          {message}
        </p>
      {/if}
    </div>
  </main>

  <ConfirmClearDialog bind:open={showClearModal} onConfirm={confirmClear} />
</div>
