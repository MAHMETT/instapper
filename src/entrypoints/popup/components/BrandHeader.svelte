<script lang="ts">
import { ExternalLink } from 'lucide-svelte';
import { t } from '@/features/i18n/locale';
import type { Theme } from '@/features/theme/theme';
import ThemeToggle from './ThemeToggle.svelte';

let {
  theme,
  detached,
  compact = false,
  onToggleTheme,
  onPopout,
  children,
  status,
}: {
  theme: Theme;
  detached: boolean;
  compact?: boolean;
  onToggleTheme: () => void;
  onPopout: () => void;
  children?: import('svelte').Snippet;
  status?: import('svelte').Snippet;
} = $props();
</script>

<header
  class="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
>
  <div class="flex items-center gap-2.5">
    {#if !compact && !children}
      <img src="/logo.png" alt="Instapper" class="h-6 w-6 shrink-0">
      <span
        class="bg-linear-to-r from-brand-indigo via-brand-blue to-brand-cyan bg-clip-text font-brand text-base font-bold tracking-[-0.03em] text-transparent"
      >
        instapper
      </span>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if status}
    <div class="flex flex-1 items-center justify-center">
      {@render status()}
    </div>
  {/if}

  <div class="flex items-center gap-2">
    {#if !detached}
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-surface-secondary hover:text-fg focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 group"
        aria-label={$t('header.popout')}
        onclick={onPopout}
      >
        <span class="transition-transform duration-200 group-hover:rotate-45">
          <ExternalLink size={18} />
        </span>
      </button>
    {/if}
    <ThemeToggle {theme} onToggle={onToggleTheme} />
  </div>
</header>
