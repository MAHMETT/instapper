<script lang="ts">
import { Image as ImageIcon } from 'lucide-svelte';
import type { Component } from 'svelte';
import { t } from '@/features/i18n/locale';
import FeatureCard from '../components/FeatureCard.svelte';

let { onNavigate }: { onNavigate: (page: string) => void } = $props();

// lucide-svelte exports extend SvelteComponentTyped; cast to Component for prop typing
const IconComponent = ImageIcon as unknown as Component;
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
  <div class="flex flex-col gap-1">
    <h1 class="text-lg font-bold text-fg">{$t('home.title')}</h1>
    <p class="text-sm text-fg-secondary">{$t('home.tagline')}</p>
  </div>

  <div class="grid grid-cols-2 gap-3">
    <FeatureCard
      Icon={IconComponent}
      title={$t('home.extract.title')}
      description={$t('home.extract.description')}
      onClick={() => onNavigate('extract')}
    />
  </div>
</div>
