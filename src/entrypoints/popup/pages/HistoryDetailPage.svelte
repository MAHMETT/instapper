<script lang="ts">
import { ChevronLeft } from 'lucide-svelte';
import { browser } from 'wxt/browser';
import { buildCsv, exportFilename } from '@/features/export/csv';
import { buildImageZip, zipBlobUrl } from '@/features/export/zip';
import { currentLocale, formatDate, formatDateTime, t } from '@/features/i18n/locale';
import { dateSpanOf } from '@/shared/date-range';
import { settings } from '@/shared/storage';
import type { ScrapedImage, ScrapingSession } from '@/shared/types';
import ExportButton from '../components/ExportButton.svelte';

let {
  session,
  images,
  onBack,
}: {
  session: ScrapingSession;
  images: ScrapedImage[];
  onBack: () => void;
} = $props();

const hasImages = $derived(images.length > 0);
// What period this session actually covers, and how many thumbnails have no
// publication date to place.
const span = $derived(dateSpanOf(images));
const untimed = $derived(images.filter((image) => image.takenAt === null).length);
let downloading = $state(false);

async function downloadCsv() {
  if (!hasImages) return;
  const csv = buildCsv(images.map((image) => image.url));
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
      aria-label={$t('header.backHistory')}
      onclick={onBack}
    >
      <ChevronLeft size={18} />
    </button>
    <h1 class="text-lg font-bold text-fg">{$t('detail.title')}</h1>
  </div>

  <!-- Session info card -->
  <div class="rounded-xl border border-border bg-surface p-5">
    <dl class="flex flex-col gap-3 text-sm">
      <div class="flex items-center justify-between">
        <dt class="text-fg-muted">{$t('detail.date')}</dt>
        <dd class="text-fg-secondary">{formatDateTime(session.date, $currentLocale)}</dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex flex-col gap-1">
        <dt class="text-fg-muted">{$t('detail.source')}</dt>
        <dd class="break-all font-mono text-xs text-fg-secondary">{session.sourceUrl}</dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex items-center justify-between">
        <dt class="text-fg-muted">{$t('detail.thumbnails')}</dt>
        <dd class="font-mono text-lg font-bold text-fg">{session.thumbnailCount}</dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex flex-col gap-1">
        <dt class="text-fg-muted">{$t('detail.dateRange')}</dt>
        <dd class="text-fg-secondary">
          {#if span}
            {@const from = formatDate(span.from, $currentLocale)}
            {@const to = formatDate(span.to, $currentLocale)}
            {from}
            {#if to !== from}
              – {to}
            {/if}
            {#if untimed > 0}
              <span class="text-fg-muted">· {$t('detail.untimed', { count: untimed })}</span>
            {/if}
          {:else}
            <span class="text-fg-muted">{$t('detail.noDateRange')}</span>
          {/if}
        </dd>
      </div>
    </dl>
  </div>

  <!-- Download buttons -->
  {#if hasImages}
    <div class="flex gap-2">
      <ExportButton variant="csv" labelKey="common.csv" onclick={downloadCsv} />
      <ExportButton
        variant="zip"
        labelKey={downloading ? 'detail.downloading' : 'common.zip'}
        disabled={downloading}
        bounce={downloading}
        onclick={downloadZip}
      />
    </div>
  {:else}
    <p class="text-center text-xs text-fg-muted">
      {$t('detail.noImages')}
    </p>
  {/if}
</div>
