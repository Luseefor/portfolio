import { describe, expect, it } from 'vitest';
import {
  normalizeSourceItems,
  SourceNormalizeError,
} from '@/lib/research/normalize';
import type { ResearchSourceConfig } from '@/lib/research/types';

const SOURCE_CONFIG: ResearchSourceConfig = {
  id: 'demo',
  name: 'Demo Source',
  enabled: true,
  kind: 'mixed',
  endpoint: 'https://example.com',
  method: 'GET',
  authType: 'none',
  timeoutMs: 5_000,
  priority: 1,
  mapping: {
    itemsPath: 'data.items',
    titlePath: 'title',
    urlPath: 'url',
    datePath: 'publishedAt',
    summaryPath: 'summary',
    authorsPath: 'authors',
    tagsPath: 'tags',
    typePath: 'kind',
  },
};

describe('normalizeSourceItems', () => {
  it('maps valid records and drops malformed entries', () => {
    const result = normalizeSourceItems(SOURCE_CONFIG, {
      data: {
        items: [
          {
            title: '  Valid Item  ',
            url: 'https://example.com/post',
            publishedAt: '2026-01-01',
            summary: ' Summary ',
            authors: 'Alice, Bob',
            tags: ['dungeon', ' gameplay '],
            kind: 'paper',
          },
          {
            title: '',
            url: 'https://example.com/skip',
          },
        ],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'demo-0',
      type: 'paper',
      title: 'Valid Item',
      url: 'https://example.com/post',
      sourceName: 'Demo Source',
      publishedAt: '2026-01-01',
      summary: 'Summary',
      authors: ['Alice', 'Bob'],
      tags: ['dungeon', 'gameplay'],
    });
  });

  it('throws schema errors when itemsPath is not an array', () => {
    expect(() =>
      normalizeSourceItems(SOURCE_CONFIG, {
        data: {
          items: {},
        },
      }),
    ).toThrowError(SourceNormalizeError);
  });
});
