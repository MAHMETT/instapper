<script lang="ts">
let {
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
} = $props();
</script>

<button
  type="button"
  class="group flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-indigo/10 hover:border-brand-indigo/30 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
  onclick={onClick}
>
  <span
    class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo transition-colors group-hover:bg-brand-indigo/20 [&>svg]:pointer-events-none [&>svg]:shrink-0"
  >
    {@html icon}
  </span>
  <div class="flex flex-col gap-0.5">
    <span class="text-sm font-semibold text-fg">{title}</span>
    <span class="text-xs leading-snug text-fg-muted">{description}</span>
  </div>
</button>
