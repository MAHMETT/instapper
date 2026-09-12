<script lang="ts">
import { AlertDialog } from 'bits-ui';

let {
  open = $bindable(false),
  onConfirm,
}: {
  open: boolean;
  onConfirm: () => void;
} = $props();
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[dialog-overlay-in_0.15s_ease-out]"
    />
    <AlertDialog.Content
      class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-xl data-[state=open]:animate-[dialog-content-in_0.18s_cubic-bezier(0.34,1.56,0.64,1)]"
    >
      <AlertDialog.Title class="text-base font-semibold text-fg"> Clear data? </AlertDialog.Title>
      <AlertDialog.Description class="mt-1.5 text-sm text-fg-secondary">
        This will permanently remove all scraped thumbnails.
      </AlertDialog.Description>
      <div class="mt-5 flex gap-2">
        <AlertDialog.Cancel
          class="flex-1 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-border/50 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        >
          Cancel
        </AlertDialog.Cancel>
        <AlertDialog.Action
          class="flex-1 rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger/90 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
          onclick={onConfirm}
        >
          Clear
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
