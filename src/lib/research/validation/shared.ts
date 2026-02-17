import type { ResearchSourceConfig } from '@/lib/research/types';

export type ValidationResult<T> = { value?: T; error?: string };

export const SOURCE_KINDS = new Set<ResearchSourceConfig['kind']>(['paper', 'blog', 'mixed']);
export const METHODS = new Set<ResearchSourceConfig['method']>(['GET', 'POST']);
export const AUTH_TYPES = new Set<ResearchSourceConfig['authType']>(['none', 'bearer', 'header']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseUrl(value: unknown): string | undefined {
  const candidate = asNonEmptyString(value);
  if (!candidate) return undefined;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return undefined;
  }
}

export function parseStringMap(
  value: unknown,
): { value?: Record<string, string>; error?: string; clear?: boolean } {
  if (value === undefined) return {};
  if (value === null) return { clear: true };
  if (!isRecord(value)) return { error: 'Expected an object of string key/value pairs.' };

  const parsed: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') {
      return { error: `Expected string value for key \"${key}\".` };
    }
    parsed[key] = entry;
  }
  return { value: parsed };
}

export function coerceNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value);
}

export function parseRequiredEnum<T extends string>(value: unknown, validValues: Set<T>): T | undefined {
  const parsed = asNonEmptyString(value) as T | undefined;
  if (!parsed || !validValues.has(parsed)) return undefined;
  return parsed;
}

export function parsePatchEnumField<T extends string>(
  updates: Partial<ResearchSourceConfig>,
  field: keyof Pick<ResearchSourceConfig, 'kind' | 'authType' | 'method'>,
  value: unknown,
  validValues: Set<T>,
  errorMessage: string,
) {
  const parsed = parseRequiredEnum(value, validValues);
  if (!parsed) return { error: errorMessage };
  if (field === 'kind') updates.kind = parsed as ResearchSourceConfig['kind'];
  if (field === 'authType') updates.authType = parsed as ResearchSourceConfig['authType'];
  if (field === 'method') updates.method = parsed as ResearchSourceConfig['method'];
  return {};
}

export function parseMapping(value: unknown): ValidationResult<ResearchSourceConfig['mapping']> {
  if (!isRecord(value)) return { error: 'Expected mapping to be an object.' };
  const itemsPath = asNonEmptyString(value.itemsPath);
  const titlePath = asNonEmptyString(value.titlePath);
  const urlPath = asNonEmptyString(value.urlPath);
  if (!itemsPath || !titlePath || !urlPath) {
    return { error: 'mapping.itemsPath, mapping.titlePath, and mapping.urlPath are required strings.' };
  }

  const mapping: ResearchSourceConfig['mapping'] = { itemsPath, titlePath, urlPath };
  const optionalFields: Array<keyof Omit<ResearchSourceConfig['mapping'], 'itemsPath' | 'titlePath' | 'urlPath'>> = [
    'datePath',
    'summaryPath',
    'authorsPath',
    'tagsPath',
    'typePath',
  ];
  optionalFields.forEach((field) => {
    const parsed = asNonEmptyString(value[field]);
    if (parsed) mapping[field] = parsed;
  });
  return { value: mapping };
}
