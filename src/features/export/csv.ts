const EXT_RE = /\.(jpe?g|png|webp|gif|avif|heic)$/i;

/** Extract a normalized file extension from a URL. */
export function extFromUrl(url: string): string {
  const path = url.split(/[?#]/)[0] ?? url;
  const m = path.match(EXT_RE);
  if (!m?.[1]) return 'jpg';
  return m[1].toLowerCase().replace('jpeg', 'jpg');
}

/** Build a BOM-prefixed CSV string from an array of URLs. */
export function buildCsv(urls: string[]): string {
  return `\uFEFF"Image URL"\n${urls.map((u) => `"${u}"`).join('\n')}`;
}

/** Generate a timestamped export filename. */
export function exportFilename(extension: string): string {
  return `instapper_thumbnails_${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
}
