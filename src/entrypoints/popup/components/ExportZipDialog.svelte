<script lang="ts">
import { Dialog } from 'bits-ui';
import { type MessageKey, t } from '@/features/i18n/locale';
import type {
  ExportOutcome,
  ExportPhase,
  ExportProgress as ExportProgressType,
  ZipGrouping,
} from '@/shared/types';
import ExportProgress from './ExportProgress.svelte';

/** How long the completion modal stays before closing itself. */
const AUTO_CLOSE_MS = 5000;

let {
  open = $bindable(false),
  count,
  phase,
  progress,
  percent,
  result,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  count: number;
  phase: ExportPhase;
  progress: ExportProgressType | null;
  percent: number;
  result: ExportOutcome | null;
  error: string;
  onConfirm: (grouping: ZipGrouping) => void;
  onCancel: () => void;
} = $props();

let grouping = $state<ZipGrouping>('flat');
let closeTimer: ReturnType<typeof setTimeout> | undefined;

const options: { value: ZipGrouping; labelKey: MessageKey; hintKey: MessageKey }[] = [
  { value: 'flat', labelKey: 'export.flat', hintKey: 'export.flatHint' },
  { value: 'by-date', labelKey: 'export.byDate', hintKey: 'export.byDateHint' },
];

// Close the completion modal on its own; interacting with it cancels the timer.
$effect(() => {
  clearTimeout(closeTimer);
  if (!open || phase !== 'done') return;

  closeTimer = setTimeout(() => {
    open = false;
  }, AUTO_CLOSE_MS);

  return () => clearTimeout(closeTimer);
});
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[dialog-overlay-in_0.15s_ease-out]"
    />
    <Dialog.Content
      interactOutsideBehavior={phase === 'progress' ? 'ignore' : 'close'}
      escapeKeydownBehavior={phase === 'progress' ? 'ignore' : 'close'}
      class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-xl data-[state=open]:animate-[dialog-content-in_0.18s_cubic-bezier(0.34,1.56,0.64,1)]"
    >
      {#if phase === 'choose'}
        <Dialog.Title class="text-base font-semibold text-fg">{$t('export.title')}</Dialog.Title>
        <Dialog.Description class="mt-1.5 text-sm text-fg-secondary">
          {$t('export.count', { count })}
        </Dialog.Description>

        <fieldset class="mt-4 flex flex-col gap-2">
          <legend class="sr-only">{$t('export.layoutLegend')}</legend>
          {#each options as option}
            <label
              class="flex cursor-pointer items-start rounded-lg border border-border bg-surface-secondary p-3 transition-colors hover:bg-border/50 has-checked:border-brand-indigo/40 has-checked:bg-brand-indigo/10 has-focus-visible:outline-2 has-focus-visible:outline-brand-cyan has-focus-visible:outline-offset-2"
            >
              <input
                type="radio"
                name="zip-grouping"
                value={option.value}
                checked={grouping === option.value}
                class="sr-only"
                onchange={() => (grouping = option.value)}
              >
              <span class="flex flex-col gap-0.5">
                <span class="text-sm font-medium text-fg">{$t(option.labelKey)}</span>
                <span class="text-xs text-fg-muted">{$t(option.hintKey)}</span>
              </span>
            </label>
          {/each}
        </fieldset>

        <div class="mt-5 flex gap-2">
          <Dialog.Close
            class="flex-1 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-border/50 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          >
            {$t('common.cancel')}
          </Dialog.Close>
          <button
            type="button"
            class="flex-1 rounded-lg bg-linear-to-r from-brand-indigo to-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
            onclick={() => onConfirm(grouping)}
          >
            {$t('export.confirm')}
          </button>
        </div>
      {:else if phase === 'progress'}
        <Dialog.Title class="text-base font-semibold text-fg">
          {$t('export.progressTitle')}
        </Dialog.Title>
        <Dialog.Description class="mt-1.5 text-sm text-fg-secondary">
          {$t('export.progressBody', { count, layout: grouping })}
        </Dialog.Description>

        <div class="mt-4">
          <ExportProgress {progress} {percent} {onCancel} />
        </div>
      {:else if phase === 'done'}
        <Dialog.Title class="text-base font-semibold text-fg">
          {$t('export.doneTitle')}
        </Dialog.Title>
        <Dialog.Description class="mt-1.5 text-sm text-fg-secondary">
          {$t('export.doneBody', { exported: result?.exported ?? 0, failed: result?.failed ?? 0 })}
        </Dialog.Description>

        <p class="mt-3 text-xs text-fg-muted">{$t('export.doneHint')}</p>

        <div class="mt-5">
          <Dialog.Close
            class="w-full rounded-lg bg-linear-to-r from-brand-indigo to-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          >
            {$t('common.ok')}
          </Dialog.Close>
        </div>
      {:else}
        <Dialog.Title class="text-base font-semibold text-fg">
          {$t('export.errorTitle')}
        </Dialog.Title>
        <Dialog.Description class="mt-1.5 text-sm text-fg-secondary">
          {error || $t('export.errorFallback')}
        </Dialog.Description>

        <div class="mt-5">
          <Dialog.Close
            class="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-border/50 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          >
            {$t('common.ok')}
          </Dialog.Close>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
