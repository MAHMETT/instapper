/** Instagram's shortcode alphabet: base64url with the same ordering as the media id. */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * Media ids are Snowflake ids: a 41-bit millisecond timestamp, then 13 shard
 * bits and 10 sequence bits. So 23 low bits sit below the timestamp.
 */
const TIMESTAMP_SHIFT = 23n;

/** Instagram's Snowflake epoch — 2011-08-24T21:07:01.721Z. */
const EPOCH_MS = 1314220021721n;

/** Instagram did not exist before this, so an earlier date means a bad decode. */
const EARLIEST_MS = Date.UTC(2010, 0, 1);

/** Decode a post shortcode into its numeric media id. */
export function shortcodeToMediaId(shortcode: string): bigint | null {
  if (!shortcode) return null;

  let id = 0n;
  for (const char of shortcode) {
    const digit = ALPHABET.indexOf(char);
    if (digit === -1) return null;
    id = id * 64n + BigInt(digit);
  }
  return id;
}

/**
 * Publish time packed into a media id. BigInt is required throughout: real ids
 * are around 2e18, well past Number.MAX_SAFE_INTEGER.
 */
export function mediaIdToTimestamp(mediaId: bigint): number {
  return Number((mediaId >> TIMESTAMP_SHIFT) + EPOCH_MS);
}

/** Pull the shortcode out of a post href such as `/p/BsOGulcndj-/`. */
export function shortcodeFromHref(href: string | null | undefined): string | null {
  if (!href) return null;
  return href.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/)?.[1] ?? null;
}

/**
 * Publish time for a post href, or null when it cannot be decoded. A null here
 * is safe — undated thumbnails are always kept rather than hidden.
 */
export function publishedAtFromHref(href: string | null | undefined): number | null {
  const shortcode = shortcodeFromHref(href);
  if (!shortcode) return null;

  const mediaId = shortcodeToMediaId(shortcode);
  if (mediaId === null) return null;

  const timestamp = mediaIdToTimestamp(mediaId);
  if (!Number.isFinite(timestamp) || timestamp < EARLIEST_MS || timestamp > Date.now()) {
    return null;
  }
  return timestamp;
}
