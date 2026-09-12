<script lang="ts">
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mt-1 shrink-0 text-success/60 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              {session.thumbnailCount}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand-cyan focus-visible:outline-offset-2 group-hover:opacity-100"
            aria-label="Delete session"
            onclick={() => deleteSession(session.id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
        Clear All History
      </button>
    </div>
  {:else if !hasActiveSession}
    <div class="flex flex-1 flex-col items-center justify-center gap-3 p-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-fg-muted"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <p class="text-sm font-medium text-fg-muted">No history yet</p>
    </div>
  {/if}

  <ConfirmClearDialog bind:open={showClearDialog} onConfirm={clearAllHistory} />
</div>
