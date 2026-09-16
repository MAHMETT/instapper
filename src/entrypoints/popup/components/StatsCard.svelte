<script lang="ts">
let {
  count,
  total,
  pop,
}: {
  /** Thumbnails inside the active date range. */
  count: number;
  /** Every collected thumbnail. */
  total: number;
  pop: boolean;
} = $props();
</script>

<div
  class="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface px-5 py-5"
  title="{count} of {total} thumbnails fall inside the selected date range"
>
  <span class="flex items-baseline leading-none">
    <span
      class="bg-linear-to-r from-brand-indigo via-brand-blue to-brand-cyan bg-clip-text text-4xl font-extrabold text-transparent {pop
        ? 'pop-bounce'
        : ''}"
    >
      {count}
    </span>
    <span class="text-2xl font-bold text-fg-muted">/{total}</span>
  </span>
  <span class="text-xs font-medium uppercase tracking-widest text-fg-muted">In range / total</span>
</div>
