import { describe, expect, it } from 'vitest';
import {
  CHEST_CONTENT_DEFINITIONS,
  KONAMI_HINT_FRAGMENTS,
} from '@/components/interactive/dungeon/ui/chest-content/registry';

describe('chest content registry', () => {
  it('matches the fixed ten-step hint order and chest mapping', () => {
    const expected = [
      ['spawn-hall-cache-west', 1, 'UP'],
      ['spawn-hall-cache-east', 2, 'UP'],
      ['anteroom-chest', 3, 'DOWN'],
      ['crossroads-chest', 4, 'DOWN'],
      ['chapel-relic-west', 5, 'LEFT'],
      ['chapel-relic-east', 6, 'RIGHT'],
      ['western-cell-chest', 7, 'LEFT'],
      ['reliquary-chest', 8, 'RIGHT'],
      ['treasury-vault-west', 9, 'B'],
      ['east-watch-chest', 10, 'A'],
    ] as const;

    expect(KONAMI_HINT_FRAGMENTS).toHaveLength(10);
    expect(KONAMI_HINT_FRAGMENTS.map((fragment) => [fragment.chestId, fragment.step, fragment.key])).toEqual(
      expected,
    );
  });

  it('contains one content definition per chest with unique content kinds', () => {
    expect(CHEST_CONTENT_DEFINITIONS).toHaveLength(10);

    const chestIds = CHEST_CONTENT_DEFINITIONS.map((item) => item.chestId);
    const kinds = CHEST_CONTENT_DEFINITIONS.map((item) => item.kind);

    expect(new Set(chestIds).size).toBe(10);
    expect(new Set(kinds).size).toBe(10);
  });
});
