<script lang="ts">
let { count, pop }: { count: number; pop: boolean } = $props();
</script>

<div class="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface px-5 py-5">
  <span
    class="bg-linear-to-r from-brand-indigo via-brand-blue to-brand-cyan bg-clip-text text-4xl font-extrabold leading-none text-transparent {pop
      ? 'pop-bounce'
      : ''}"
  >
    {count}
  </span>
  <span class="text-xs font-medium uppercase tracking-widest text-fg-muted">Thumbnails</span>
</div>
