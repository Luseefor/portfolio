import type { ChestPOI } from '@/constants/dungeonLayout';
import {
  KONAMI_HINT_FRAGMENTS,
  KONAMI_HINT_STORAGE_KEY,
  getChestContentDefinition,
} from '@/components/interactive/dungeon/ui/chest-content/registry';

export type HintProgressState = {
  nextStep: number;
  discoveredSteps: number[];
  discoveredChestIds: ChestPOI['id'][];
};

export type HintProgressUpdate = {
  next: HintProgressState;
  unlockedStep: number | null;
  completedNow: boolean;
};

const TOTAL_HINT_STEPS = KONAMI_HINT_FRAGMENTS.length;

export function getInitialHintProgress(): HintProgressState {
  return {
    nextStep: 1,
    discoveredSteps: [],
    discoveredChestIds: [],
  };
}

function normalizeStep(step: unknown) {
  if (typeof step !== 'number' || !Number.isFinite(step)) return 1;
  return Math.min(TOTAL_HINT_STEPS + 1, Math.max(1, Math.floor(step)));
}

function isKnownChestId(value: unknown): value is ChestPOI['id'] {
  if (typeof value !== 'string') return false;
  return getChestContentDefinition(value as ChestPOI['id']) !== null;
}

export function parseHintProgress(rawValue: string | null): HintProgressState {
  if (!rawValue) return getInitialHintProgress();

  try {
    const parsed = JSON.parse(rawValue) as Partial<HintProgressState>;
    const discoveredSteps = Array.isArray(parsed.discoveredSteps)
      ? parsed.discoveredSteps
          .filter((value): value is number => typeof value === 'number' && value >= 1)
          .map((value) => Math.floor(value))
          .filter((value, index, all) => all.indexOf(value) === index)
          .sort((a, b) => a - b)
      : [];

    const discoveredChestIds = Array.isArray(parsed.discoveredChestIds)
      ? parsed.discoveredChestIds.filter(isKnownChestId)
      : [];

    const nextStep = normalizeStep(parsed.nextStep);

    return {
      nextStep,
      discoveredSteps,
      discoveredChestIds,
    };
  } catch {
    return getInitialHintProgress();
  }
}

export function readHintProgressFromStorage(): HintProgressState {
  if (typeof window === 'undefined') return getInitialHintProgress();
  return parseHintProgress(window.localStorage.getItem(KONAMI_HINT_STORAGE_KEY));
}

export function persistHintProgress(progress: HintProgressState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KONAMI_HINT_STORAGE_KEY, JSON.stringify(progress));
}

export function clearHintProgressStorage() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KONAMI_HINT_STORAGE_KEY);
}

export function computeHintProgressUpdate(
  current: HintProgressState,
  chestId: ChestPOI['id'],
): HintProgressUpdate {
  const definition = getChestContentDefinition(chestId);
  if (!definition) {
    return { next: current, unlockedStep: null, completedNow: false };
  }

  if (current.discoveredChestIds.includes(chestId)) {
    return { next: current, unlockedStep: definition.hint.step, completedNow: false };
  }

  if (definition.hint.step !== current.nextStep) {
    return { next: current, unlockedStep: null, completedNow: false };
  }

  const discoveredSteps = [...current.discoveredSteps, definition.hint.step].sort((a, b) => a - b);
  const discoveredChestIds = [...current.discoveredChestIds, chestId];
  const nextStep = Math.min(TOTAL_HINT_STEPS + 1, current.nextStep + 1);
  const completedNow = discoveredSteps.length === TOTAL_HINT_STEPS;

  return {
    next: {
      nextStep,
      discoveredSteps,
      discoveredChestIds,
    },
    unlockedStep: definition.hint.step,
    completedNow,
  };
}
