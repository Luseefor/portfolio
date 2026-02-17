import type { ChestPOI } from '@/constants/dungeonLayout';

export type ChestContentKind =
  | 'about'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'services'
  | 'activity'
  | 'resume'
  | 'contact'
  | 'socials';

export type ChestHintKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B';

export type ChestHintFragment = {
  step: number;
  key: ChestHintKey;
  chestId: ChestPOI['id'];
};

export type ChestContentDefinition = {
  chestId: ChestPOI['id'];
  kind: ChestContentKind;
  title: string;
  subtitle: string;
  hint: ChestHintFragment;
};

export const KONAMI_HINT_FRAGMENTS: ChestHintFragment[] = [
  { step: 1, key: 'UP', chestId: 'spawn-hall-cache-west' },
  { step: 2, key: 'UP', chestId: 'spawn-hall-cache-east' },
  { step: 3, key: 'DOWN', chestId: 'anteroom-chest' },
  { step: 4, key: 'DOWN', chestId: 'crossroads-chest' },
  { step: 5, key: 'LEFT', chestId: 'chapel-relic-west' },
  { step: 6, key: 'RIGHT', chestId: 'chapel-relic-east' },
  { step: 7, key: 'LEFT', chestId: 'western-cell-chest' },
  { step: 8, key: 'RIGHT', chestId: 'reliquary-chest' },
  { step: 9, key: 'B', chestId: 'treasury-vault-west' },
  { step: 10, key: 'A', chestId: 'east-watch-chest' },
];

export const CHEST_CONTENT_DEFINITIONS: ChestContentDefinition[] = [
  {
    chestId: 'spawn-hall-cache-west',
    kind: 'about',
    title: 'About Me',
    subtitle: 'Origin signal from the primary archive.',
    hint: KONAMI_HINT_FRAGMENTS[0],
  },
  {
    chestId: 'spawn-hall-cache-east',
    kind: 'experience',
    title: 'Experience',
    subtitle: 'Career checkpoints and execution history.',
    hint: KONAMI_HINT_FRAGMENTS[1],
  },
  {
    chestId: 'anteroom-chest',
    kind: 'education',
    title: 'Education',
    subtitle: 'Academic progression dossier.',
    hint: KONAMI_HINT_FRAGMENTS[2],
  },
  {
    chestId: 'crossroads-chest',
    kind: 'projects',
    title: 'Projects',
    subtitle: 'Production and research builds.',
    hint: KONAMI_HINT_FRAGMENTS[3],
  },
  {
    chestId: 'chapel-relic-west',
    kind: 'skills',
    title: 'Skills & Stack',
    subtitle: 'Core technologies and systems capabilities.',
    hint: KONAMI_HINT_FRAGMENTS[4],
  },
  {
    chestId: 'chapel-relic-east',
    kind: 'services',
    title: 'Services',
    subtitle: 'Value lanes and delivery modes.',
    hint: KONAMI_HINT_FRAGMENTS[5],
  },
  {
    chestId: 'western-cell-chest',
    kind: 'activity',
    title: 'Engineering Activity',
    subtitle: 'Live operational cadence and outputs.',
    hint: KONAMI_HINT_FRAGMENTS[6],
  },
  {
    chestId: 'reliquary-chest',
    kind: 'resume',
    title: 'Resume',
    subtitle: 'Condensed role-ready packet.',
    hint: KONAMI_HINT_FRAGMENTS[7],
  },
  {
    chestId: 'treasury-vault-west',
    kind: 'contact',
    title: 'Contact',
    subtitle: 'Direct communication uplink.',
    hint: KONAMI_HINT_FRAGMENTS[8],
  },
  {
    chestId: 'east-watch-chest',
    kind: 'socials',
    title: 'Social Links',
    subtitle: 'Professional channels and public identity.',
    hint: KONAMI_HINT_FRAGMENTS[9],
  },
];

const DEFINITION_BY_CHEST_ID: Record<ChestPOI['id'], ChestContentDefinition> =
  CHEST_CONTENT_DEFINITIONS.reduce(
    (accumulator, definition) => {
      accumulator[definition.chestId] = definition;
      return accumulator;
    },
    {} as Record<ChestPOI['id'], ChestContentDefinition>,
  );

export function getChestContentDefinition(chestId: ChestPOI['id']) {
  return DEFINITION_BY_CHEST_ID[chestId] ?? null;
}

export const KONAMI_HINT_STORAGE_KEY = 'interactiveKonamiHintProgressV1';
