import { describe, expect, it } from 'vitest';
import {
  mediaIdToTimestamp,
  publishedAtFromHref,
  shortcodeFromHref,
  shortcodeToMediaId,
} from '@/features/scraping/post-date';

/** The date component in UTC, which is what the decoder should land on. */
function utcDay(timestamp: number | null): string {
  if (timestamp === null) return 'null';
  return new Date(timestamp).toISOString().slice(0, 10);
}

describe('publishedAtFromHref', () => {
  // Two real posts with independently documented dates. These pin the
  // shortcode alphabet, the 23-bit shift and the Snowflake epoch together.
  it('decodes the world-record egg post as 2019-01-04', () => {
    expect(utcDay(publishedAtFromHref('/p/BsOGulcndj-/'))).toBe('2019-01-04');
  });

  it('decodes a post whose page states 2019-01-14', () => {
    expect(utcDay(publishedAtFromHref('https://www.instagram.com/p/Bsn0j-EBUsY/'))).toBe(
      '2019-01-14',
    );
  });

  it('accepts reel and tv hrefs', () => {
    expect(utcDay(publishedAtFromHref('/reel/BsOGulcndj-/'))).toBe('2019-01-04');
    expect(utcDay(publishedAtFromHref('/reels/BsOGulcndj-/'))).toBe('2019-01-04');
    expect(utcDay(publishedAtFromHref('/tv/BsOGulcndj-/'))).toBe('2019-01-04');
  });

  it('returns null for hrefs that are not posts', () => {
    expect(publishedAtFromHref('/explore/tags/photography/')).toBeNull();
    expect(publishedAtFromHref('https://www.instagram.com/someuser/')).toBeNull();
    expect(publishedAtFromHref('')).toBeNull();
    expect(publishedAtFromHref(null)).toBeNull();
    expect(publishedAtFromHref(undefined)).toBeNull();
  });
});

describe('shortcodeToMediaId', () => {
  it('decodes ids beyond Number.MAX_SAFE_INTEGER, so BigInt is required', () => {
    const id = shortcodeToMediaId('BsOGulcndj-');
    expect(id).not.toBeNull();
    expect((id as bigint) > BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it('treats the alphabet as base64url-ordered', () => {
    expect(shortcodeToMediaId('A')).toBe(0n);
    expect(shortcodeToMediaId('B')).toBe(1n);
    expect(shortcodeToMediaId('Z')).toBe(25n);
    expect(shortcodeToMediaId('a')).toBe(26n);
    expect(shortcodeToMediaId('z')).toBe(51n);
    expect(shortcodeToMediaId('0')).toBe(52n);
    expect(shortcodeToMediaId('9')).toBe(61n);
    expect(shortcodeToMediaId('-')).toBe(62n);
    expect(shortcodeToMediaId('_')).toBe(63n);
    expect(shortcodeToMediaId('BA')).toBe(64n);
  });

  it('rejects characters outside the alphabet', () => {
    expect(shortcodeToMediaId('abc!')).toBeNull();
    expect(shortcodeToMediaId('a b')).toBeNull();
    expect(shortcodeToMediaId('')).toBeNull();
  });
});

describe('shortcodeFromHref', () => {
  it('extracts the shortcode from post hrefs', () => {
    expect(shortcodeFromHref('/p/BsOGulcndj-/')).toBe('BsOGulcndj-');
    expect(shortcodeFromHref('https://www.instagram.com/p/Bsn0j-EBUsY/')).toBe('Bsn0j-EBUsY');
    expect(shortcodeFromHref('/p/BsOGulcndj-/?utm_source=ig_share')).toBe('BsOGulcndj-');
  });

  it('returns null when there is no shortcode', () => {
    expect(shortcodeFromHref('/explore/tags/cats/')).toBeNull();
    expect(shortcodeFromHref(null)).toBeNull();
  });
});

describe('mediaIdToTimestamp', () => {
  it('anchors the Instagram epoch to 2011-08-24', () => {
    // An id of zero sits exactly on the custom epoch.
    expect(new Date(mediaIdToTimestamp(0n)).toISOString()).toBe('2011-08-24T21:07:01.721Z');
  });

  it('increases with the id', () => {
    expect(mediaIdToTimestamp(1n << 23n)).toBe(mediaIdToTimestamp(0n) + 1);
  });
});
