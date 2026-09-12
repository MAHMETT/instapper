<script lang="ts">
import type { Theme } from '@/features/theme/theme';
import ThemeToggle from './ThemeToggle.svelte';

let {
  connected,
  theme,
  onToggleTheme,
}: {
  connected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
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
    <ThemeToggle {theme} onToggle={onToggleTheme} />
  </div>
</header>
