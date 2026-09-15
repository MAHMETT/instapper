<script lang="ts">
import { settings } from '@/shared/storage';
import type { ZipImageFormat } from '@/shared/types';

const options: { value: ZipImageFormat; label: string; hint: string }[] = [
  { value: 'jpeg', label: 'JPEG', hint: 'Smaller files' },
  { value: 'png', label: 'PNG', hint: 'Lossless' },
];

let format = $state<ZipImageFormat>('jpeg');

$effect(() => {
  settings.getValue().then((s) => (format = s.zipImageFormat));
  return settings.watch((s) => (format = s.zipImageFormat));
});

function select(value: ZipImageFormat) {
  format = value;
  settings.setValue({ zipImageFormat: value });
}
</script>

<div class="flex flex-1 flex-col gap-3 p-4">
  <div class="flex flex-col gap-0.5">
    <h1 class="text-lg font-bold text-fg">Settings</h1>
    <p class="text-sm text-fg-secondary">Export preferences</p>
  </div>

  <fieldset class="rounded-xl border border-border bg-surface p-4">
    <legend class="sr-only">ZIP image format</legend>
    <span class="text-sm font-semibold text-fg">ZIP image format</span>
    <span class="mt-0.5 block text-xs leading-snug text-fg-muted">
      Every thumbnail is converted to this format when exporting a ZIP. Images already in this
      format are kept untouched.
    </span>

    <div class="mt-3 flex gap-2">
      {#each options as option}
        <label
          class="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-semibold text-fg-secondary transition-colors hover:bg-border/50 has-checked:border-brand-indigo/40 has-checked:bg-brand-indigo/10 has-checked:text-fg has-focus-visible:outline-2 has-focus-visible:outline-brand-cyan has-focus-visible:outline-offset-2"
        >
          <input
            type="radio"
            name="zip-image-format"
            value={option.value}
            checked={format === option.value}
            class="sr-only"
            onchange={() => select(option.value)}
          >
          <span>{option.label}</span>
          <span class="text-[10px] font-normal text-fg-muted">{option.hint}</span>
        </label>
      {/each}
    </div>
  </fieldset>
</div>
