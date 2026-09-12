<script lang="ts">
import { browser } from 'wxt/browser';
import ActionBar from '../../lib/components/ActionBar.svelte';
import BrandHeader from '../../lib/components/BrandHeader.svelte';
import ConfirmClearDialog from '../../lib/components/ConfirmClearDialog.svelte';
import StatsCard from '../../lib/components/StatsCard.svelte';
import { exportImagesZip } from '../../lib/export';
import { sendMessage } from '../../lib/messaging';
import { scrapedImages } from '../../lib/storage';
import { toggleTheme as doToggleTheme, getStoredTheme, type Theme } from '../../lib/theme';
import type { ExportProgress as ExportProgressType } from '../../lib/types';

// ── State ────────────────────────────────────────────────
let connected = $state(false);
let count = $state(0);
let scrolling = $state(false);
let message = $state('');
let messageType = $state<'info' | 'error'>('info');
let showClearModal = $state(false);
let tabId = $state<number | undefined>(undefined);
let prevCount = $state(0);
let pop = $state(false);
let popTimer: ReturnType<typeof setTimeout> | undefined;
let theme = $state<Theme>(getStoredTheme());

// Export state
let exporting = $state(false);
let exportProgress = $state<ExportProgressType | null>(null);
let abortController = $state<AbortController | null>(null);

// ── Derived ──────────────────────────────────────────────
const badgeText = $derived(connected ? 'Connected' : 'Ready');
const canDownload = $derived(count > 0);
const exportPercent = $derived(
  exportProgress && exportProgress.total > 0
    ? Math.round((exportProgress.done / exportProgress.total) * 100)
    : 0,
);

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
        abortController?.abort();
      } else if (showClearModal) {
        showClearModal = false;
      }
    }
  }
  window.addEventListener('keydown', onKeydown);
  return () => window.removeEventListener('keydown', onKeydown);
});

// Abort export on popup teardown
$effect(() => {
  return () => {
    abortController?.abort();
  };
});

// Initialize: active tab, count, scrolling state
$effect(() => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const tab = tabs[0];
    if (!tab) return;
    tabId = tab.id;
    connected = !!tab.url?.includes('instagram.com');

    scrapedImages.getValue().then((images) => {
      count = images.length;
    });

    if (connected && tab.id !== undefined) {
      sendMessage('getStatus', undefined, tab.id)
        .then((res) => {
          scrolling = res.isScrolling;
        })
        .catch(() => {});
    }
  });

  const unwatch = scrapedImages.watch((images) => {
    count = images.length;
  });

  return () => {
    unwatch();
  };
});

// ── Handlers ─────────────────────────────────────────────

function handleToggleTheme() {
  theme = doToggleTheme();
}

async function handleStart() {
  if (tabId === undefined) return;
  scrolling = true;
  message = '';
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
  const csv = `\uFEFF"Image URL"\n${images.map((u) => `"${u}"`).join('\n')}`;
  const filename = `instapper_thumbnails_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  try {
    const res = await sendMessage('downloadCsv', { data: csv, filename });
    if (res.success) {
      message = 'Download started.';
      messageType = 'info';
    } else {
      message = res.error || 'Download failed.';
      messageType = 'error';
    }
  } catch {
    message = 'Download failed.';
    messageType = 'error';
  }
}

async function confirmClear() {
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

<div class="flex min-h-[500px] flex-col gap-4 p-4">
  <BrandHeader {connected} {theme} onToggleTheme={handleToggleTheme} />

  <main class="flex flex-1 flex-col rounded-xl border border-border bg-surface p-6">
    <div class="mb-5">
      <h1 class="text-lg font-bold text-fg">Extract thumbnails</h1>
      <p class="mt-1 text-sm text-fg-secondary">Grab thumbnails. Instantly.</p>
    </div>

    <StatsCard {count} {pop} />

    <div class="mt-auto">
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
