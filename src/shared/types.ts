/** List of unique thumbnail URLs stored in local storage. */
export type ScrapedImages = string[];

/** Image export progress to ZIP. */
export interface ExportProgress {
  phase: 'fetching' | 'zipping';
  done: number;
  total: number;
}

export type ExportJobStatus = 'idle' | 'running' | 'done' | 'error';

export interface ExportJobState {
  status: ExportJobStatus;
  phase: 'fetching' | 'zipping' | null;
  done: number;
  total: number;
  failed: number;
  error?: string;
  filename?: string;
}

export interface ExportRunResult {
  ok: true;
  blobUrl: string;
  filename: string;
  total: number;
  failed: number;
}

export interface ExportRunError {
  ok: false;
  error: string;
}

/** A saved scraping session in history. */
export interface ScrapingSession {
  id: string;
  date: number;
  sourceUrl: string;
  thumbnailCount: number;
  images: string[];
}

/** Persisted UI navigation state. */
export interface UIState {
  activeTab: 'home' | 'history' | 'about';
  subPage: string | null;
}

/** The currently active scraping session metadata. */
export interface CurrentSession {
  sourceUrl: string;
  startTime: number;
  tabId?: number;
}
