/** A scraped thumbnail and the publish time of the post it came from. */
export interface ScrapedImage {
  url: string;
  /** Post publish time in ms since the Unix epoch, or null when undeterminable. */
  takenAt: number | null;
}

/** Unique thumbnails stored in local storage. */
export type ScrapedImages = ScrapedImage[];

/** Whether an exported ZIP keeps a flat layout or buckets files by post month. */
export type ZipGrouping = 'flat' | 'by-date';

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
  images: ScrapedImage[];
}

/** Image format every thumbnail is converted to inside an exported ZIP. */
export type ZipImageFormat = 'png' | 'jpeg';

/** User-configurable preferences. */
export interface Settings {
  zipImageFormat: ZipImageFormat;
}

/** Persisted UI navigation state. */
export interface UIState {
  activeTab: 'home' | 'history' | 'about' | 'settings';
  subPage: string | null;
}

/** The currently active scraping session metadata. */
export interface CurrentSession {
  sourceUrl: string;
  startTime: number;
  tabId?: number;
}
