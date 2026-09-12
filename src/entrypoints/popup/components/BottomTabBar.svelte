<script lang="ts">
let {
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
} = $props();

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    id: 'history',
    label: 'History',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
  {
    id: 'about',
    label: 'About',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  },
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
      <span class="[&>svg]:pointer-events-none [&>svg]:shrink-0">{@html tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  {/each}
</nav>
