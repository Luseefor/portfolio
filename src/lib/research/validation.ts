import type { ResearchSourceConfig } from '@/lib/research/types';

const SOURCE_KINDS = new Set<ResearchSourceConfig['kind']>(['paper', 'blog', 'mixed']);
const METHODS = new Set<ResearchSourceConfig['method']>(['GET', 'POST']);
const AUTH_TYPES = new Set<ResearchSourceConfig['authType']>(['none', 'bearer', 'header']);

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

function parseMapping(
  value: unknown,
): { value?: ResearchSourceConfig['mapping']; error?: string } {
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
  const method = asNonEmptyString(input.method)?.toUpperCase() as ResearchSourceConfig['method'] | undefined;
  const authType = asNonEmptyString(input.authType) as ResearchSourceConfig['authType'] | undefined;
  const kind = asNonEmptyString(input.kind) as ResearchSourceConfig['kind'] | undefined;
  const timeoutMs = typeof input.timeoutMs === 'number' ? input.timeoutMs : Number(input.timeoutMs);
  const priority = typeof input.priority === 'number' ? input.priority : Number(input.priority);
  const enabled = typeof input.enabled === 'boolean' ? input.enabled : false;
  const authEnvKey = asNonEmptyString(input.authEnvKey);

  if (!id || !name || !endpoint || !method || !authType || !kind) {
    return {
      error: 'id, name, endpoint, method, authType, and kind are required.',
    };
  }

  if (!METHODS.has(method)) {
    return { error: 'method must be GET or POST.' };
  }

  if (!AUTH_TYPES.has(authType)) {
    return { error: 'authType must be none, bearer, or header.' };
  }

  if (!SOURCE_KINDS.has(kind)) {
    return { error: 'kind must be paper, blog, or mixed.' };
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
    const kind = asNonEmptyString(input.kind) as ResearchSourceConfig['kind'] | undefined;
    if (!kind || !SOURCE_KINDS.has(kind)) {
      return { error: 'kind must be paper, blog, or mixed.' };
    }
    updates.kind = kind;
  }

  if ('endpoint' in input) {
    const endpoint = parseUrl(input.endpoint);
    if (!endpoint) {
      return { error: 'endpoint must be a valid URL.' };
    }
    updates.endpoint = endpoint;
  }

  if ('method' in input) {
    const method = asNonEmptyString(input.method)?.toUpperCase() as
      | ResearchSourceConfig['method']
      | undefined;
    if (!method || !METHODS.has(method)) {
      return { error: 'method must be GET or POST.' };
    }
    updates.method = method;
  }

  if ('authType' in input) {
    const authType = asNonEmptyString(input.authType) as ResearchSourceConfig['authType'] | undefined;
    if (!authType || !AUTH_TYPES.has(authType)) {
      return { error: 'authType must be none, bearer, or header.' };
    }
    updates.authType = authType;
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
    const timeoutMs =
      typeof input.timeoutMs === 'number' ? input.timeoutMs : Number(input.timeoutMs);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      return { error: 'timeoutMs must be a positive number.' };
    }
    updates.timeoutMs = timeoutMs;
  }

  if ('priority' in input) {
    const priority = typeof input.priority === 'number' ? input.priority : Number(input.priority);
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
