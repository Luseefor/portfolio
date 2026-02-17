import { getValueAtPath } from '@/lib/research/path';
import type {
  ResearchItem,
  ResearchItemType,
  ResearchSourceConfig,
  SourceFailureCode,
} from '@/lib/research/types';

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toNonEmptyStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const values = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);
    return values.length > 0 ? values : undefined;
  }

  if (typeof value === 'string') {
    const values = value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    return values.length > 0 ? values : undefined;
  }

  return undefined;
}

function readOptionalMappedString(
  entry: unknown,
  path: string | undefined,
): string | undefined {
  if (!path) return undefined;
  return toNonEmptyString(getValueAtPath(entry, path));
}

function readOptionalMappedStringArray(
  entry: unknown,
  path: string | undefined,
): string[] | undefined {
  if (!path) return undefined;
  return toNonEmptyStringArray(getValueAtPath(entry, path));
}

function resolveItemType(source: ResearchSourceConfig, entry: unknown): ResearchItemType {
  if (source.mapping.typePath) {
    const mapped = toNonEmptyString(getValueAtPath(entry, source.mapping.typePath))?.toLowerCase();
    if (mapped === 'paper' || mapped === 'blog') {
      return mapped;
    }
  }

  if (source.kind === 'paper' || source.kind === 'blog') {
    return source.kind;
  }

  return 'blog';
}

export class SourceNormalizeError extends Error {
  readonly code: SourceFailureCode;

  constructor(code: SourceFailureCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function normalizeSourceItems(
  source: ResearchSourceConfig,
  payload: unknown,
): ResearchItem[] {
  const mappedItems = getValueAtPath(payload, source.mapping.itemsPath);
  if (!Array.isArray(mappedItems)) {
    throw new SourceNormalizeError(
      'SOURCE_SCHEMA',
      `itemsPath \"${source.mapping.itemsPath}\" did not resolve to an array.`,
    );
  }

  const normalized: ResearchItem[] = [];

  mappedItems.forEach((entry, index) => {
    const title = toNonEmptyString(getValueAtPath(entry, source.mapping.titlePath));
    const url = toNonEmptyString(getValueAtPath(entry, source.mapping.urlPath));

    if (!title || !url) {
      return;
    }

    const publishedAt = readOptionalMappedString(entry, source.mapping.datePath);
    const summary = readOptionalMappedString(entry, source.mapping.summaryPath);
    const authors = readOptionalMappedStringArray(entry, source.mapping.authorsPath);
    const tags = readOptionalMappedStringArray(entry, source.mapping.tagsPath);

    normalized.push({
      id: `${source.id}-${index}`,
      type: resolveItemType(source, entry),
      title,
      url,
      sourceName: source.name,
      publishedAt,
      summary,
      authors,
      tags,
    });
  });

  if (normalized.length === 0) {
    throw new SourceNormalizeError(
      'SOURCE_EMPTY',
      'No valid research entries were mapped from this source.',
    );
  }

  return normalized;
}
