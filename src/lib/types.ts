/** Daftar URL thumbnail unik yang sudah tersimpan di local storage. */
export type ScrapedImages = string[];

/** Payload untuk aksi unduh dari popup ke background. */
export interface DownloadPayload {
  data: string;
  filename: string;
}

/** Hasil aksi unduh. */
export interface DownloadResult {
  success: boolean;
  error?: string;
}

/** Progres export gambar ke ZIP. */
export interface ExportProgress {
  phase: 'fetching' | 'zipping';
  done: number;
  total: number;
}

/** Hasil export gambar ke ZIP. */
export interface ExportResult {
  ok: boolean;
  total: number;
  failed: number;
  error?: string;
}
