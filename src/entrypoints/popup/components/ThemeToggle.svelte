<script lang="ts">
import { Moon, Sun } from 'lucide-svelte';
import type { Theme } from '@/features/theme/theme';

let { theme, onToggle }: { theme: Theme; onToggle: () => void } = $props();
</script>

<button
  type="button"
  class="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-surface-secondary hover:text-fg focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-pressed={theme === 'dark'}
  onclick={onToggle}
>
  <span
    class="inline-block transition-transform duration-300 ease-in-out {theme === 'dark'
      ? 'rotate-0'
      : 'rotate-180'}"
  >
    {#if theme === 'dark'}
      <Sun size={18} />
    {:else}
      <Moon size={18} />
    {/if}
  </span>
</button>
