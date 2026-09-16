<script lang="ts">
import { Download } from 'lucide-svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import { type MessageKey, t } from '@/features/i18n/locale';

let {
  variant,
  labelKey,
  disabled = false,
  bounce = false,
  onclick,
  ...rest
}: {
  /** Picks the accent colour: CSV is green, ZIP a brownish orange. */
  variant: 'csv' | 'zip';
  labelKey: MessageKey;
  disabled?: boolean;
  /** Play the attention bounce on the icon, e.g. while a download runs. */
  bounce?: boolean;
  onclick: () => void;
} & HTMLButtonAttributes = $props();

const TONE: Record<'csv' | 'zip', string> = {
  csv: 'border-csv/30 bg-csv/10 text-csv hover:border-csv/40 hover:bg-csv/20',
  zip: 'border-zip/30 bg-zip/10 text-zip hover:border-zip/40 hover:bg-zip/20',
};
</script>

<button
  {...rest}
  type="button"
  {disabled}
  {onclick}
  class="flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 {TONE[
    variant
  ]}"
>
  <span class="inline-flex items-center gap-1.5">
    <span
      class="inline-block transition-transform {bounce
        ? 'animate-[bounce_0.6s_ease-in-out]'
        : ''} {disabled ? 'opacity-40' : ''}"
    >
      <Download size={14} />
    </span>
    {$t(labelKey)}
  </span>
</button>
