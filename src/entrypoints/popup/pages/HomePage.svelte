<script lang="ts">
import FeatureCard from '../components/FeatureCard.svelte';

let { onNavigate }: { onNavigate: (page: string) => void } = $props();

const extractIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
  <div class="flex flex-col gap-1">
    <h1 class="text-lg font-bold text-fg">Features</h1>
    <p class="text-sm text-fg-secondary">Grab thumbnails. Instantly.</p>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <FeatureCard
      icon={extractIcon}
      title="Extract Thumbnail"
      description="Scrape thumbnails from Instagram pages"
      onClick={() => onNavigate('extract')}
    />
  </div>
</div>
