/** Build a BOM-prefixed CSV string from an array of URLs. */
export function buildCsv(urls: string[]): string {
  return `\uFEFF"Image URL"\n${urls.map((u) => `"${u}"`).join('\n')}`;
}

/** Generate a timestamped export filename. */
export function exportFilename(extension: string): string {
  return `instapper_thumbnails_${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
}
