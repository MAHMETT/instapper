<script lang="ts">
import { Separator, Tooltip } from 'bits-ui';
import { Download, Pause, Play } from 'lucide-svelte';
import type { ExportProgress as ExportProgressType } from '@/shared/types';
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

const stopped = $derived(!scrolling && canDownload);
</script>

<div class="flex flex-col gap-2.5">
  {#if scrolling}
    <!-- Pause -->
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <button
              {...props}
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-danger/15 px-4 py-3 text-sm font-semibold text-danger border border-danger/30 transition-all hover:bg-danger/25 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
              onclick={onStop}
            >
              <span class="transition-transform hover:scale-110 hover:rotate-[8deg]">
                <Pause size={16} strokeWidth={2.5} />
              </span>
              Pause
            </button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
        >
          Pause scraping
          <Tooltip.Arrow class="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  {:else if stopped}
    <!-- Continue + Reset -->
    <div class="flex gap-2">
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <button
                {...props}
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-indigo to-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-indigo/25 transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-brand-indigo/35 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
                onclick={onStart}
              >
                <span class="transition-transform hover:scale-110">
                  <Play size={16} fill="currentColor" />
                </span>
                Continue
              </button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content
            side="top"
            sideOffset={4}
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
          >
            Continue scraping
            <Tooltip.Arrow class="fill-surface" />
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>

      <button
        type="button"
        class="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition-all hover:bg-danger/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        onclick={onClear}
      >
        Reset
      </button>
    </div>
  {:else}
    <!-- Start -->
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <button
              {...props}
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-indigo to-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-indigo/25 transition-all hover:brightness-110 hover:-translate-y-0.5 hover:shadow-brand-indigo/35 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-brand-indigo/25 disabled:hover:brightness-100"
              onclick={onStart}
            >
              <span class="transition-transform hover:scale-110">
                <Play size={16} fill="currentColor" />
              </span>
              Start
            </button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
        >
          Start scraping
          <Tooltip.Arrow class="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  {/if}

  <!-- Export buttons -->
  <div class="flex gap-2">
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <button
              {...props}
              type="button"
              class="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-medium text-fg transition-all hover:bg-border/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={!canDownload}
              onclick={onDownload}
            >
              <span class="inline-flex items-center gap-1.5">
                <span
                  class="inline-block transition-transform {canDownload
                    ? 'animate-[bounce_0.6s_ease-in-out]'
                    : ''} {canDownload ? '' : 'opacity-40'}"
                >
                  <Download size={14} />
                </span>
                CSV
              </span>
            </button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
        >
          Download CSV — some expired links may fail
          <Tooltip.Arrow class="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>

    <button
      type="button"
      class="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-medium text-fg transition-all hover:bg-border/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      disabled={!canDownload || exporting}
      onclick={onExport}
    >
      <span class="inline-flex items-center gap-1.5">
        <span
          class="inline-block transition-transform {canDownload && !exporting
            ? 'animate-[bounce_0.6s_ease-in-out]'
            : ''} {canDownload && !exporting ? '' : 'opacity-40'}"
        >
          <Download size={14} />
        </span>
        ZIP
      </span>
    </button>
  </div>

  {#if exporting}
    <ExportProgress progress={exportProgress} percent={exportPercent} onCancel={onExportCancel} />
  {/if}

  <Separator.Root class="my-1 h-px w-full bg-border" />
</div>
