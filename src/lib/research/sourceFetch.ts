import { normalizeSourceItems, SourceNormalizeError } from '@/lib/research/normalize';
import type { ResearchItem, ResearchSourceConfig, SourceFailure } from '@/lib/research/types';

function buildUrlWithQuery(endpoint: string, query?: Record<string, string>) {
  if (!query || Object.keys(query).length === 0) return endpoint;
  const url = new URL(endpoint);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function createFailure(source: ResearchSourceConfig, code: SourceFailure['code'], message: string): SourceFailure {
  return { sourceId: source.id, sourceName: source.name, code, message };
}

function mapHttpFailure(source: ResearchSourceConfig, status: number): SourceFailure {
  if (status === 401 || status === 403) {
    return createFailure(source, 'SOURCE_AUTH', `Authentication failed (${status}).`);
  }
  if (status === 429) {
    return createFailure(source, 'SOURCE_RATE_LIMIT', 'Source rate limit exceeded (429).');
  }
  return createFailure(source, 'SOURCE_HTTP', `Source returned HTTP ${status}.`);
}

export async function fetchSource(source: ResearchSourceConfig): Promise<{
  items: ResearchItem[];
  failure?: SourceFailure;
}> {
  const headers = new Headers(source.headers ?? {});
  if (source.authType !== 'none') {
    const envKeyName = source.authEnvKey;
    const token = envKeyName ? process.env[envKeyName] : undefined;
    if (!envKeyName || !token) {
      return {
        items: [],
        failure: createFailure(source, 'SOURCE_AUTH', 'Missing authEnvKey or environment token value for source authentication.'),
      };
    }
    if (source.authType === 'bearer') headers.set('Authorization', `Bearer ${token}`);
    else headers.set('x-api-key', token);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), source.timeoutMs);

  try {
    const requestUrl = source.method === 'GET' ? buildUrlWithQuery(source.endpoint, source.query) : source.endpoint;
    if (source.method === 'POST') headers.set('content-type', 'application/json');

    const response = await fetch(requestUrl, {
      method: source.method,
      headers,
      body: source.method === 'POST' ? JSON.stringify(source.query ?? {}) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) return { items: [], failure: mapHttpFailure(source, response.status) };

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { items: [], failure: createFailure(source, 'SOURCE_SCHEMA', 'Source response was not valid JSON.') };
    }

    try {
      return { items: normalizeSourceItems(source, payload) };
    } catch (error) {
      if (error instanceof SourceNormalizeError) {
        return { items: [], failure: createFailure(source, error.code, error.message) };
      }
      return { items: [], failure: createFailure(source, 'SOURCE_SCHEMA', 'Failed to map source payload to feed items.') };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { items: [], failure: createFailure(source, 'SOURCE_TIMEOUT', `Source timed out after ${source.timeoutMs}ms.`) };
    }
    return { items: [], failure: createFailure(source, 'SOURCE_NETWORK', 'Network request to source failed.') };
  } finally {
    clearTimeout(timeout);
  }
}
