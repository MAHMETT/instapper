import { describe, expect, it } from 'vitest';
import { buildCsv, exportFilename } from '@/features/export/csv';

describe('buildCsv', () => {
  it('returns BOM-prefixed CSV with header row', () => {
    const result = buildCsv([]);
    expect(result).toBe('\uFEFF"Image URL"\n');
  });

  it('correctly quotes URLs containing commas', () => {
    const result = buildCsv(['https://example.com/a.jpg,b.jpg']);
    const lines = result.split('\n');
    expect(lines[1]).toBe('"https://example.com/a.jpg,b.jpg"');
  });

  it('handles empty array (just header)', () => {
    const result = buildCsv([]);
    expect(result).toBe('\uFEFF"Image URL"\n');
  });

  it('handles single URL', () => {
    const result = buildCsv(['https://example.com/photo.jpg']);
    const lines = result.split('\n');
    expect(lines[0]).toBe('\uFEFF"Image URL"');
    expect(lines[1]).toBe('"https://example.com/photo.jpg"');
  });

  it('handles multiple URLs', () => {
    const urls = [
      'https://example.com/1.jpg',
      'https://example.com/2.png',
      'https://example.com/3.webp',
    ];
    const result = buildCsv(urls);
    const lines = result.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('\uFEFF"Image URL"');
    expect(lines[1]).toBe('"https://example.com/1.jpg"');
    expect(lines[2]).toBe('"https://example.com/2.png"');
    expect(lines[3]).toBe('"https://example.com/3.webp"');
  });
});

describe('exportFilename', () => {
  it('returns string ending with the given extension', () => {
    const result = exportFilename('csv');
    expect(result).toMatch(/\.csv$/);
  });

  it('format matches instapper_thumbnails_<timestamp>.<ext>', () => {
    const result = exportFilename('json');
    expect(result).toMatch(/^instapper_thumbnails_[\w-]+\.json$/);
  });
});
