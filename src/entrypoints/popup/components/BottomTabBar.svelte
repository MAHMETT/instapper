<script lang="ts">
import { Clock, Home, Info, Settings } from 'lucide-svelte';

let {
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
} = $props();

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'about', label: 'About', icon: Info },
  { id: 'settings', label: 'Settings', icon: Settings },
];
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border bg-surface"
  aria-label="Main navigation"
>
  {#each tabs as tab}
    {@const isActive = activeTab === tab.id}
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors
        {isActive ? 'text-brand-indigo' : 'text-fg-muted hover:text-fg-secondary'}"
      onclick={() => onTabChange(tab.id)}
    >
      <span
        class="inline-block transition-all duration-200 {isActive
          ? '-translate-y-0.5 scale-110'
          : ''}"
      >
        <tab.icon size={20} />
      </span>
      <span>{tab.label}</span>
    </button>
  {/each}
</nav>
