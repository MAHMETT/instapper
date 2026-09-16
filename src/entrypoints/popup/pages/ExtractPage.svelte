<script lang="ts">
import { ChevronLeft } from 'lucide-svelte';
import { browser } from 'wxt/browser';
import { buildCsv, exportFilename } from '@/features/export/csv';
import { exportImagesZip } from '@/features/export/export';
import { t } from '@/features/i18n/locale';
import type { Theme } from '@/features/theme/theme';
import {
  boundsForPreset,
  boundsForRange,
  DATE_RANGE_OPTIONS,
  type DateRangePreset,
  DEFAULT_DATE_RANGE_SETTINGS,
  filterByDateRange,
  toDateInputValue,
} from '@/shared/date-range';
import { sendMessage } from '@/shared/messaging';
import {
  currentSession,
  exportJob,
  scrapedImages,
  scrapeState,
  scrapingHistory,
  settings,
  updateSettings,
} from '@/shared/storage';
import type {
  DateRangeSettings,
  ExportOutcome,
  ExportPhase,
  ExportProgress as ExportProgressType,
  ScrapedImage,
  ScrapingSession,
  ZipGrouping,
} from '@/shared/types';
import ActionBar from '../components/ActionBar.svelte';
import BrandHeader from '../components/BrandHeader.svelte';
import ConfirmClearDialog from '../components/ConfirmClearDialog.svelte';
import ExportZipDialog from '../components/ExportZipDialog.svelte';
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

let images = $state<ScrapedImage[]>([]);
let scrolling = $state(false);
let message = $state('');
let messageType = $state<'info' | 'error'>('info');
let showClearModal = $state(false);
let showExportModal = $state(false);
let tabId = $state<number | undefined>(undefined);
let prevCount = $state(0);
let pop = $state(false);
let popTimer: ReturnType<typeof setTimeout> | undefined;

// Date range filter — persisted in settings, so it survives the popup closing
let dateRange = $state<DateRangeSettings>({ ...DEFAULT_DATE_RANGE_SETTINGS });

// Export state
let exporting = $state(false);
let exportProgress = $state<ExportProgressType | null>(null);
let exportPhase = $state<ExportPhase>('choose');
let exportOutcome = $state<ExportOutcome | null>(null);
let exportError = $state('');
let abortController = $state<AbortController | null>(null);

// ── Derived ──────────────────────────────────────────────
const count = $derived(images.length);
const bounds = $derived(boundsForRange(dateRange));
const visibleImages = $derived(filterByDateRange(images, bounds));
const visibleCount = $derived(visibleImages.length);
const canExport = $derived(visibleCount > 0);
const exportPercent = $derived(
  exportProgress && exportProgress.total > 0
    ? Math.round((exportProgress.done / exportProgress.total) * 100)
    : 0,
);

// ── Filter ───────────────────────────────────────────────
async function setPreset(preset: DateRangePreset) {
  let next: DateRangeSettings = { ...dateRange, preset };

  // Seed the custom window on first use so the inputs are never blank.
  if (preset === 'custom' && (!next.from || !next.to)) {
    const fallback = boundsForPreset('8m');
    next = {
      ...next,
      from: next.from ?? toDateInputValue(fallback.from ?? Date.now()),
      to: next.to ?? toDateInputValue(Date.now()),
    };
  }

  dateRange = next;
  await updateSettings({ dateRange: next });
}

async function setCustomFrom(value: string) {
  dateRange = { ...dateRange, from: value };
  await updateSettings({ dateRange });
}

async function setCustomTo(value: string) {
  dateRange = { ...dateRange, to: value };
  await updateSettings({ dateRange });
}

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
  if (visibleCount !== prevCount && prevCount > 0) {
    pop = true;
    clearTimeout(popTimer);
    popTimer = setTimeout(() => {
      pop = false;
    }, 300);
  }
  prevCount = visibleCount;
});

// Escape key cancels a running export, or closes the clear dialog
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

// Initialize: target tab, collection, persisted filter, scrolling state
$effect(() => {
  settings.getValue().then((state) => {
    dateRange = state.dateRange;
  });

  resolveTab().then(() => {
    scrapedImages.getValue().then((found) => {
      images = found;
    });

    if (tabId !== undefined) {
      sendMessage('getStatus', undefined, tabId)
        .then((res) => {
          scrolling = res.isScrolling;
        })
        .catch(() => {});
    }
  });

  const unwatch = scrapedImages.watch((found) => {
    images = found;
  });

  // Keep the filter in sync between the popup and the detached window.
  const unwatchSettings = settings.watch((state) => {
    dateRange = state.dateRange;
  });

  // The scroller stops itself once it walks past the range floor.
  const unwatchScrape = scrapeState.watch((state) => {
    if (!state.stoppedByRange) return;
    scrolling = false;
    message = $t('msg.stoppedByRange');
    messageType = 'info';
    void scrapeState.setValue({ stoppedByRange: false });
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
        message = $t('msg.exportedSome', {
          count: state.total - state.failed,
          failed: state.failed,
        });
        messageType = 'error';
      } else {
        message = $t('msg.exportedAll', { count: state.total });
        messageType = 'info';
      }
    } else if (state.status === 'error') {
      exporting = false;
      exportProgress = null;
      message = state.error || $t('msg.exportFailed');
      messageType = 'error';
    } else {
      if (exporting) {
        exporting = false;
        exportProgress = null;
        message = $t('msg.exportCanceled');
        messageType = 'info';
      }
    }
  });

  return () => {
    unwatch();
    unwatchJob();
    unwatchSettings();
    unwatchScrape();
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
    message = $t('msg.refreshInstagram');
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
  if (scrolling) return;

  const selected = visibleImages;
  if (selected.length === 0) return;
  const csv = buildCsv(selected.map((image) => image.url));
  const filename = exportFilename('csv');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    await browser.downloads.download({ url: blobUrl, filename, saveAs: true });
    message = $t('msg.downloadStarted');
    messageType = 'info';
  } catch {
    message = $t('msg.downloadFailed');
    messageType = 'error';
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}

async function confirmClear() {
  const found = await scrapedImages.getValue();
  // Only what falls inside the selected date range goes to History, so the
  // archive matches what the user can see and export.
  const selected = filterByDateRange(found, bounds);
  const session = await currentSession.getValue();
  if (selected.length > 0) {
    const entry: ScrapingSession = {
      id: crypto.randomUUID(),
      date: Date.now(),
      sourceUrl: session?.sourceUrl ?? 'unknown',
      thumbnailCount: selected.length,
      images: selected,
    };
    const history = await scrapingHistory.getValue();
    const updated = [entry, ...history].slice(0, 50);
    await scrapingHistory.setValue(updated);
  }
  await currentSession.setValue(null);
  await scrapedImages.setValue([]);
  showClearModal = false;
  images = [];
  message = $t('msg.dataCleared');
  messageType = 'info';
}

function handleExport() {
  // Exports stay locked while scraping, so the archive is complete.
  if (exporting || scrolling || !canExport) return;
  exportPhase = 'choose';
  exportOutcome = null;
  exportError = '';
  showExportModal = true;
}

async function runZipExport(grouping: ZipGrouping) {
  const selected = visibleImages;
  if (exporting || selected.length === 0) return;

  const { zipImageFormat } = await settings.getValue();
  const controller = new AbortController();
  abortController = controller;
  exporting = true;
  exportProgress = null;
  exportOutcome = null;
  exportError = '';
  exportPhase = 'progress';
  message = '';

  try {
    const result = await exportImagesZip(selected, {
      format: zipImageFormat,
      grouping,
      signal: controller.signal,
      onProgress: (p) => {
        exportProgress = p;
      },
    });

    if (result.ok) {
      exportPhase = 'done';
      exportOutcome = { exported: result.total - result.failed, failed: result.failed };
    } else {
      exportPhase = 'error';
      exportError = result.error ?? 'Export failed.';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      showExportModal = false;
      exportPhase = 'choose';
      message = $t('msg.exportCanceled');
      messageType = 'info';
    } else {
      exportPhase = 'error';
      exportError = err instanceof Error ? err.message : $t('msg.exportFailed');
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
        aria-label={$t('header.backHome')}
        onclick={onBack}
      >
        <ChevronLeft size={18} />
      </button>
    {/snippet}
    {#snippet status()}
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide transition-colors hover:brightness-110 {connected
          ? 'bg-success/15 text-success'
          : 'bg-surface-secondary text-fg-muted'}"
        onclick={switchToTab}
        title={connected ? $t('header.switchTab') : $t('header.noTab')}
      >
        {#if connected}
          <span class="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
        {/if}
        {connected ? $t('header.connected') : $t('header.ready')}
      </button>
    {/snippet}
  </BrandHeader>

  <main class="flex flex-1 flex-col rounded-xl border border-border bg-surface p-6">
    <div class="mb-5">
      <h1 class="text-lg font-bold text-fg">{$t('extract.title')}</h1>
      <p class="mt-1 text-sm text-fg-secondary">{$t('extract.tagline')}</p>
    </div>

    <StatsCard count={visibleCount} total={count} {pop} />

    <div class="mt-4 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <label for="date-range" class="text-xs font-medium text-fg-secondary"
          >{$t('extract.dateRange')}</label
        >
        <select
          id="date-range"
          value={dateRange.preset}
          onchange={(e) => setPreset(e.currentTarget.value as DateRangePreset)}
          class="rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs font-medium text-fg dark:[color-scheme:dark] focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        >
          {#each DATE_RANGE_OPTIONS as option}
            <option value={option.value}>{$t(option.labelKey)}</option>
          {/each}
        </select>
      </div>

      {#if dateRange.preset === 'custom'}
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0 text-xs text-fg-muted">{$t('extract.from')}</span>
          <input
            type="date"
            value={dateRange.from ?? ''}
            oninput={(e) => setCustomFrom(e.currentTarget.value)}
            class="min-w-0 flex-1 rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-fg dark:[color-scheme:dark] focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          >
        </label>
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0 text-xs text-fg-muted">{$t('extract.to')}</span>
          <input
            type="date"
            value={dateRange.to ?? ''}
            oninput={(e) => setCustomTo(e.currentTarget.value)}
            class="min-w-0 flex-1 rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-fg dark:[color-scheme:dark] focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          >
        </label>
      {/if}
    </div>

    <div class="mt-4">
      <ActionBar
        {scrolling}
        hasImages={count > 0}
        {canExport}
        {exporting}
        onStart={handleStart}
        onStop={handleStop}
        onDownload={handleDownload}
        onExport={handleExport}
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

  <ConfirmClearDialog
    bind:open={showClearModal}
    title={$t('clear.title')}
    description={$t('clear.description', { count: visibleCount })}
    confirmLabel={$t('clear.confirm')}
    onConfirm={confirmClear}
  />
  <ExportZipDialog
    bind:open={showExportModal}
    count={visibleCount}
    phase={exportPhase}
    progress={exportProgress}
    percent={exportPercent}
    result={exportOutcome}
    error={exportError}
    onConfirm={runZipExport}
    onCancel={() => abortController?.abort()}
  />
</div>
