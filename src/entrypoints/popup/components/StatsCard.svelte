<script lang="ts">
import { t } from '@/features/i18n/locale';

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
  title={$t('stats.title', { count, total })}
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
  <span class="text-xs font-medium uppercase tracking-widest text-fg-muted"
    >{$t('stats.label')}</span
  >
</div>
