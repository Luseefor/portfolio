import { describe, expect, it } from 'vitest';
import {
  computeHintProgressUpdate,
  getInitialHintProgress,
  parseHintProgress,
} from '@/components/interactive/dungeon/ui/chest-content/hints';

describe('chest hint progression', () => {
  it('advances when opening the correct next chest in sequence', () => {
    const start = getInitialHintProgress();
    const first = computeHintProgressUpdate(start, 'spawn-hall-cache-west');

    expect(first.unlockedStep).toBe(1);
    expect(first.next.nextStep).toBe(2);
    expect(first.next.discoveredSteps).toEqual([1]);
    expect(first.next.discoveredChestIds).toEqual(['spawn-hall-cache-west']);
  });

  it('does not advance when opening an out-of-order chest', () => {
    const start = getInitialHintProgress();
    const result = computeHintProgressUpdate(start, 'anteroom-chest');

    expect(result.unlockedStep).toBeNull();
    expect(result.completedNow).toBe(false);
    expect(result.next).toEqual(start);
  });

  it('still enforces order after progress has started', () => {
    const first = computeHintProgressUpdate(getInitialHintProgress(), 'spawn-hall-cache-west');
    const outOfOrder = computeHintProgressUpdate(first.next, 'crossroads-chest');

    expect(outOfOrder.unlockedStep).toBeNull();
    expect(outOfOrder.next.nextStep).toBe(2);
    expect(outOfOrder.next.discoveredSteps).toEqual([1]);
    expect(outOfOrder.next.discoveredChestIds).toEqual(['spawn-hall-cache-west']);
  });

  it('marks completion after all ten hints are recovered', () => {
    const chestOrder = [
      'spawn-hall-cache-west',
      'spawn-hall-cache-east',
      'anteroom-chest',
      'crossroads-chest',
      'chapel-relic-west',
      'chapel-relic-east',
      'western-cell-chest',
      'reliquary-chest',
      'treasury-vault-west',
      'east-watch-chest',
    ] as const;

    let state = getInitialHintProgress();
    let completionFlag = false;

    chestOrder.forEach((chestId) => {
      const result = computeHintProgressUpdate(state, chestId);
      state = result.next;
      completionFlag = completionFlag || result.completedNow;
    });

    expect(completionFlag).toBe(true);
    expect(state.discoveredSteps).toHaveLength(10);
    expect(state.nextStep).toBe(11);
  });

  it('parses invalid persisted state defensively', () => {
    const parsed = parseHintProgress('{"nextStep":"oops","discoveredSteps":[1,"x"],"discoveredChestIds":[null]}');

    expect(parsed.nextStep).toBe(1);
    expect(parsed.discoveredSteps).toEqual([1]);
    expect(parsed.discoveredChestIds).toEqual([]);
  });
});
