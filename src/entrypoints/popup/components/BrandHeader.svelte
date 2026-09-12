<script lang="ts">
import type { Theme } from '@/features/theme/theme';
import ThemeToggle from './ThemeToggle.svelte';

let {
  connected,
  theme,
  detached,
  onToggleTheme,
  onPopout,
}: {
  connected: boolean;
  theme: Theme;
  detached: boolean;
  onToggleTheme: () => void;
  onPopout: () => void;
} = $props();
</script>

<header
  class="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
>
  <div class="flex items-center gap-2.5">
    <img src="/logo.png" alt="Instapper" class="h-6 w-6 shrink-0">
    <span
      class="bg-linear-to-r from-brand-indigo via-brand-blue to-brand-cyan bg-clip-text font-brand text-base font-bold tracking-[-0.03em] text-transparent"
    >
      instapper
    </span>
  </div>
  <div class="flex items-center gap-2">
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide
        {connected
        ? 'bg-success/15 text-success'
        : 'bg-surface-secondary text-fg-muted'}"
    >
      {connected ? 'Connected' : 'Ready'}
    </span>
    {#if !detached}
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-surface-secondary hover:text-fg focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        aria-label="Pop out to new window"
        onclick={onPopout}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      </button>
    {/if}
    <ThemeToggle {theme} onToggle={onToggleTheme} />
  </div>
</header>
