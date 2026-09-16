<script lang="ts">
import { DEFAULT_LOCALE, isLocale, type MessageKey, t } from '@/features/i18n/locale';
import { settings, updateSettings } from '@/shared/storage';
import type { Locale, ZipImageFormat } from '@/shared/types';

const formatOptions: { value: ZipImageFormat; labelKey: MessageKey; hintKey: MessageKey }[] = [
  { value: 'jpeg', labelKey: 'settings.jpeg', hintKey: 'settings.jpegHint' },
  { value: 'png', labelKey: 'settings.png', hintKey: 'settings.pngHint' },
];

const languageOptions: { value: Locale; labelKey: MessageKey }[] = [
  { value: 'id', labelKey: 'settings.indonesian' },
  { value: 'en', labelKey: 'settings.english' },
];

let zipFormat = $state<ZipImageFormat>('jpeg');
let locale = $state<Locale>(DEFAULT_LOCALE);

$effect(() => {
  function apply(state: { zipImageFormat: ZipImageFormat; locale: Locale }): void {
    zipFormat = state.zipImageFormat;
    // Guard against a value written before the locale preference existed.
    locale = isLocale(state.locale) ? state.locale : DEFAULT_LOCALE;
  }

  settings.getValue().then(apply);
  return settings.watch(apply);
});

function selectZipFormat(value: ZipImageFormat) {
  zipFormat = value;
  // Merge, so the other preferences are not wiped.
  void updateSettings({ zipImageFormat: value });
}

function selectLocale(value: Locale) {
  locale = value;
  void updateSettings({ locale: value });
}
</script>

<div class="flex flex-1 flex-col gap-3 p-4">
  <div class="flex flex-col gap-0.5">
    <h1 class="text-lg font-bold text-fg">{$t('settings.title')}</h1>
    <p class="text-sm text-fg-secondary">{$t('settings.subtitle')}</p>
  </div>

  <fieldset class="rounded-xl border border-border bg-surface p-4">
    <legend class="sr-only">{$t('settings.zipFormat')}</legend>
    <span class="text-sm font-semibold text-fg">{$t('settings.zipFormat')}</span>
    <span class="mt-0.5 block text-xs leading-snug text-fg-muted">
      {$t('settings.zipFormatHelp')}
    </span>

    <div class="mt-3 flex gap-2">
      {#each formatOptions as option}
        <label
          class="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-semibold text-fg-secondary transition-colors hover:bg-border/50 has-checked:border-brand-indigo/40 has-checked:bg-brand-indigo/10 has-checked:text-fg has-focus-visible:outline-2 has-focus-visible:outline-brand-cyan has-focus-visible:outline-offset-2"
        >
          <input
            type="radio"
            name="zip-image-format"
            value={option.value}
            checked={zipFormat === option.value}
            class="sr-only"
            onchange={() => selectZipFormat(option.value)}
          >
          <span>{$t(option.labelKey)}</span>
          <span class="text-[10px] font-normal text-fg-muted">{$t(option.hintKey)}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="rounded-xl border border-border bg-surface p-4">
    <legend class="sr-only">{$t('settings.language')}</legend>
    <span class="text-sm font-semibold text-fg">{$t('settings.language')}</span>
    <span class="mt-0.5 block text-xs leading-snug text-fg-muted">
      {$t('settings.languageHelp')}
    </span>

    <div class="mt-3 flex gap-2">
      {#each languageOptions as option}
        <label
          class="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-xs font-semibold text-fg-secondary transition-colors hover:bg-border/50 has-checked:border-brand-indigo/40 has-checked:bg-brand-indigo/10 has-checked:text-fg has-focus-visible:outline-2 has-focus-visible:outline-brand-cyan has-focus-visible:outline-offset-2"
        >
          <input
            type="radio"
            name="ui-locale"
            value={option.value}
            checked={locale === option.value}
            class="sr-only"
            onchange={() => selectLocale(option.value)}
          >
          <span>{$t(option.labelKey)}</span>
        </label>
      {/each}
    </div>
  </fieldset>
</div>
