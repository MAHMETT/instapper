<script lang="ts">
import { Separator, Tooltip } from 'bits-ui';
import type { ExportProgress as ExportProgressType } from '../types';
import ExportProgress from './ExportProgress.svelte';

let {
  scrolling,
  canDownload,
  exporting,
  exportProgress,
  exportPercent,
  onStart,
  onStop,
  onDownload,
  onExport,
  onExportCancel,
  onClear,
}: {
  scrolling: boolean;
  canDownload: boolean;
  exporting: boolean;
  exportProgress: ExportProgressType | null;
  exportPercent: number;
  onStart: () => void;
  onStop: () => void;
  onDownload: () => void;
  onExport: () => void;
  onExportCancel: () => void;
  onClear: () => void;
} = $props();
</script>

<div class="flex flex-col gap-2.5">
  {#if scrolling}
    <button
      type="button"
      class="w-full rounded-lg bg-danger/15 px-4 py-3 text-sm font-semibold text-danger border border-danger/30 transition-all hover:bg-danger/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
      onclick={onStop}
    >
      Stop Scrolling
    </button>
  {:else}
    <button
      type="button"
      class="w-full rounded-lg bg-linear-to-r from-brand-indigo to-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-indigo/25 transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-brand-indigo/35 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-brand-indigo/25 disabled:hover:brightness-100"
      onclick={onStart}
    >
      Auto Scroll &amp; Scrape
    </button>
  {/if}

  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <button
            {...props}
            type="button"
            class="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm font-medium text-fg transition-all hover:bg-border/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={!canDownload}
            onclick={onDownload}
          >
            Download CSV
          </button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content
        side="top"
        sideOffset={4}
        class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
      >
        Some expired links may fail to download
        <Tooltip.Arrow class="fill-surface" />
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>

  <button
    type="button"
    class="w-full rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm font-medium text-fg transition-all hover:bg-border/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    disabled={!canDownload || exporting}
    onclick={onExport}
  >
    Export ZIP
  </button>

  {#if exporting}
    <ExportProgress progress={exportProgress} percent={exportPercent} onCancel={onExportCancel} />
  {/if}

  <Separator.Root class="my-1 h-px w-full bg-border" />

  <button
    type="button"
    class="w-full rounded-lg px-4 py-2 text-xs font-medium text-fg-muted underline underline-offset-2 decoration-transparent transition-colors hover:text-fg-secondary hover:decoration-current focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
    onclick={onClear}
  >
    Clear Data
  </button>
</div>
