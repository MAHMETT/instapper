<script lang="ts">
import { ExternalLink } from 'lucide-svelte';
// About page — static content
</script>

<div class="flex flex-1 flex-col items-center gap-5 p-4">
  <!-- Logo + Wordmark -->
  <div class="flex items-center gap-2.5">
    <img src="/logo.png" alt="Instapper" class="h-7 w-7 shrink-0">
    <span
      class="bg-linear-to-r from-brand-indigo via-brand-blue to-brand-cyan bg-clip-text font-brand text-lg font-bold tracking-[-0.03em] text-transparent"
    >
      instapper
    </span>
  </div>

  <p class="text-sm text-fg-secondary">Grab thumbnails. Instantly.</p>

  <!-- Details -->
  <div class="w-full rounded-xl border border-border bg-surface p-4">
    <dl class="flex flex-col gap-3 text-sm">
      <div class="flex items-center justify-between">
        <dt class="text-fg-muted">Version</dt>
        <dd class="font-mono text-xs text-fg-secondary">1.1.2</dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex flex-col gap-1.5">
        <dt class="text-fg-muted">Contributors</dt>
        <dd class="flex items-center gap-3">
          <a
            href="https://github.com/andikadevs"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-2"
          >
            <img
              src="https://github.com/andikadevs.png"
              alt="andikadevs"
              class="h-8 w-8 rounded-full ring-2 ring-border transition-all group-hover:ring-brand-indigo"
              loading="lazy"
            >
            <span class="text-xs text-fg-secondary transition-colors group-hover:text-fg"
              >@andikadevs</span
            >
          </a>
          <a
            href="https://github.com/MAHMETT"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-2"
          >
            <img
              src="https://github.com/MAHMETT.png"
              alt="MAHMETT"
              class="h-8 w-8 rounded-full ring-2 ring-border transition-all group-hover:ring-brand-indigo"
              loading="lazy"
            >
            <span class="text-xs text-fg-secondary transition-colors group-hover:text-fg"
              >@MAHMETT</span
            >
          </a>
        </dd>
      </div>
      <div class="h-px bg-border"></div>
      <div class="flex flex-col gap-1">
        <dt class="text-fg-muted">Source</dt>
        <dd>
          <a
            href="https://github.com/MAHMETT/instapper"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-brand-indigo transition-colors hover:text-brand-blue hover:underline"
          >
            GitHub
            <ExternalLink size={12} />
          </a>
        </dd>
      </div>
    </dl>
  </div>

  <p class="text-xs text-fg-muted">Not affiliated with Instagram or Meta. Use responsibly.</p>
</div>
