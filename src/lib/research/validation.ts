import type { ResearchSourceConfig } from '@/lib/research/types';

const SOURCE_KINDS = new Set<ResearchSourceConfig['kind']>(['paper', 'blog', 'mixed']);
const METHODS = new Set<ResearchSourceConfig['method']>(['GET', 'POST']);
const AUTH_TYPES = new Set<ResearchSourceConfig['authType']>(['none', 'bearer', 'header']);
type ValidationResult<T> = { value?: T; error?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseUrl(value: unknown): string | undefined {
  const candidate = asNonEmptyString(value);
  if (!candidate) return undefined;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return undefined;
  }
}

function parseStringMap(
  value: unknown,
): { value?: Record<string, string>; error?: string; clear?: boolean } {
  if (value === undefined) return {};
  if (value === null) return { clear: true };
  if (!isRecord(value)) {
    return { error: 'Expected an object of string key/value pairs.' };
  }

  const parsed: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') {
      return { error: `Expected string value for key \"${key}\".` };
    }
    parsed[key] = entry;
  }
  return { value: parsed };
}

function coerceNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value);
}

function parseRequiredEnum<T extends string>(
  value: unknown,
  validValues: Set<T>,
): T | undefined {
  const parsed = asNonEmptyString(value) as T | undefined;
  if (!parsed || !validValues.has(parsed)) {
    return undefined;
  }
  return parsed;
}

function parsePatchEnumField<T extends string>(
  updates: Partial<ResearchSourceConfig>,
  field: keyof Pick<ResearchSourceConfig, 'kind' | 'authType' | 'method'>,
  value: unknown,
  validValues: Set<T>,
  errorMessage: string,
) {
  const parsed = parseRequiredEnum(value, validValues);
  if (!parsed) {
    return { error: errorMessage };
  }
  updates[field] = parsed as ResearchSourceConfig[keyof Pick<ResearchSourceConfig, 'kind' | 'authType' | 'method'>];
  return {};
}

function parseMapping(
  value: unknown,
): ValidationResult<ResearchSourceConfig['mapping']> {
  if (!isRecord(value)) {
    return { error: 'Expected mapping to be an object.' };
  }

  const itemsPath = asNonEmptyString(value.itemsPath);
  const titlePath = asNonEmptyString(value.titlePath);
  const urlPath = asNonEmptyString(value.urlPath);

  if (!itemsPath || !titlePath || !urlPath) {
    return {
      error: 'mapping.itemsPath, mapping.titlePath, and mapping.urlPath are required strings.',
    };
  }

  const mapping: ResearchSourceConfig['mapping'] = {
    itemsPath,
    titlePath,
    urlPath,
  };

  const optionalFields: Array<keyof Omit<ResearchSourceConfig['mapping'], 'itemsPath' | 'titlePath' | 'urlPath'>> = [
    'datePath',
    'summaryPath',
    'authorsPath',
    'tagsPath',
    'typePath',
  ];

  optionalFields.forEach((field) => {
    const parsed = asNonEmptyString(value[field]);
    if (parsed) {
      mapping[field] = parsed;
    }
  });

  return { value: mapping };
}

export function validateCreateSourceConfig(
  input: unknown,
): { value?: ResearchSourceConfig; error?: string } {
  if (!isRecord(input)) {
    return { error: 'Source payload must be an object.' };
  }

  const id = asNonEmptyString(input.id);
  const name = asNonEmptyString(input.name);
  const endpoint = parseUrl(input.endpoint);
  const method = parseRequiredEnum(
    asNonEmptyString(input.method)?.toUpperCase(),
    METHODS,
  );
  const authType = parseRequiredEnum(input.authType, AUTH_TYPES);
  const kind = parseRequiredEnum(input.kind, SOURCE_KINDS);
  const timeoutMs = coerceNumber(input.timeoutMs);
  const priority = coerceNumber(input.priority);
  const enabled = typeof input.enabled === 'boolean' ? input.enabled : false;
  const authEnvKey = asNonEmptyString(input.authEnvKey);

  if (!id || !name || !endpoint || !method || !authType || !kind) {
    return {
      error: 'id, name, endpoint, method, authType, and kind are required.',
    };
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return { error: 'timeoutMs must be a positive number.' };
  }

  if (!Number.isFinite(priority)) {
    return { error: 'priority must be a number.' };
  }

  const mappingResult = parseMapping(input.mapping);
  if (!mappingResult.value) {
    return { error: mappingResult.error ?? 'Invalid mapping.' };
  }

  const headersResult = parseStringMap(input.headers);
  if (headersResult.error) {
    return { error: `headers: ${headersResult.error}` };
  }

  const queryResult = parseStringMap(input.query);
  if (queryResult.error) {
    return { error: `query: ${queryResult.error}` };
  }

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

export function validatePatchSourceConfig(
  input: unknown,
): { value?: Partial<ResearchSourceConfig>; error?: string } {
  if (!isRecord(input)) {
    return { error: 'Patch payload must be an object.' };
  }

  const updates: Partial<ResearchSourceConfig> = {};

  if ('name' in input) {
    const name = asNonEmptyString(input.name);
    if (!name) return { error: 'name must be a non-empty string.' };
    updates.name = name;
  }

  if ('enabled' in input) {
    if (typeof input.enabled !== 'boolean') {
      return { error: 'enabled must be a boolean.' };
    }
    updates.enabled = input.enabled;
  }

  if ('kind' in input) {
    const result = parsePatchEnumField(updates, 'kind', input.kind, SOURCE_KINDS, 'kind must be paper, blog, or mixed.');
    if (result.error) return result;
  }

  if ('endpoint' in input) {
    const endpoint = parseUrl(input.endpoint);
    if (!endpoint) {
      return { error: 'endpoint must be a valid URL.' };
    }
    updates.endpoint = endpoint;
  }

  if ('method' in input) {
    const result = parsePatchEnumField(
      updates,
      'method',
      asNonEmptyString(input.method)?.toUpperCase(),
      METHODS,
      'method must be GET or POST.',
    );
    if (result.error) return result;
  }

  if ('authType' in input) {
    const result = parsePatchEnumField(
      updates,
      'authType',
      input.authType,
      AUTH_TYPES,
      'authType must be none, bearer, or header.',
    );
    if (result.error) return result;
  }

  if ('authEnvKey' in input) {
    if (input.authEnvKey === null || input.authEnvKey === '') {
      updates.authEnvKey = undefined;
    } else {
      const authEnvKey = asNonEmptyString(input.authEnvKey);
      if (!authEnvKey) {
        return { error: 'authEnvKey must be a non-empty string when provided.' };
      }
      updates.authEnvKey = authEnvKey;
    }
  }

  if ('headers' in input) {
    const headersResult = parseStringMap(input.headers);
    if (headersResult.error) {
      return { error: `headers: ${headersResult.error}` };
    }
    updates.headers = headersResult.clear ? undefined : headersResult.value;
  }

  if ('query' in input) {
    const queryResult = parseStringMap(input.query);
    if (queryResult.error) {
      return { error: `query: ${queryResult.error}` };
    }
    updates.query = queryResult.clear ? undefined : queryResult.value;
  }

  if ('mapping' in input) {
    const mappingResult = parseMapping(input.mapping);
    if (!mappingResult.value) {
      return { error: mappingResult.error ?? 'Invalid mapping payload.' };
    }
    updates.mapping = mappingResult.value;
  }

  if ('timeoutMs' in input) {
    const timeoutMs = coerceNumber(input.timeoutMs);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      return { error: 'timeoutMs must be a positive number.' };
    }
    updates.timeoutMs = timeoutMs;
  }

  if ('priority' in input) {
    const priority = coerceNumber(input.priority);
    if (!Number.isFinite(priority)) {
      return { error: 'priority must be a number.' };
    }
    updates.priority = priority;
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No valid fields were provided to patch.' };
  }

  return { value: updates };
}
