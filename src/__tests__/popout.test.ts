import { describe, expect, it, vi } from 'vitest';
import { buildPopoutUrl, parsePopoutParams } from '@/features/popout/popout';

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      getURL: (path: string) => `chrome-extension://abc123${path}`,
    },
  },
}));

describe('parsePopoutParams', () => {
  it('returns popout=false for empty search', () => {
    expect(parsePopoutParams('')).toEqual({ popout: false, senderTabId: null });
  });

  it('returns popout=true when uilocation=popout', () => {
    expect(parsePopoutParams('?uilocation=popout')).toEqual({
      popout: true,
      senderTabId: null,
    });
  });

  it('parses senderTabId from params', () => {
    expect(parsePopoutParams('?uilocation=popout&senderTabId=123')).toEqual({
      popout: true,
      senderTabId: 123,
    });
  });

  it('returns null senderTabId for non-numeric values', () => {
    expect(parsePopoutParams('?senderTabId=abc')).toEqual({
      popout: false,
      senderTabId: null,
    });
  });

  it('returns null senderTabId for Infinity', () => {
    expect(parsePopoutParams('?senderTabId=Infinity')).toEqual({
      popout: false,
      senderTabId: null,
    });
  });
});

describe('buildPopoutUrl', () => {
  it('builds URL with uilocation=popout', () => {
    const url = buildPopoutUrl();
    expect(url).toContain('uilocation=popout');
    expect(url).toContain('popup.html');
  });

  it('includes senderTabId when provided', () => {
    const url = buildPopoutUrl(42);
    expect(url).toContain('senderTabId=42');
  });

  it('omits senderTabId when not provided', () => {
    const url = buildPopoutUrl();
    expect(url).not.toContain('senderTabId');
  });
});
