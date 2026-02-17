import type { ResearchSourceConfig } from '@/lib/research/types';
import {
  asNonEmptyString,
  AUTH_TYPES,
  coerceNumber,
  METHODS,
  parseMapping,
  parsePatchEnumField,
  parseStringMap,
  parseUrl,
  SOURCE_KINDS,
} from './shared';

export function validatePatchSourceConfig(
  input: unknown,
): { value?: Partial<ResearchSourceConfig>; error?: string } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { error: 'Patch payload must be an object.' };
  }

  const record = input as Record<string, unknown>;
  const updates: Partial<ResearchSourceConfig> = {};

  if ('name' in record) {
    const name = asNonEmptyString(record.name);
    if (!name) return { error: 'name must be a non-empty string.' };
    updates.name = name;
  }
  if ('enabled' in record) {
    if (typeof record.enabled !== 'boolean') return { error: 'enabled must be a boolean.' };
    updates.enabled = record.enabled;
  }
  if ('kind' in record) {
    const result = parsePatchEnumField(updates, 'kind', record.kind, SOURCE_KINDS, 'kind must be paper, blog, or mixed.');
    if (result.error) return result;
  }
  if ('endpoint' in record) {
    const endpoint = parseUrl(record.endpoint);
    if (!endpoint) return { error: 'endpoint must be a valid URL.' };
    updates.endpoint = endpoint;
  }
  if ('method' in record) {
    const result = parsePatchEnumField(
      updates,
      'method',
      asNonEmptyString(record.method)?.toUpperCase(),
      METHODS,
      'method must be GET or POST.',
    );
    if (result.error) return result;
  }
  if ('authType' in record) {
    const result = parsePatchEnumField(
      updates,
      'authType',
      record.authType,
      AUTH_TYPES,
      'authType must be none, bearer, or header.',
    );
    if (result.error) return result;
  }
  if ('authEnvKey' in record) {
    if (record.authEnvKey === null || record.authEnvKey === '') {
      updates.authEnvKey = undefined;
    } else {
      const authEnvKey = asNonEmptyString(record.authEnvKey);
      if (!authEnvKey) return { error: 'authEnvKey must be a non-empty string when provided.' };
      updates.authEnvKey = authEnvKey;
    }
  }
  if ('headers' in record) {
    const headersResult = parseStringMap(record.headers);
    if (headersResult.error) return { error: `headers: ${headersResult.error}` };
    updates.headers = headersResult.clear ? undefined : headersResult.value;
  }
  if ('query' in record) {
    const queryResult = parseStringMap(record.query);
    if (queryResult.error) return { error: `query: ${queryResult.error}` };
    updates.query = queryResult.clear ? undefined : queryResult.value;
  }
  if ('mapping' in record) {
    const mappingResult = parseMapping(record.mapping);
    if (!mappingResult.value) return { error: mappingResult.error ?? 'Invalid mapping payload.' };
    updates.mapping = mappingResult.value;
  }
  if ('timeoutMs' in record) {
    const timeoutMs = coerceNumber(record.timeoutMs);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return { error: 'timeoutMs must be a positive number.' };
    updates.timeoutMs = timeoutMs;
  }
  if ('priority' in record) {
    const priority = coerceNumber(record.priority);
    if (!Number.isFinite(priority)) return { error: 'priority must be a number.' };
    updates.priority = priority;
  }
  if (Object.keys(updates).length === 0) return { error: 'No valid fields were provided to patch.' };
  return { value: updates };
}
