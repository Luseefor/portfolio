import { getValueAtPath } from '@/lib/research/path';
import type {
  ResearchItem,
  ResearchItemType,
  ResearchSourceConfig,
  SourceFailureCode,
} from '@/lib/research/types';

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const arr = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);
    return arr.length > 0 ? arr : undefined;
  }

  if (typeof value === 'string') {
    const split = value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    return split.length > 0 ? split : undefined;
  }

  return undefined;
}

function resolveItemType(source: ResearchSourceConfig, entry: unknown): ResearchItemType {
  if (source.mapping.typePath) {
    const mapped = asString(getValueAtPath(entry, source.mapping.typePath))?.toLowerCase();
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
  const rawItems = getValueAtPath(payload, source.mapping.itemsPath);
  if (!Array.isArray(rawItems)) {
    throw new SourceNormalizeError(
      'SOURCE_SCHEMA',
      `itemsPath \"${source.mapping.itemsPath}\" did not resolve to an array.`,
    );
  }

  const normalized: ResearchItem[] = [];

  rawItems.forEach((entry, index) => {
    const title = asString(getValueAtPath(entry, source.mapping.titlePath));
    const url = asString(getValueAtPath(entry, source.mapping.urlPath));

    if (!title || !url) {
      return;
    }

    const publishedAt = source.mapping.datePath
      ? asString(getValueAtPath(entry, source.mapping.datePath))
      : undefined;
    const summary = source.mapping.summaryPath
      ? asString(getValueAtPath(entry, source.mapping.summaryPath))
      : undefined;
    const authors = source.mapping.authorsPath
      ? asStringArray(getValueAtPath(entry, source.mapping.authorsPath))
      : undefined;
    const tags = source.mapping.tagsPath
      ? asStringArray(getValueAtPath(entry, source.mapping.tagsPath))
      : undefined;

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
