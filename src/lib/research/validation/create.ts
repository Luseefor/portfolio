import type { ResearchSourceConfig } from '@/lib/research/types';
import {
  asNonEmptyString,
  AUTH_TYPES,
  coerceNumber,
  METHODS,
  parseMapping,
  parseRequiredEnum,
  parseStringMap,
  parseUrl,
  SOURCE_KINDS,
} from './shared';

export function validateCreateSourceConfig(
  input: unknown,
): { value?: ResearchSourceConfig; error?: string } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { error: 'Source payload must be an object.' };
  }

  const record = input as Record<string, unknown>;
  const id = asNonEmptyString(record.id);
  const name = asNonEmptyString(record.name);
  const endpoint = parseUrl(record.endpoint);
  const method = parseRequiredEnum(asNonEmptyString(record.method)?.toUpperCase(), METHODS);
  const authType = parseRequiredEnum(record.authType, AUTH_TYPES);
  const kind = parseRequiredEnum(record.kind, SOURCE_KINDS);
  const timeoutMs = coerceNumber(record.timeoutMs);
  const priority = coerceNumber(record.priority);
  const enabled = typeof record.enabled === 'boolean' ? record.enabled : false;
  const authEnvKey = asNonEmptyString(record.authEnvKey);

  if (!id || !name || !endpoint || !method || !authType || !kind) {
    return { error: 'id, name, endpoint, method, authType, and kind are required.' };
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return { error: 'timeoutMs must be a positive number.' };
  }
  if (!Number.isFinite(priority)) {
    return { error: 'priority must be a number.' };
  }

  const mappingResult = parseMapping(record.mapping);
  if (!mappingResult.value) return { error: mappingResult.error ?? 'Invalid mapping.' };

  const headersResult = parseStringMap(record.headers);
  if (headersResult.error) return { error: `headers: ${headersResult.error}` };
  const queryResult = parseStringMap(record.query);
  if (queryResult.error) return { error: `query: ${queryResult.error}` };

  return {
    value: {
      id,
      name,
      enabled,
      kind,
      endpoint,
      method,
      authType,
      authEnvKey,
      headers: headersResult.value,
      query: queryResult.value,
      mapping: mappingResult.value,
      timeoutMs,
      priority,
    },
  };
}
