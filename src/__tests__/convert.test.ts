import { describe, expect, it } from 'vitest';
import { needsConversion, targetExt } from '@/features/export/convert';

describe('needsConversion', () => {
  it('leaves images already in the target format untouched', () => {
    expect(needsConversion('image/jpeg', 'jpeg')).toBe(false);
    expect(needsConversion('image/png', 'png')).toBe(false);
  });

  it('converts every other source format', () => {
    for (const type of ['image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/png', '']) {
      expect(needsConversion(type, 'jpeg')).toBe(true);
    }
    expect(needsConversion('image/jpeg', 'png')).toBe(true);
  });
});

describe('targetExt', () => {
  it('maps formats to file extensions', () => {
    expect(targetExt('jpeg')).toBe('jpg');
    expect(targetExt('png')).toBe('png');
  });
});
