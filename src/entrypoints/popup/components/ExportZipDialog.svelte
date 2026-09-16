<script lang="ts">
import { AlertDialog } from 'bits-ui';
import type { ZipGrouping } from '@/shared/types';

let {
  open = $bindable(false),
  count,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onConfirm: (grouping: ZipGrouping) => void;
} = $props();

let grouping = $state<ZipGrouping>('flat');

const options: { value: ZipGrouping; label: string; hint: string }[] = [
  { value: 'flat', label: 'No sorting', hint: 'Every file at the top level' },
  { value: 'by-date', label: 'Group by date', hint: 'Folders like 2025-03/, oldest first' },
];
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[dialog-overlay-in_0.15s_ease-out]"
    />
    <AlertDialog.Content
      class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-xl data-[state=open]:animate-[dialog-content-in_0.18s_cubic-bezier(0.34,1.56,0.64,1)]"
    >
      <AlertDialog.Title class="text-base font-semibold text-fg">Export ZIP</AlertDialog.Title>
      <AlertDialog.Description class="mt-1.5 text-sm text-fg-secondary">
        {count}
        thumbnail{count === 1 ? '' : 's'}
        will be downloaded.
      </AlertDialog.Description>

      <fieldset class="mt-4 flex flex-col gap-2">
        <legend class="sr-only">ZIP layout</legend>
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
              <span class="text-sm font-medium text-fg">{option.label}</span>
              <span class="text-xs text-fg-muted">{option.hint}</span>
            </span>
          </label>
        {/each}
      </fieldset>

      <div class="mt-5 flex gap-2">
        <AlertDialog.Cancel
          class="flex-1 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-border/50 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        >
          Cancel
        </AlertDialog.Cancel>
        <AlertDialog.Action
          class="flex-1 rounded-lg bg-linear-to-r from-brand-indigo to-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          onclick={() => onConfirm(grouping)}
        >
          Export
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
