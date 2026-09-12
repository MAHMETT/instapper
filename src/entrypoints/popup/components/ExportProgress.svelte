<script lang="ts">
import { Progress } from 'bits-ui';
import type { ExportProgress as ExportProgressType } from '@/shared/types';

let {
  progress,
  percent,
  onCancel,
}: {
  progress: ExportProgressType | null;
  percent: number;
  onCancel: () => void;
} = $props();

let label = $derived.by(() => {
  if (!progress) return 'Starting\u2026';
  if (progress.phase === 'fetching') return `Fetching ${progress.done}/${progress.total}`;
  return 'Creating ZIP\u2026';
});
</script>

<div class="flex flex-col gap-1.5">
  <Progress.Root
    value={percent}
    max={100}
    class="h-1 w-full overflow-hidden rounded-full bg-surface-secondary"
  >
    <div
      class="h-full rounded-full bg-linear-to-r from-brand-indigo via-brand-blue to-brand-cyan transition-[width] duration-200 ease-out"
      style="width: {percent}%"
    ></div>
  </Progress.Root>
  <div class="flex items-center justify-between">
    <span class="text-xs text-fg-muted">{label}</span>
    <button
      type="button"
      class="text-xs font-medium text-danger underline underline-offset-2 transition-colors hover:text-danger/80"
      onclick={onCancel}
    >
      Cancel
    </button>
  </div>
</div>
