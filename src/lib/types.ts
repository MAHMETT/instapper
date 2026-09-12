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
