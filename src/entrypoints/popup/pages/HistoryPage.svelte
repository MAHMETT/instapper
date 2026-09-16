<script lang="ts">
import { ChevronRight, Clock, Trash } from 'lucide-svelte';
import ImageIcon from 'lucide-svelte/icons/image';
import { currentSession, scrapedImages, scrapingHistory } from '@/shared/storage';
import type { ScrapingSession } from '@/shared/types';
import ConfirmClearDialog from '../components/ConfirmClearDialog.svelte';

let {
  onNavigateToExtract,
  onViewDetail,
}: {
  onNavigateToExtract: () => void;
  onViewDetail: (session: ScrapingSession) => void;
} = $props();

let history = $state<ScrapingSession[]>([]);
let activeSessionUrl = $state('');
let activeImageCount = $state(0);
let showClearDialog = $state(false);

const hasActiveSession = $derived(activeSessionUrl !== '' || activeImageCount > 0);

// ── Storage sync ────────────────────────────────────────
$effect(() => {
  scrapingHistory.getValue().then((v) => (history = v));
  currentSession.getValue().then((v) => (activeSessionUrl = v?.sourceUrl ?? ''));
  scrapedImages.getValue().then((v) => (activeImageCount = v.length));

  const unHistory = scrapingHistory.watch((v) => (history = v));
  const unSession = currentSession.watch((v) => (activeSessionUrl = v?.sourceUrl ?? ''));
  const unImages = scrapedImages.watch((v) => (activeImageCount = v.length));

  return () => {
    unHistory();
    unSession();
    unImages();
  };
});

// ── Helpers ─────────────────────────────────────────────
function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date(ts))
    .replace(',', ',');
}

function truncateUrl(url: string, max = 30): string {
  if (url.length <= max) return url;
  return `${url.slice(0, max)}\u2026`;
}

async function deleteSession(id: string) {
  const current = await scrapingHistory.getValue();
  await scrapingHistory.setValue(current.filter((s) => s.id !== id));
}

async function clearAllHistory() {
  await scrapingHistory.setValue([]);
  showClearDialog = false;
}
</script>

<div class="flex flex-1 flex-col gap-3 p-4">
  <div class="flex flex-col gap-0.5">
    <h1 class="text-lg font-bold text-fg">History</h1>
    <p class="text-sm text-fg-secondary">Past scraping sessions</p>
  </div>

  {#if hasActiveSession}
    <button
      type="button"
      class="group flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-left transition-colors hover:border-success/50 hover:bg-success/15 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
      onclick={onNavigateToExtract}
    >
      <span class="relative mt-1 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
        <span
          class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40"
        ></span>
        <span class="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
      </span>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span
          class="inline-flex w-fit items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success"
        >
          Active Session
        </span>
        {#if activeSessionUrl}
          <span class="truncate font-mono text-xs text-fg-secondary" title={activeSessionUrl}>
            {truncateUrl(activeSessionUrl)}
          </span>
        {/if}
        <span class="text-xs text-fg-muted">
          {activeImageCount}
          thumbnail{activeImageCount !== 1 ? 's' : ''}
          collected
        </span>
      </div>
      <ChevronRight
        size={14}
        class="mt-1 shrink-0 text-success/60 transition-transform group-hover:translate-x-0.5"
      />
    </button>
  {/if}

  {#if history.length > 0}
    <div class="flex flex-col gap-2">
      {#each history as session (session.id)}
        <div
          class="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-border/80 hover:bg-surface-secondary/50"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 items-center gap-3 text-left"
            onclick={() => onViewDetail(session)}
          >
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="text-xs font-medium text-fg">{formatDate(session.date)}</span>
              <span class="truncate font-mono text-[11px] text-fg-muted" title={session.sourceUrl}>
                {truncateUrl(session.sourceUrl)}
              </span>
            </div>
            <span
              class="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-1 text-xs font-medium text-fg-secondary"
            >
              <ImageIcon size={12} />
              {session.thumbnailCount}
            </span>
            <ChevronRight
              size={14}
              class="shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5"
            />
          </button>
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 group-hover:opacity-100"
            aria-label="Delete session"
            onclick={() => deleteSession(session.id)}
          >
            <Trash size={14} />
          </button>
        </div>
      {/each}
    </div>

    <div class="mt-2">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/15 hover:border-danger/40 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2"
        onclick={() => (showClearDialog = true)}
      >
        <Trash size={14} />
        Clear All History
      </button>
    </div>
  {:else if !hasActiveSession}
    <div class="flex flex-1 flex-col items-center justify-center gap-3 p-4">
      <Clock size={32} class="text-fg-muted" />
      <p class="text-sm font-medium text-fg-muted">No history yet</p>
    </div>
  {/if}

  <ConfirmClearDialog
    bind:open={showClearDialog}
    title="Delete all history?"
    description="This permanently removes every saved session. Any ZIP or CSV you already exported is not affected."
    confirmLabel="Delete all"
    onConfirm={clearAllHistory}
  />
</div>
