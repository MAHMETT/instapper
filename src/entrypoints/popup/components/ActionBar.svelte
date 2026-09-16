<script lang="ts">
import { Separator, Tooltip } from 'bits-ui';
import { Download, Pause, Play } from 'lucide-svelte';
import { t } from '@/features/i18n/locale';

let {
  scrolling,
  hasImages,
  canExport,
  exporting,
  onStart,
  onStop,
  onDownload,
  onExport,
  onClear,
}: {
  scrolling: boolean;
  /** Whether the collection holds anything at all — keeps Reset reachable. */
  hasImages: boolean;
  /** Whether the active date filter leaves anything to export. */
  canExport: boolean;
  exporting: boolean;
  onStart: () => void;
  onStop: () => void;
  onDownload: () => void;
  onExport: () => void;
  onClear: () => void;
} = $props();

const stopped = $derived(!scrolling && hasImages);

/** Exports stay locked while a scrape runs, so the archive is never a
 *  half-collected snapshot of a list that is still growing. */
const exportReady = $derived(canExport && !scrolling);
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
              {$t('action.pause')}
            </button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
        >
          {$t('action.pauseHint')}
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
                {$t('action.continue')}
              </button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content
            side="top"
            sideOffset={4}
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
          >
            {$t('action.continueHint')}
            <Tooltip.Arrow class="fill-surface" />
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>

      <button
        type="button"
        class="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition-all hover:bg-danger/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        onclick={onClear}
      >
        {$t('action.reset')}
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
              {$t('action.start')}
            </button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
        >
          {$t('action.startHint')}
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
              disabled={!exportReady}
              onclick={onDownload}
            >
              <span class="inline-flex items-center gap-1.5">
                <span
                  class="inline-block transition-transform {exportReady
                    ? 'animate-[bounce_0.6s_ease-in-out]'
                    : ''} {exportReady ? '' : 'opacity-40'}"
                >
                  <Download size={14} />
                </span>
                {$t('common.csv')}
              </span>
            </button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg-secondary shadow-md"
        >
          {$t('action.csvHint')}
          <Tooltip.Arrow class="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>

    <button
      type="button"
      class="flex-1 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-medium text-fg transition-all hover:bg-border/50 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      disabled={!exportReady || exporting}
      onclick={onExport}
    >
      <span class="inline-flex items-center gap-1.5">
        <span
          class="inline-block transition-transform {exportReady && !exporting
            ? 'animate-[bounce_0.6s_ease-in-out]'
            : ''} {exportReady && !exporting ? '' : 'opacity-40'}"
        >
          <Download size={14} />
        </span>
        {$t('common.zip')}
      </span>
    </button>
  </div>

  {#if scrolling && hasImages}
    <p class="text-center text-xs text-fg-muted">{$t('action.exportBlocked')}</p>
  {/if}

  <Separator.Root class="my-1 h-px w-full bg-border" />
</div>
