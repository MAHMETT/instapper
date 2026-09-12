<script lang="ts">
import { Separator, Tooltip } from 'bits-ui';
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z"
                  />
                </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z"
                />
              </svg>
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
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
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        ZIP
      </span>
    </button>
  </div>

  {#if exporting}
    <ExportProgress progress={exportProgress} percent={exportPercent} onCancel={onExportCancel} />
  {/if}

  <Separator.Root class="my-1 h-px w-full bg-border" />
</div>
