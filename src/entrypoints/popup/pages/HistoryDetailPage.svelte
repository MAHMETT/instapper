<script lang="ts">
import { ChevronLeft, Download } from 'lucide-svelte';
import { browser } from 'wxt/browser';
import { buildCsv, exportFilename } from '@/features/export/csv';
import { buildImageZip, zipBlobUrl } from '@/features/export/zip';
import { settings } from '@/shared/storage';
import type { ScrapingSession } from '@/shared/types';

let {
  session,
  images,
  onBack,
}: {
  session: ScrapingSession;
  images: string[];
  onBack: () => void;
} = $props();

const hasImages = $derived(images.length > 0);
let downloading = $state(false);

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date(ts))
    .replace(',', ',');
}

async function downloadCsv() {
  if (!hasImages) return;
  const csv = buildCsv(images);
  const filename = exportFilename('csv');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  try {
    await browser.downloads.download({ url: blobUrl, filename });
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
}

async function downloadZip() {
  if (!hasImages || downloading) return;
  downloading = true;
  try {
    const { zipImageFormat } = await settings.getValue();
    const { zip } = await buildImageZip(images, { format: zipImageFormat });
    const blobUrl = zipBlobUrl(zip);
    const filename = exportFilename('zip');
    try {
      await browser.downloads.download({ url: blobUrl, filename });
    } finally {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }
  } catch {
    /* nothing was collected — nothing to download */
  } finally {
    downloading = false;
  }
}
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <button
      type="button"
      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-surface-secondary hover:text-fg focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
      aria-label="Back to History"
      onclick={onBack}
    >
      <ChevronLeft size={18} />
    </button>
    <h1 class="text-lg font-bold text-fg">Session Detail</h1>
  </div>

  <!-- Session info card -->
  <div class="rounded-xl border border-border bg-surface p-5">
    <dl class="flex flex-col gap-3 text-sm">
      <div class="flex items-center justify-between">
        <dt class="text-fg-muted">Date</dt>
        <dd class="text-fg-secondary">{formatDate(session.date)}</dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex flex-col gap-1">
        <dt class="text-fg-muted">Source</dt>
        <dd class="break-all font-mono text-xs text-fg-secondary">{session.sourceUrl}</dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex items-center justify-between">
        <dt class="text-fg-muted">Thumbnails</dt>
        <dd class="font-mono text-lg font-bold text-fg">{session.thumbnailCount}</dd>
      </div>
    </dl>
  </div>

  <!-- Download buttons -->
  {#if hasImages}
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface hover:text-fg"
        onclick={downloadCsv}
      >
        <span class="inline-flex items-center gap-1.5">
          <Download size={14} />
          CSV
        </span>
      </button>
      <button
        type="button"
        class="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface hover:text-fg"
        disabled={downloading}
        onclick={downloadZip}
      >
        <span class="inline-flex items-center gap-1.5">
          <Download size={14} class={downloading ? 'animate-bounce' : ''} />
          {downloading ? 'Downloading...' : 'ZIP'}
        </span>
      </button>
    </div>
  {:else}
    <p class="text-center text-xs text-fg-muted">
      Images were not stored in this session. Re-scrape to download.
    </p>
  {/if}
</div>
