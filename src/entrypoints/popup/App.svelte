<script lang="ts">
import { browser } from 'wxt/browser';
import { exportImagesZip } from '../../lib/export';
import { sendMessage } from '../../lib/messaging';
import { scrapedImages } from '../../lib/storage';
import type { ExportProgress } from '../../lib/types';

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
let cancelBtnEl = $state<HTMLButtonElement | null>(null);

// Export state
let exporting = $state(false);
let exportProgress = $state<ExportProgress | null>(null);
let abortController = $state<AbortController | null>(null);

const badgeText = $derived(connected ? 'Connected' : 'Ready');
const canDownload = $derived(count > 0);
const exportPercent = $derived(
  exportProgress && exportProgress.total > 0
    ? Math.round((exportProgress.done / exportProgress.total) * 100)
    : 0,
);

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

// Focus cancel button when modal opens
$effect(() => {
  if (showClearModal) {
    cancelBtnEl?.focus();
  }
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

<div class="popup">
  <!-- Header -->
  <header class="header">
    <div class="brand">
      <svg
        class="logo-icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="url(#ig-gradient)"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f09433" />
            <stop offset="25%" stop-color="#e6683c" />
            <stop offset="50%" stop-color="#dc2743" />
            <stop offset="75%" stop-color="#cc2366" />
            <stop offset="100%" stop-color="#bc1888" />
          </linearGradient>
        </defs>
        <path
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
        />
      </svg>
      <span class="brand-name">Instapper</span>
    </div>
    <span class="badge" class:connected>{badgeText}</span>
  </header>

  <!-- Content -->
  <main class="content">
    <div class="intro">
      <h1>Extract thumbnails</h1>
      <p>Open an Instagram hashtag or profile page, then start scraping.</p>
    </div>

    <!-- Stats -->
    <div class="stats-card">
      <span class="stat-value" class:pop>{count}</span>
      <span class="stat-label">Thumbnails</span>
    </div>

    <!-- Actions -->
    <div class="actions">
      {#if scrolling}
        <button type="button" class="btn btn-danger" onclick={handleStop}>Stop Scrolling</button>
      {:else}
        <button type="button" class="btn btn-primary" onclick={handleStart}>
          Auto Scroll & Scrape
        </button>
      {/if}

      <button
        type="button"
        class="btn btn-secondary"
        disabled={!canDownload}
        onclick={handleDownload}
      >
        Download CSV
      </button>

      <button
        type="button"
        class="btn btn-secondary"
        disabled={!canDownload || exporting}
        onclick={handleExport}
      >
        Export ZIP
      </button>

      {#if exporting}
        <div class="export-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={exportPercent}
              style="width: {exportPercent}%"
            ></div>
          </div>
          <div class="progress-info">
            {#if exportProgress?.phase === 'fetching'}
              <span class="progress-label"
                >Fetching {exportProgress.done}/{exportProgress.total}</span
              >
            {:else if exportProgress?.phase === 'zipping'}
              <span class="progress-label">Creating ZIP&hellip;</span>
            {:else}
              <span class="progress-label">Starting&hellip;</span>
            {/if}
            <button
              type="button"
              class="btn-cancel-export"
              onclick={() => abortController?.abort()}
            >
              Cancel
            </button>
          </div>
        </div>
      {/if}

      <button type="button" class="btn-text" onclick={() => (showClearModal = true)}>
        Clear Data
      </button>
    </div>

    <!-- Status message -->
    {#if message}
      <p class="message" class:error={messageType === 'error'} aria-live="polite">{message}</p>
    {/if}
  </main>

  <!-- Clear confirmation modal -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" class:active={showClearModal} onclick={() => (showClearModal = false)}>
    <div
      class="modal"
      onclick={(e) => e.stopPropagation()}
      role="alertdialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="clear-modal-title"
    >
      <h3 id="clear-modal-title">Clear data?</h3>
      <p>This will permanently remove all scraped thumbnails.</p>
      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          onclick={() => (showClearModal = false)}
          bind:this={cancelBtnEl}
        >
          Cancel
        </button>
        <button type="button" class="btn btn-danger" onclick={confirmClear}>Clear</button>
      </div>
    </div>
  </div>
</div>

<style>
.popup {
  display: flex;
  flex-direction: column;
  min-height: 500px;
  padding: 16px;
  gap: 16px;
}

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  flex-shrink: 0;
}

.brand-name {
  font-weight: 700;
  font-size: 15px;
  background: linear-gradient(135deg, #f09433, #dc2743, #bc1888);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  color: #a1a1aa;
}

.badge.connected {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

/* ── Content ── */
.content {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.intro {
  margin-bottom: 20px;
}

.intro h1 {
  font-size: 18px;
  font-weight: 700;
  color: #fafafa;
  margin-bottom: 6px;
}

.intro p {
  font-size: 13px;
  color: #71717a;
  line-height: 1.5;
}

/* ── Stats ── */
.stats-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #f09433, #dc2743, #bc1888);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-value.pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

/* ── Buttons ── */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.btn {
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease,
    background 0.15s ease;
  text-align: center;
  font-family: inherit;
  color: inherit;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #f09433, #dc2743, #bc1888);
  color: #fff;
  box-shadow: 0 4px 16px rgba(220, 39, 67, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(220, 39, 67, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(220, 39, 67, 0.2);
}

.btn-danger {
  background: rgba(220, 39, 67, 0.15);
  color: #f87171;
  border: 1px solid rgba(220, 39, 67, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(220, 39, 67, 0.25);
  transform: translateY(-1px);
}

.btn-danger:active:not(:disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #d4d4d8;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-text {
  background: none;
  border: none;
  color: #52525b;
  font-size: 12px;
  font-weight: 500;
  padding: 4px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: transparent;
  transition:
    color 0.15s ease,
    text-decoration-color 0.15s ease;
  font-family: inherit;
}

.btn-text:hover {
  color: #a1a1aa;
  text-decoration-color: currentColor;
}

/* ── Message ── */
.message {
  margin-top: 12px;
  font-size: 12px;
  text-align: center;
  color: #71717a;
  min-height: 18px;
}

.message.error {
  color: #f87171;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.modal {
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  width: calc(100% - 48px);
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  transform: scale(0.95);
  opacity: 0;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}

.modal-overlay.active .modal {
  transform: scale(1);
  opacity: 1;
}

.modal h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fafafa;
  margin-bottom: 6px;
}

.modal p {
  font-size: 13px;
  color: #71717a;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 8px;
}

.modal-actions .btn {
  flex: 1;
  padding: 10px;
  font-size: 13px;
}

/* ── Export Progress ── */
.export-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #f09433, #dc2743, #bc1888);
  transition: width 0.2s ease;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-label {
  font-size: 12px;
  color: #a1a1aa;
}

.btn-cancel-export {
  background: none;
  border: none;
  color: #f87171;
  font-size: 12px;
  font-weight: 500;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}

.btn-cancel-export:hover {
  color: #fca5a5;
}
</style>
