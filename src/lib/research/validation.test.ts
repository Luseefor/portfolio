import { describe, expect, it } from 'vitest';
import {
  validateCreateSourceConfig,
  validatePatchSourceConfig,
} from '@/lib/research/validation';

const BASE_SOURCE_PAYLOAD = {
  id: 'arxiv',
  name: 'arXiv',
  endpoint: 'https://example.com/feed',
  method: 'GET',
  authType: 'none',
  kind: 'paper',
  timeoutMs: 10_000,
  priority: 1,
  mapping: {
    itemsPath: 'items',
    titlePath: 'title',
    urlPath: 'url',
  },
} as const;

describe('validateCreateSourceConfig', () => {
  it('accepts a valid create payload', () => {
    const result = validateCreateSourceConfig(BASE_SOURCE_PAYLOAD);
    expect(result.error).toBeUndefined();
    expect(result.value?.id).toBe('arxiv');
    expect(result.value?.method).toBe('GET');
  });

  it('rejects invalid enum values and numeric values', () => {
    const invalidMethod = validateCreateSourceConfig({
      ...BASE_SOURCE_PAYLOAD,
      method: 'PATCH',
    });
    expect(invalidMethod.error).toBe('id, name, endpoint, method, authType, and kind are required.');

    const invalidTimeout = validateCreateSourceConfig({
      ...BASE_SOURCE_PAYLOAD,
      timeoutMs: 0,
    });
    expect(invalidTimeout.error).toBe('timeoutMs must be a positive number.');
  });
});

describe('validatePatchSourceConfig', () => {
  it('supports clearing optional maps using null', () => {
    const result = validatePatchSourceConfig({
      headers: null,
      query: null,
    });

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({
      headers: undefined,
      query: undefined,
    });
  });

  it('rejects unknown patch fields and invalid enums', () => {
    const noFields = validatePatchSourceConfig({});
    expect(noFields.error).toBe('No valid fields were provided to patch.');

    const invalidAuthType = validatePatchSourceConfig({ authType: 'token' });
    expect(invalidAuthType.error).toBe('authType must be none, bearer, or header.');
  });
});
