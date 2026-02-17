const TOKEN_REGEX = /([^[.\]]+)|\[(\d+)\]/g;

export function getValueAtPath(target: unknown, pathExpression: string): unknown {
  if (!pathExpression || pathExpression === '.') return target;

  const tokens = Array.from(pathExpression.matchAll(TOKEN_REGEX)).map((match) =>
    typeof match[2] === 'string' ? Number(match[2]) : match[1],
  );

  if (tokens.length === 0) {
    return undefined;
  }

  let cursor: unknown = target;
  for (const token of tokens) {
    if (cursor == null) {
      return undefined;
    }

    if (typeof token === 'number') {
      if (!Array.isArray(cursor)) {
        return undefined;
      }
      cursor = cursor[token];
      continue;
    }

    if (typeof cursor !== 'object') {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[token];
  }

  return cursor;
}
