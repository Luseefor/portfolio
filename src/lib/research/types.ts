export type ResearchItemType = 'paper' | 'blog';

export type SourceFailureCode =
  | 'SOURCE_TIMEOUT'
  | 'SOURCE_AUTH'
  | 'SOURCE_RATE_LIMIT'
  | 'SOURCE_NETWORK'
  | 'SOURCE_SCHEMA'
  | 'SOURCE_HTTP'
  | 'SOURCE_EMPTY';

export type ResearchItem = {
  id: string;
  type: ResearchItemType;
  title: string;
  url: string;
  sourceName: string;
  publishedAt?: string;
  summary?: string;
  authors?: string[];
  tags?: string[];
};

export type SourceFailure = {
  sourceId: string;
  sourceName: string;
  code: SourceFailureCode;
  message: string;
};

export type FeedResponse = {
  items: ResearchItem[];
  meta: {
    fetchedAt: string;
    partialFailures: SourceFailure[];
    totalSources: number;
    successfulSources: number;
  };
};

export type ResearchSourceConfig = {
  id: string;
  name: string;
  enabled: boolean;
  kind: 'paper' | 'blog' | 'mixed';
  endpoint: string;
  method: 'GET' | 'POST';
  authType: 'none' | 'bearer' | 'header';
  authEnvKey?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  mapping: {
    itemsPath: string;
    titlePath: string;
    urlPath: string;
    datePath?: string;
    summaryPath?: string;
    authorsPath?: string;
    tagsPath?: string;
    typePath?: string;
  };
  timeoutMs: number;
  priority: number;
};
